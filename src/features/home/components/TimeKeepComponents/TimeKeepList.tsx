/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import timeKeepApi from '@/api/timeKeepApi';
import { RangeCalendarField } from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { InfoTimeKeep, ListResponse, QueryParam, RawTimeSheet } from '@/models';
import { ConvertQueryParam } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { addDays, addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash';
import queryString from 'query-string';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { DataSetter } from '../ScheduleComponents';
import { STATIC_HOST } from '@/constants';
import { Tag, TagInput } from '@/components/ui/tag-input';
interface FilterDateForm {
    dateRange?: string;
}
interface FilterDate {
    from: string;
    to: string;
}
function getFirstDayOfMonth(year: number, month: number): Date {
    return startOfMonth(new Date(year, month - 1));
}

// Hàm để lấy ngày cuối cùng của tháng trong một năm bất kỳ
function getLastDayOfMonth(year: number, month: number): Date {
    return endOfMonth(new Date(year, month - 1));
}
function generateDateArray(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = start;
    while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }
    return dates;
}
export const TimeKeepList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const defYear = new Date().getFullYear();
    const [listJob, setListJob] = React.useState<InfoTimeKeep[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [pageCount, setPageCount] = React.useState<number>();
    const [loadingTable, setLoadingTable] = React.useState(false);
    const [query, setQuery] = React.useState<string>('');
    const [queryLodash, setQueryLodash] = React.useState<string>('');
    const param = queryString.parse(location.search);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const { toast } = useToast();
    const [filterDate, setFilterDate] = React.useState<FilterDate | undefined>();
    const [dataTask, setDataTask] = React.useState<InfoTimeKeep>();
    const [userTasks, setUserTasks] = React.useState<Tag[]>([]);
    const [openTask, setOpenTask] = React.useState(false);

    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'id', desc: true }]);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addMonths(new Date(), 1),
    });
    const [exportLoading, setExportLoading] = React.useState(false);
    const debouncedSetQuery = React.useCallback(
        debounce((value) => setQuery(value), 500),
        []
    );
    const handleNavigateQuery = () => {
        let paramObject: QueryParam = {};
        if (filterDate) {
            paramObject = {
                query: query,
                pageIndex: pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
                sort_by: sorting[0].id,
                asc: !sorting[0].desc,
                filters: columnFilters,
                from: filterDate.from,
                to: filterDate.to,
            };
        } else {
            paramObject = {
                query: query,
                pageIndex: pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
                sort_by: sorting[0].id,
                asc: !sorting[0].desc,
                filters: columnFilters,
            };
        }
        const newSearch = ConvertQueryParam(paramObject);
        navigate({ search: newSearch });
        location.search = newSearch;
    };

    const columns: ColumnDef<InfoTimeKeep>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã chấm công" />,
            cell: ({ row }) => <div className="ml-2">{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'UserID',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã nhân viên" />,
            cell: ({ row }) => <div>{row.getValue('UserID')}</div>,
        },
        {
            accessorKey: 'EmpName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhân viên" />,
            cell: ({ row }) => <div>{row.getValue('EmpName')}</div>,
        },
        {
            accessorKey: 'TimeIn',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ đến" />,
            cell: ({ row }) => <div>{format(row.getValue('TimeIn'), 'dd/MM/yyyy hh:mm:ss')}</div>,
        },
        {
            accessorKey: 'TimeOut',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ về" />,
            cell: ({ row }) => (
                <div>
                    {row.getValue('TimeOut')
                        ? format(row.getValue('TimeOut'), 'dd/MM/yyyy hh:mm:ss')
                        : 'Chưa check out'}
                </div>
            ),
        },
        {
            accessorKey: 'Late',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số giờ muộn" />,
            cell: ({ row }) => <div>{(row.getValue('Late') || 0) + ' Giờ'}</div>,
        },
        {
            accessorKey: 'WorkHour',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số giờ làm" />,
            cell: ({ row }) => <div>{(row.getValue('WorkHour') || 0) + ' Giờ'}</div>,
        },
        {
            accessorKey: 'Tasks',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Công việc" />,
            cell: ({ row }) => <div>{(row.getValue('Tasks') as any[])?.length}</div>,
        },
    ];
    const fetchData = async () => {
        try {
            setLoadingTable(true);

            const parsed = queryString.parse(
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const timeKeepData = (await timeKeepApi.getListTimeKeepAll(
                parsed
            )) as unknown as ListResponse;
            setListJob(timeKeepData.data);
            setTotalRow(timeKeepData.total_rows);
            setPageCount(Math.ceil(timeKeepData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    const [dataSetter, setDataSetter] = React.useState<DataSetter>({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    });
    React.useEffect(() => {
        handleNavigateQuery();
        fetchData();
    }, [query, sorting, columnFilters, pagination, filterDate]);

    const table = useReactTable({
        data: listJob,
        columns,
        pageCount,
        manualPagination: true,
        autoResetPageIndex: false,
        manualSorting: true,
        manualFiltering: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            pagination,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const setIp = () => {
        (async () => {
            try {
                await timeKeepApi.setIp();
                toast({
                    title: 'Thành công',
                    description: 'Đặt lại IP thành công',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Thất bại',
                    description: 'IP Không đổi',
                });
            }
        })();
    };
    const schema_date = yup.object().shape({
        dateRange: yup
            .string()
            .test('Check-end-date', 'Cần đủ ngày bắt đầu và ngày kết thúc', (value) => {
                if (!value) {
                    return true;
                }
                if (value) {
                    const [startDate, endDate] = value.split('-');
                    if (startDate && endDate) {
                        return true;
                    }
                    if (startDate && !endDate) {
                        return new yup.ValidationError('Cần chọn ngày kết thúc', null, 'dateRange');
                    }
                    if (!startDate && endDate) {
                        return new yup.ValidationError('Cần chọn ngày bắt đầu', null, 'dateRange');
                    }
                }
            }),
    });
    const FormDateFilter = useForm<FilterDateForm>({
        resolver: yupResolver(schema_date),
    });
    const handleFilter: SubmitHandler<FilterDateForm> = (data) => {
        if (data.dateRange) {
            const [startDateString, endDateString]: string[] = data.dateRange.split('-');

            // Convert each part into yyyy-mm-dd format
            const convertToISODate = (dateString: string): string => {
                const [day, month, year]: string[] = dateString.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            };
            const startDateISO: string = convertToISODate(startDateString);
            const endDateISO: string = convertToISODate(endDateString);
            setFilterDate({ from: startDateISO, to: endDateISO });
        } else {
            setFilterDate(undefined);
        }
        (async () => {
            try {
                setLoadingTable(true);
                const parsed = queryString.parse(
                    location.search ? location.search : '?pageIndex=1&pageSize=10&query='
                ) as unknown as QueryParam;
                const timeKeepData = (await timeKeepApi.getListTimeKeepAll(
                    parsed
                )) as unknown as ListResponse;
                setListJob(timeKeepData.data);
                setTotalRow(timeKeepData.total_rows);
                setPageCount(timeKeepData.current_page);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingTable(false);
            }
        })();
    };
    const handleExport2 = () => {
        (async () => {
            if (date && date.from && date.to) {
                window.open(`${STATIC_HOST}timesheet/timesheet-infor?from=${format(date.from, 'yyyy-MM-dd')}&to=${format(date.to, 'yyyy-MM-dd')}`, "_blank", "noreferrer")
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Yêu cầu chọn khoảng ngày',
                });
            }
        })();
    };
    const exportToExcel = () => {
        // Tạo một workbook mới
        const firstDay = getFirstDayOfMonth(dataSetter.year, dataSetter.month);
        const lastDay = getLastDayOfMonth(dataSetter.year, dataSetter.month);
        const dateArray = generateDateArray(firstDay, lastDay);
        (async () => {
            try {
                setExportLoading(true);
                const parsed = queryString.parse(
                    `?from=${format(
                        getFirstDayOfMonth(dataSetter.year, dataSetter.month),
                        'yyyy-MM-dd'
                    )}&to=${format(
                        getLastDayOfMonth(dataSetter.year, dataSetter.month),
                        'yyyy-MM-dd'
                    )}`
                ) as unknown as QueryParam;
                const res = (await timeKeepApi.getListTimeKeepAllRaw(parsed)) as unknown as {
                    data: RawTimeSheet[];
                };
                const { data } = res;
                if (data.length === 0) {
                    toast({
                        variant: 'destructive',
                        title: 'Dữ liệu trống',
                    });
                    return;
                }
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(
                    `Bảng chấm công tháng ${dataSetter.month} năm ${dataSetter.year}`
                );
                const header1_a = [
                    'Mã nhân viên',
                    'Tên nhân viên',
                    'Số điện thoại',
                    'Email',
                    'Tên tài khoản',
                    'Số tài khoản',
                    'Phòng ban',
                    'Vai trò',
                    'Công việc',
                ];

                const nullHeader = Array.from({ length: 9 }, () => '');
                const dataDate = dateArray.map((date) => [format(date, 'yyyy-MM-dd'), '']).flat();
                const header1_w = worksheet.addRow(header1_a.concat(dataDate));
                header1_w.eachCell((cell, colNumber) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' }, // Màu vàng
                    };
                    cell.font = {
                        bold: true,
                    };
                    cell.alignment = {
                        horizontal: 'center',
                        vertical: colNumber <= 9 ? 'middle' : 'bottom',
                    };
                });
                const header2_a = dateArray.map((_, i) => [String(i + 1), '']).flat();
                console.log(header2_a);
                const header2_w = worksheet.addRow(nullHeader.concat(header2_a));
                worksheet.addRow(
                    nullHeader.concat(dataDate.map((_, i) => (i % 2 === 0 ? 'HS Muộn' : 'HS Làm')))
                );
                header2_w.eachCell((cell, colNumber) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ccc0da' }, // Màu vàng
                    };
                    cell.font = {
                        bold: true,
                    };
                    cell.alignment = {
                        horizontal: 'center',
                        vertical: colNumber <= 9 ? 'middle' : 'bottom',
                    };
                });

                for (let i = 0; i < header1_a.length; i++) {
                    worksheet.mergeCells(1, i + 1, 3, i + 1);
                }
                for (let i = 9; i < dataDate.length + 9; i = i + 2) {
                    worksheet.mergeCells(1, i + 1, 1, i + 2);
                }
                for (let i = 9; i < header2_a.length + 9; i = i + 2) {
                    worksheet.mergeCells(2, i + 1, 2, i + 2);
                }
                for (const dataQuery of data) {
                    const rowData: any[] = [
                        dataQuery.UserID,
                        dataQuery.EmpName,
                        dataQuery.Phone,
                        dataQuery.Email,
                        dataQuery.BankName,
                        dataQuery.BankAccountNumber,
                        dataQuery.DepName,
                        dataQuery.RoleName,
                        dataQuery.JobName,
                    ];
                    let i = 1;
                    for (const dateKey in dataQuery.DateValue) {
                        if (Object.prototype.hasOwnProperty.call(dataQuery.DateValue, dateKey)) {
                            const dateValue = dataQuery.DateValue[dateKey];
                            const idx = dataDate.findIndex((item) => item === dateKey);
                            while (i < idx + 1) {
                                rowData.push(0);
                                i++;
                            }
                            i = i + 2;
                            rowData.push(dateValue.total_late);
                            rowData.push(dateValue.total_workhour);
                        }
                    }
                    worksheet.addRow(rowData);
                }
                worksheet.views = [
                    {
                        state: 'frozen', // Bảng tính sẽ không cuộn khi di chuyển nếu thiết lập 'frozen'
                        xSplit: 9, // Số cột sẽ được giữ cố định
                        showGridLines: true, // Hiển thị các đường kẻ
                    },
                ];
                // Thêm dữ liệu vào worksheet
                workbook.xlsx.writeBuffer().then((buffer) => {
                    // Tạo Blob từ buffer
                    const blob = new Blob([buffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });
                    // Tải file xuống
                    saveAs(blob, `BangChamCongT${dataSetter.month}Y${dataSetter.year}.xlsx`);
                });
            } catch (error) {
                console.log(error);
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra thử lại sau',
                });
            } finally {
                setExportLoading(false);
            }
        })();
    };
    return (
        <div className="w-full space-y-4">
              <Dialog open={openTask} onOpenChange={setOpenTask}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Task của {dataTask?.EmpName}</DialogTitle>
                        <DialogDescription>
                            Tạo các công việc làm trong ngày bằng cách nhập rồi ấn enter để tạo
                        </DialogDescription>
                    </DialogHeader>
                    <TagInput
                        placeholder="Enter a task"
                        tags={userTasks}
                        autoFocus={true}
                        is_checkin={false}
                        className="sm:min-w-[450px]"
                        setTags={(newTags) => {
                            setUserTasks(newTags);
                        }}
                        disabled={
                            dataTask
                                ? format(dataTask?.TimeIn, 'dd/MM/yyyy') !==
                                  format(new Date(), 'dd/MM/yyyy')
                                : false
                        }
                    />
                    
                </DialogContent>
            </Dialog>
            <div className="flex items-center">
                <div className="flex flex-row gap-4">
                    <Input
                        placeholder="Tìm kiếm trên bảng..."
                        value={queryLodash}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = event.target;
                            setQueryLodash(value);
                            debouncedSetQuery(value);
                        }}
                    />
                    <Form {...FormDateFilter}>
                        <form onSubmit={FormDateFilter.handleSubmit(handleFilter)}>
                            <div className="flex flex-row gap-3">
                                <RangeCalendarField
                                    name="dateRange"
                                    placeholder="Chọn khoảng ngày"
                                    disableDate={false}
                                />
                                <Button type="submit" className="flex flex-row gap-2">
                                    <Icons.filter className="dark:white white" /> Lọc
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button disabled={exportLoading} className="flex gap-3">
                                {exportLoading ? (
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Icons.sheet />
                                )}{' '}
                                Xuất dữ liệu
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Chọn khoảng thời gian xuất dữ liệu</DialogTitle>
                                <DialogDescription>
                                    Nhập tháng và năm cần xuất dữ liệu
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Tháng: </Label>
                                    <Select
                                        value={dataSetter.month.toString()}
                                        onValueChange={(value) =>
                                            setDataSetter({ ...dataSetter, month: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i + 1} value={`${i + 1}`}>
                                                    {i + 1}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Năm: </Label>
                                    <Select
                                        value={dataSetter.year.toString()}
                                        onValueChange={(value) =>
                                            setDataSetter({ ...dataSetter, year: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 6 }, (_, i) => (
                                                <SelectItem key={i} value={`${defYear - 2 + i}`}>
                                                    {defYear - 2 + i}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Đóng</Button>
                                </DialogClose>
                                <Button onClick={exportToExcel} className="flex gap-3">
                                    <Icons.sheet />
                                    Xuất dữ liệu 
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={setIp} className="flex gap-3">
                        <Icons.wifi />
                        Đặt lại IP
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button disabled={exportLoading} className="flex gap-3">
                                {exportLoading ? (
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Icons.sheet />
                                )}{' '}
                                Xuất dữ liệu 2
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Chọn khoảng thời gian xuất dữ liệu</DialogTitle>
                                <DialogDescription>
                                    Nhập tháng và năm cần xuất dữ liệu
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className={cn('grid gap-2')}>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-[300px] justify-start text-left font-normal',
                                                        !date && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date?.from ? (
                                                        date.to ? (
                                                            <>
                                                                {format(date.from, 'LLL dd, y')} -{' '}
                                                                {format(date.to, 'LLL dd, y')}
                                                            </>
                                                        ) : (
                                                            format(date.from, 'LLL dd, y')
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={date?.from}
                                                    selected={date}
                                                    onSelect={setDate}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Đóng</Button>
                                </DialogClose>
                                <Button onClick={handleExport2} className="flex gap-3">
                                    <Icons.sheet />
                                    Xuất dữ liệu 2
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <DataTableViewOptions table={table} />
            </div>
            <div className="rounded-md border">
                <ScrollArea style={{ height: 'calc(100vh - 270px)' }} className=" relative w-full">
                    <Table>
                        <TableHeader className="sticky top-0 z-[2] bg-[hsl(var(--background))]">
                            {table.getHeaderGroups().map((headerGroup: any) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header: any) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        {!loadingTable && (
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            onClick={() => {
                                                setDataTask(row.original);
                                                const tagCv = row.original.Tasks.map((item) => ({
                                                    id: item.id,
                                                    text: item.WorkPlan,
                                                    is_complete: item.IsComplete,
                                                    old: true,
                                                }));
                                                setUserTasks(tagCv);
                                                setOpenTask(true);
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        )}
                    </Table>
                    {loadingTable && (
                        <div
                            style={{ height: 'calc(100vh - 220px)' }}
                            className="w-full flex items-center justify-center"
                        >
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Đang tải
                        </div>
                    )}
                </ScrollArea>
            </div>
            <DataTablePagination disableSelected={true} table={table} totalRow={totalRow || 0} />
        </div>
    );
};
