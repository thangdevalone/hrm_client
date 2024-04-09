/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import leaveApi from '@/api/leaveApi';
import {
    RangeCalendarField,
    SearchField,
    SelectionField,
    TextareaField,
} from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { DataTableFilter } from '@/components/common/DataTableFilter';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectItem } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { STATIC_HOST } from '@/constants';
import { useInfoUser } from '@/hooks';
import { cn } from '@/lib/utils';
import { InfoLeave, LeaveCreateForm, LeaveEditForm, ListResponse, QueryParam } from '@/models';
import { ConvertQueryParam, colorBucket } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarIcon, DotsHorizontalIcon, PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
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
import { addMonths, format } from 'date-fns';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import queryString from 'query-string';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

export interface RootLeaveCount {
    [key: string]: Ngh;
}
export interface Ngh {
    cho_phep: number;
    da_dung: number;
    cho_xac_nhan: number;
    cho_phe_duyet: number;
    kha_dung: number;
}
export const LeaveList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listLeave, setListLeave] = React.useState<InfoLeave[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [pageCount, setPageCount] = React.useState<number>();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [loadingTable, setLoadingTable] = React.useState(false);
    const [query, setQuery] = React.useState<string>('');
    const [queryLodash, setQueryLodash] = React.useState<string>('');
    const param = queryString.parse(location.search);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const { toast } = useToast();
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'LeaveRequestID', desc: false },
    ]);
    const [selectRowDelete, setSelectRowDelete] = React.useState<InfoLeave | null>(null);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
    const [openEditForm, setOpenEditForm] = React.useState<boolean>(false);
    const [openCreateForm, setOpenCreateForm] = React.useState<boolean>(false);
    const [openDeleteForm, setOpenDeleteForm] = React.useState<boolean>(false);
    const [remain, setRemain] = React.useState<RootLeaveCount>();

    const debouncedSetQuery = React.useCallback(
        debounce((value) => setQuery(value), 500),
        []
    );
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addMonths(new Date(), 1),
    });
    const handleExport2 = () => {
        (async () => {
            if (date && date.from && date.to) {
                window.open(
                    `${STATIC_HOST}leave/leave-infor?from=${format(
                        date.from,
                        'yyyy-MM-dd'
                    )}&to=${format(date.to, 'yyyy-MM-dd')}`,
                    '_blank',
                    'noreferrer'
                );
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Yêu cầu chọn khoảng ngày',
                });
            }
        })();
    };
    const handleNavigateQuery = () => {
        const paramObject: QueryParam = {
            query: query,
            pageIndex: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            sort_by: sorting[0].id,
            asc: !sorting[0].desc,
            filters: columnFilters,
        };
        const newSearch = ConvertQueryParam(paramObject);
        navigate({ search: newSearch });
        location.search = newSearch;
    };
    const columns: ColumnDef<InfoLeave>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)
                    }
                    className="ml-2"
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="ml-2"
                />
            ),
            enableHiding: false,
        },
        {
            accessorKey: 'LeaveRequestID',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đơn" />,
            cell: ({ row }) => <div>{row.getValue('LeaveRequestID')}</div>,
        },
  
        {
            accessorKey: 'EmpName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhân viên" />,
            cell: ({ row }) => <div>{row.getValue('EmpName')}</div>,
        },
        {
            accessorKey: 'LeaveStartDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" />,
            cell: ({ row }) => <div>{dayjs(row.getValue('LeaveStartDate')).format('DD/MM/YYYY')}</div>,
        },
        {
            accessorKey: 'LeaveEndDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" />,
            cell: ({ row }) => <div>{dayjs(row.getValue('LeaveEndDate')).format('DD/MM/YYYY')}</div>,
        },
        {
            accessorKey: 'LeaveTypeName',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Loại nghỉ phép" />
            ),
            cell: ({ row }) => <div>{row.getValue('LeaveTypeName')}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'Reason',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Lý do" />,
            cell: ({ row }) => <div>{row.getValue('Reason')}</div>,
            enableSorting: false,
        },
        {
            accessorKey: 'LeaveStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => (
                <Badge
                    className={`${
                        colorBucket[row.getValue('LeaveStatus') as keyof typeof colorBucket]
                    } hover:${
                        colorBucket[row.getValue('LeaveStatus') as keyof typeof colorBucket]
                    }`}
                >
                    {row.getValue('LeaveStatus')}
                </Badge>
            ),
            enableSorting: false,
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleValueEdit(row.original)}
                                className="cursor-pointer"
                            >
                                Chỉnh sửa
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectRowDelete(row.original);
                                    setOpenDeleteForm(true);
                                }}
                                className="cursor-pointer"
                            >
                                Xóa đơn xin nghỉ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleValueEdit = (data: InfoLeave) => {
        const startDate=dayjs(data.LeaveStartDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
        const endDate=dayjs(data.LeaveEndDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
        formEdit.setValue('EmpID', data.EmpID);
        formEdit.setValue('LeaveRequestID', data.LeaveRequestID);
        formEdit.setValue('LeaveStartDate', startDate);
        formEdit.setValue('LeaveEndDate', endDate);
        formEdit.setValue(
            'leaveDate',
            `${startDate}-${endDate}`
        );
        formEdit.setValue('RawDateEnd',dayjs(data.LeaveEndDate).toDate())
        formEdit.setValue('RawDateStart',dayjs(data.LeaveStartDate).toDate())

        formEdit.setValue('Reason', data.Reason);
        formEdit.setValue('LeaveTypeID', data.LeaveTypeID);
        formEdit.setValue('LeaveStatus',data.LeaveStatus)
        setOpenEditForm(true);
    };
    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
    }, [query, sorting, columnFilters, pagination]);

    const table = useReactTable({
        data: listLeave,
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
    const user = useInfoUser();
    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const parsed = queryString.parse(
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const leaveData = (await leaveApi.getListLeave(
                parsed,
                user?.RoleName
            )) as unknown as ListResponse;
            setListLeave(leaveData.data);
            setTotalRow(leaveData.total_rows);
            setPageCount(Math.ceil(leaveData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    const schema_create = yup.object().shape({
        LeaveTypeID: yup.number().required('Cần chọn loại nghỉ'),
        LeaveStartDate: yup.string().notRequired(),
        LeaveEndDate: yup.string().notRequired(),
        leaveDate: yup
            .string()
            .required('Cần nhập ngày nghỉ phép')
            .test('Check-end-date', 'Cần đủ ngày bắt đầu và ngày kết thúc', (value) => {
                const [startDate, endDate] = value.split('-');
                if (startDate && endDate) {
                    return true;
                }
                if (startDate && !endDate) {
                    return new yup.ValidationError('Cần chọn ngày kết thúc', null, 'leaveDate');
                }
                if (!startDate && endDate) {
                    return new yup.ValidationError('Cần chọn ngày bắt đầu', null, 'leaveDate');
                }
                return new yup.ValidationError(
                    'Cần đủ ngày bắt đầu và ngày kết thúc',
                    null,
                    'leaveDate'
                );
            }),
        Reason: yup.string().required('Cần nhập lý do nghỉ'),
    });
    const formCreate = useForm<LeaveCreateForm>({
        resolver: yupResolver(schema_create) as Resolver<LeaveCreateForm, any>,
    });
    const schema_edit = yup.object().shape({
        LeaveTypeID: yup.number().required('Cần chọn loại nghỉ'),
        LeaveStartDate: yup.string().notRequired(),
        LeaveEndDate: yup.string().notRequired(),
        leaveDate: yup
            .string()
            .required('Cần nhập ngày nghỉ phép')
            .test('Check-end-date', 'Cần đủ ngày bắt đầu và ngày kết thúc', (value) => {
                const [startDate, endDate] = value.split('-');
                if (startDate && endDate) {
                    return true;
                }
                if (startDate && !endDate) {
                    return new yup.ValidationError('Cần chọn ngày kết thúc', null, 'leaveDate');
                }
                if (!startDate && endDate) {
                    return new yup.ValidationError('Cần chọn ngày bắt đầu', null, 'leaveDate');
                }
                return new yup.ValidationError(
                    'Cần đủ ngày bắt đầu và ngày kết thúc',
                    null,
                    'leaveDate'
                );
            }),
        Reason: yup.string().required('Cần nhập lý do nghỉ'),
        EmpID: yup.number().required('Mã nhân viên'),
        LeaveRequestID: yup.number().required('Mã đơn nghỉ phép'),
        RawDateStart:yup.date().notRequired(),
        RawDateEnd:yup.date().notRequired(), 
        LeaveStatus: yup.string().notRequired(),
    });
    
    const formEdit = useForm<LeaveEditForm>({
        resolver: yupResolver(schema_edit) as Resolver<LeaveEditForm, any>,
    });
    const handleEdit: SubmitHandler<LeaveEditForm> = (data) => {
        (async () => {
            try {
                if (data?.LeaveRequestID !== undefined) {
                    const [startDate, endDate] = data.leaveDate.split('-');
                    const newData = { LeaveStartDate: startDate, LeaveEndDate: endDate, ...data };
                    await leaveApi.editLeave(newData.LeaveRequestID,newData);
                    fetchData();
                    setOpenEditForm(false);
                    toast({
                        title: 'Thành công',
                        description: 'Sửa đơn nghỉ phép thành công',
                    });
                }
            } catch (error: any) {
                console.log({ error: error });
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.error,
                });
            } finally {
                setLoading(false);
            }
        })();
    };
    const handleCreate: SubmitHandler<LeaveCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                const [startDate, endDate] = data.leaveDate.split('-');
                const newData = { LeaveStartDate: startDate, LeaveEndDate: endDate, ...data };
                await leaveApi.createLeave(newData);
                fetchData();
                formCreate.reset();
                setOpenCreateForm(false);
                toast({
                    title: 'Thành công',
                    description: 'Tạo đơn nghỉ phép thành công',
                });
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.error,
                });
            } finally {
                setLoading(false);
            }
        })();
    };
    const handleOpenRemain = async () => {
        try {
            console.log(user?.EmpID);
            if (user?.EmpID || user?.EmpID === 0) {
                const res = (await leaveApi.leaveRemain(user?.EmpID)) as any;
                const remain = res?.leave_remainder as unknown as RootLeaveCount;
                setRemain(remain);
            } else return;
        } catch (error) {
            console.log(error);
        }
    };
    const handleDeleteJob = async (id: number | undefined) => {
        if (id === undefined) {
            setOpenDeleteForm(false);
            return;
        }
        try {
            setLoading(true);
            await leaveApi.deleteLeave(id);
            setSelectRowDelete(null);
            toast({
                title: 'Thành công',
                description: 'Xóa thành công',
            });
            setOpenDeleteForm(false);
            fetchData();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Có lỗi xảy ra',
                description: error.error,
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-row  gap-4">
                    <Input
                        placeholder="Tìm kiếm trên bảng..."
                        value={queryLodash}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = event.target;
                            setQueryLodash(value);
                            debouncedSetQuery(value);
                        }}
                    />
                    {table.getColumn('LeaveStatus') && (
                        <DataTableFilter
                            column={table.getColumn('LeaveStatus')}
                            title="Trạng thái"
                            options={[
                                {
                                    value: 'Chờ xác nhận',
                                    id: '0',
                                },
                                {
                                    value: 'Chờ phê duyệt',
                                    id: '1',
                                },
                                {
                                    value: 'Đã phê duyệt',
                                    id: '2',
                                },
                                {
                                    value: 'Đã từ chối',
                                    id: '3',
                                },
                            ]}
                            api=""
                        />
                    )}
                    {table.getColumn('LeaveTypeName') && (
                        <DataTableFilter
                            column={table.getColumn('LeaveTypeName')}
                            title="Loại nghỉ phép"
                            options={null}
                            api="leavetype"
                        />
                    )}
                        <Dialog>
                        <DialogTrigger asChild>
                            <Button className="flex gap-3">
                                <Icons.sheet /> Xuất dữ liệu 
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
                                    Xuất dữ liệu 
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={openCreateForm} onOpenChange={setOpenCreateForm}>
                        <DialogTrigger asChild>
                            <Button className="btn flex gap-2">
                                <PlusCircledIcon />
                                Tạo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader className="">
                                <DialogTitle className="text-xl uppercase">
                                    Tạo mới đơn nghỉ phép
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...formCreate}>
                                <form onSubmit={formCreate.handleSubmit(handleCreate)}>
                                    <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                        <SearchField
                                            name="LeaveTypeID"
                                            label="Loại nghỉ phép"
                                            placeholder="Chọn loại nghỉ phép"
                                            typeApi="leavetype"
                                            require={true}
                                        />
                                        <RangeCalendarField
                                            name="leaveDate"
                                            label="Ngày nghỉ phép"
                                            placeholder="Chọn ngày nghỉ phép"
                                            require={true}
                                        />
                                        <div className="col-span-2">
                                            <TextareaField
                                                name="Reason"
                                                label="Lý do"
                                                placeholder="Nhập lý do xin nghỉ"
                                                require={true}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="w-full sticky mt-4">
                                        <DialogClose asChild>
                                            <Button
                                                onClick={() => {
                                                    formCreate.reset();
                                                }}
                                                type="button"
                                                variant="outline"
                                            >
                                                Hủy
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={loading}>
                                            {loading && (
                                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                            )}{' '}
                                            Lưu
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-row gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenRemain}>Số ngày nghỉ phép còn lại</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl uppercase">
                                    Số lượng ngày nghỉ phép còn lại
                                </DialogTitle>
                            </DialogHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Loại</TableHead>
                                        <TableHead>Cho Phép</TableHead>
                                        <TableHead>Đã dùng</TableHead>
                                        <TableHead>Chờ xác nhận</TableHead>
                                        <TableHead>Chờ phê duyệt</TableHead>
                                        <TableHead>Khả dụng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {remain &&
                                        Object.keys(remain).map((type) => (
                                            <TableRow key={type}>
                                                <TableCell className="font-medium">
                                                    {type}
                                                </TableCell>
                                                <TableCell>{remain[type].cho_phep}</TableCell>
                                                <TableCell>{remain[type].da_dung}</TableCell>
                                                <TableCell>{remain[type].cho_xac_nhan}</TableCell>
                                                <TableCell>{remain[type].cho_phe_duyet}</TableCell>
                                                <TableCell>{remain[type].kha_dung}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <DialogFooter className="w-full sticky mt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Đóng
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <DataTableViewOptions table={table} />
                </div>
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
            <Dialog open={openDeleteForm} onOpenChange={setOpenDeleteForm}>
                <DialogContent>
                    <DialogHeader className="">
                        <DialogTitle>Xác nhận xóa đơn xin nghỉ?</DialogTitle>
                    </DialogHeader>
                    <p>Xóa đơn {selectRowDelete?.LeaveRequestID}</p>
                    <p>
                        Bạn có chắc chắn xóa đơn xin nghỉ{' '}
                        <strong>{selectRowDelete?.LeaveRequestID}</strong>?
                    </p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                onClick={() => {
                                    setOpenDeleteForm(false);
                                }}
                                type="button"
                                variant="outline"
                            >
                                Hủy
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            onClick={() => handleDeleteJob(selectRowDelete?.LeaveRequestID)}
                            disabled={loading}
                        >
                            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />} Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
                <DialogContent>
                    <DialogHeader className="">
                        <DialogTitle>Chỉnh sửa đơn nghỉ phép</DialogTitle>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                                <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                    <SearchField
                                        name="LeaveTypeID"
                                        label="Loại nghỉ phép"
                                        placeholder="Chọn loại nghỉ phép"
                                        typeApi="leavetype"
                                        require={true}
                                    />
                                    <RangeCalendarField
                                        name="leaveDate"
                                        label="Ngày nghỉ phép"
                                        placeholder="Chọn ngày nghỉ phép"
                                        require={true}
                                    />
                                    <div className="col-span-2">
                                        <TextareaField
                                            name="Reason"
                                            label="Lý do"
                                            placeholder="Nhập lý do xin nghỉ"
                                            require={true}
                                        />
                                    </div>
                                    {(user?.RoleName === 'Admin' || user?.RoleName === 'Hr') && (
                                        <SelectionField
                                            name="LeaveStatus"
                                            label="Trạng thái"
                                            placeholder="Chọn trạng thái"
                                        >
                                            <SelectItem value="Chờ xác nhận">
                                                <Badge
                                                    className={`${
                                                        colorBucket['Chờ xác nhận']
                                                    } hover:${
                                                        colorBucket['Chờ xác nhận']
                                                    }`}
                                                >
                                                   Chờ xác nhận
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Chờ phê duyệt">
                                                <Badge
                                                    className={`${
                                                        colorBucket['Chờ phê duyệt']
                                                    } hover:${
                                                        colorBucket['Chờ phê duyệt']
                                                    }`}
                                                >
                                                   Chờ phê duyệt
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Đã từ chối">
                                                <Badge
                                                    className={`${
                                                        colorBucket['Đã từ chối']
                                                    } hover:${
                                                        colorBucket['Đã từ chối']
                                                    }`}
                                                >
                                                   Đã từ chối
                                                </Badge>
                                            </SelectItem>
                                        </SelectionField>
                                    )}
                                    {user?.RoleName === 'Employer' && (
                                        <SelectionField
                                            name="LeaveStatus"
                                            label="Trạng thái"
                                            placeholder="Chọn trạng thái"
                                        >
                                            <SelectItem value="Chờ phê duyệt">
                                                <Badge
                                                    className={`${
                                                        colorBucket['Chờ phê duyệt']
                                                    } hover:${
                                                        colorBucket['Chờ phê duyệt']
                                                    }`}
                                                >
                                                   Chờ xác nhận
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Đã từ chối">
                                                <Badge
                                                    className={`${
                                                        colorBucket['Đã từ chối']
                                                    } hover:${
                                                        colorBucket['Đã từ chối']
                                                    }`}
                                                >
                                                   Đã từ chối
                                                </Badge>
                                            </SelectItem>
                                        </SelectionField>
                                    )}
                                </div>
                            <DialogFooter className="w-full sticky mt-4">
                                <DialogClose asChild>
                                    <Button
                                        onClick={() => {
                                            setOpenEditForm(false);
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Hủy
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={loading}>
                                    {loading && (
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    )}{' '}
                                    Lưu
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <DataTablePagination table={table} totalRow={totalRow || 0} />
        </div>
    );
};
