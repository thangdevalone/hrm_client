/* eslint-disable react-hooks/exhaustive-deps */
import employeeApi from '@/api/employeeApi';
import {
    BankField,
    CalendarTypingField,
    SearchField,
    SelectionField,
    TextField,
} from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { DataTableFilter } from '@/components/common/DataTableFilter';
import QRCodeScanner from '@/components/common/QRCodeScanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Dialog,
    DialogClose,
    DialogContent,
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
import { authActions } from '@/features/auth/AuthSlice';
import { useInfoUser } from '@/hooks';
import {
    EmployeeCreateForm,
    EmployeeEditForm,
    InforEmployee,
    InforUser,
    ListResponse,
    QueryParam,
} from '@/models';
import { ColorKey, ConvertQueryParam, colorBucket } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { DotsHorizontalIcon, PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
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
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import queryString from 'query-string';
import * as React from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

// eslint-disable-next-line react-refresh/only-export-components

export function EmployeeList() {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'EmpID', desc: false }]);
    const [listEmployees, setListEmployees] = React.useState<InforEmployee[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [query, setQuery] = React.useState<string>('');
    const [queryLodash, setQueryLodash] = React.useState<string | undefined>(undefined);
    const [pageCount, setPageCount] = React.useState<number>(1);
    const { toast } = useToast();
    const [dialogState, setDialogState] = React.useState<number>(1);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [loadingTable, setLoadingTable] = React.useState(false);

    const param = queryString.parse(location.search);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
    const phoneRegExp =
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

    const columns: ColumnDef<InforEmployee>[] = [
        {
            accessorKey: 'UserID',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã nhân viên" />,
            cell: ({ row }) => <div className="ml-2">{row.getValue('UserID')}</div>,
        },
        {
            accessorKey: 'EmpName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhân viên" />,
            cell: ({ row }) => <div>{row.getValue('EmpName')}</div>,
        },
        {
            accessorKey: 'Gender',
            header: 'Giới tính',
            cell: ({ row }) => <div>{row.getValue('Gender') || 'Không xác định'}</div>,
        },
        {
            accessorKey: 'JobName',
            header: 'Công việc',
            cell: ({ row }) => <div>{row.getValue('JobName') || 'Không xác định'}</div>,
        },
        {
            accessorKey: 'DepName',
            header: 'Phòng ban',
            cell: ({ row }) => <div>{row.getValue('DepName') || 'Không xác định'}</div>,
        },
        {
            accessorKey: 'Phone',
            header: 'Số điện thoại',
            cell: ({ row }) => <div>{row.getValue('Phone') || 'Không xác định'}</div>,
        },
        {
            accessorKey: 'EmpStatus',
            header: 'Hình thức',
            cell: ({ row }) => (
                <Badge className={`${colorBucket[row.getValue('EmpStatus') as ColorKey]}`}>
                    {row.getValue('EmpStatus')}
                </Badge>
            ),
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
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDataEdit(row.original);
                                }}
                            >
                                Chỉnh sửa nhân viên
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    const debouncedSetQuery = React.useCallback(
        debounce((value) => setQuery(value), 500),
        []
    );

    const table = useReactTable({
        data: listEmployees,
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
    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const parsed = queryString.parse(
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const empData = (await employeeApi.getListEmployee(parsed)) as unknown as ListResponse;
            setListEmployees(empData.data);
            setTotalRow(empData.total_rows);
            setPageCount(Math.ceil(empData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, pagination, sorting, columnFilters]);
    const handleDetailEmp = (id: number) => {
        navigate(`/home/info-employee/${id}`)
    };
    const setDataEdit = (data: InforEmployee) => {
        formEdit.setValue('EmpID', data.EmpID);
        formEdit.setValue('EmpName', data.EmpName);
        formEdit.setValue('Phone', data.Phone);
        formEdit.setValue('HireDate', data.HireDate);
        formEdit.setValue('BirthDate', data.BirthDate);
        formEdit.setValue('Address', data.Address);
        formEdit.setValue('Email', data.Email);
        formEdit.setValue('EmpStatus', data.EmpStatus);
        formEdit.setValue('Gender', data.Gender);
        formEdit.setValue('TaxCode', data.TaxCode);
        formEdit.setValue('CCCD', data.CCCD);
        formEdit.setValue('BankAccountNumber', data.BankAccountNumber);
        formEdit.setValue('BankName', data.BankName?.toUpperCase());
        formEdit.setValue('DepID', data.DepID);
        formEdit.setValue('JobID', data.JobID);
        formEdit.setValue('RoleID', data.RoleID);
        console.log(formEdit);
        setOpenEditDialog(true);
    };

    const schema_edit = yup.object().shape({
        EmpName: yup.string().required('Cần nhập tên tài khoản'),
        Email: yup.string().email('Gmail không hợp lệ').required('Cần nhập gmail'),
        CCCD: yup
            .string()
            .required('Cần nhận căn cước công dân')
            .test(
                'is-valid-length',
                'CCCD/CMND phải có độ dài 12 ký tự',
                (value) => value.length === 12
            ),
        DepID: yup.number().required('Cần nhập tên phòng ban'),
        JobID: yup.number().required('Cần nhập tên công việc'),
        RoleID: yup.number().required('Cần nhập vị trí'),
        EmpStatus: yup.string().required('Cần chọn hình thức'),
        Phone: yup
            .string()
            .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
            .min(9, 'Quá ngắn')
            .max(11, 'Quá dài'),
    });
    const schema_create = yup.object().shape({
        EmpName: yup.string().required('Cần nhập tên tài khoản'),
        Email: yup.string().email('Gmail không hợp lệ').required('Cần nhập gmail'),
        CCCD: yup
            .string()
            .required('Cần nhận căn cước công dân')
            .test(
                'is-valid-length',
                'CCCD/CMND phải có độ dài 12 ký tự',
                (value) => value.length === 12
            ),
        DepID: yup.number().required('Cần nhập tên phòng ban'),
        JobID: yup.number().required('Cần nhập tên công việc'),
        RoleID: yup.number().required('Cần nhập vị trí'),
        EmpStatus: yup.string().required('Cần chọn hình thức'),
        Phone: yup
            .string()
            .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
            .min(9, 'Quá ngắn')
            .max(11, 'Quá dài'),
    });
    const formEdit = useForm<EmployeeEditForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema_edit) as Resolver<EmployeeEditForm, any>,
    });
    const formCreate = useForm<EmployeeCreateForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema_create) as Resolver<EmployeeCreateForm, any>,
    });
    const dispatch=useDispatch()
    const user=useInfoUser()
    const handleEdit: SubmitHandler<EmployeeEditForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                const { EmpID, ...postData } = data;
                const reData: EmployeeEditForm = {
                    ...postData,
                    BirthDate: dayjs(data.BirthDate).format('DD/MM/YYYY'),
                    HireDate: dayjs(data.HireDate).format('DD/MM/YYYY'),
                };
                if (EmpID) {
                    const res =await employeeApi.editEmployee(EmpID, reData);
                    if (EmpID === user?.EmpID) {
                        dispatch(authActions.setUser(res.data[0] as unknown as InforUser));
                    }
                    
                }
                setOpenEditDialog(false);
                formEdit.reset();
                fetchData();
                toast({
                    title: 'Thành công',
                    description: 'Sửa nhân viên thành công',
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const handleCreate: SubmitHandler<EmployeeCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                const newData: EmployeeCreateForm = {
                    ...data,
                    BirthDate: dayjs(data.BirthDate).format('DD/MM/YYYY'),
                    HireDate: dayjs(data.HireDate).format('DD/MM/YYYY'),
                };
                await employeeApi.createEmployee(newData);
                setOpenDialog(false);
                formCreate.reset();
                fetchData();
                toast({
                    title: 'Thành công',
                    description: 'Tạo nhân viên thành công',
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    return (
        <div className="w-full space-y-4">
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
                    {table.getColumn('Gender') && (
                        <DataTableFilter
                            column={table.getColumn('Gender')}
                            title="Giới tính"
                            options={[
                                {
                                    value: 'Nam',
                                    id: 'Nam',
                                },
                                {
                                    value: 'Nữ',
                                    id: 'Nữ',
                                },
                                {
                                    value: 'Không xác định',
                                    id: 'Không xác định',
                                },
                            ]}
                            api=""
                        />
                    )}
                    {table.getColumn('DepName') && (
                        <DataTableFilter
                            column={table.getColumn('DepName')}
                            title="Phòng ban"
                            options={null}
                            api="department"
                        />
                    )}
                    {table.getColumn('JobName') && (
                        <DataTableFilter
                            column={table.getColumn('JobName')}
                            title="Công việc"
                            options={null}
                            api="job"
                        />
                    )}
                    {table.getColumn('EmpStatus') && (
                        <DataTableFilter
                            column={table.getColumn('EmpStatus')}
                            title="Hình thức"
                            options={[
                                {
                                    value: 'Toàn thời gian',
                                    id: '1',
                                },
                                {
                                    value: 'Bán thời gian',
                                    id: '2',
                                },
                                {
                                    value: 'Thực tập sinh',
                                    id: '3',
                                },
                                {
                                    value: 'Ngưng làm việc',
                                    id: '4',
                                },
                            ]}
                            api=""
                        />
                    )}
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setOpenDialog(true)} className="btn flex gap-2">
                                <PlusCircledIcon />
                                Tạo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader className="">
                                <DialogTitle className="text-xl uppercase">
                                    Tạo mới nhân viên
                                </DialogTitle>
                            </DialogHeader>
                            {dialogState === 1 && (
                                <Form {...formCreate}>
                                    <QRCodeScanner setDialogState={setDialogState} />
                                </Form>
                            )}
                            {dialogState === 2 && (
                                <Form {...formCreate}>
                                    <form onSubmit={formCreate.handleSubmit(handleCreate)}>
                                        <div className="ml-1 mr-3">
                                            <div className="mb-3">
                                                <p className="mb-2 text-lg font-semibold">
                                                    Thông tin cá nhân
                                                </p>
                                                <div className="grid grid-cols-3 gap-3 mb-3">
                                                    <TextField
                                                        name="EmpName"
                                                        label="Tên nhân viên"
                                                        placeholder="Nhập tên nhân viên"
                                                        require={true}
                                                    />
                                                    <TextField
                                                        name="Email"
                                                        label="Email"
                                                        placeholder="Nhập email"
                                                        require={true}
                                                        type="email"
                                                    />
                                                    <TextField
                                                        name="CCCD"
                                                        label="Số CCCD/CMND"
                                                        placeholder="Nhập CCCD/CMND"
                                                        require={true}
                                                    />
                                                    <SelectionField
                                                        name="Gender"
                                                        label="Giới tính"
                                                        placeholder="Chọn giới tính"
                                                    >
                                                        <SelectItem value="Nam">Nam</SelectItem>
                                                        <SelectItem value="Nữ">Nữ</SelectItem>
                                                        <SelectItem value="Không xác định">
                                                            Không xác định
                                                        </SelectItem>
                                                    </SelectionField>

                                                    <TextField
                                                        name="TaxCode"
                                                        label="Mã số thuế"
                                                        placeholder="Nhập mã số thuế"
                                                    />
                                                    <TextField
                                                        name="Address"
                                                        label="Địa chỉ"
                                                        placeholder="Nhập địa chỉ"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <BankField
                                                        name="BankName"
                                                        label="Tên ngân hàng"
                                                        placeholder="Chọn ngân hàng"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <TextField
                                                            name="BankAccountNumber"
                                                            label="Số tài khoản"
                                                            placeholder="Nhập số tài khoản"
                                                        />
                                                        <TextField
                                                            name="Phone"
                                                            label="Số điện thoại"
                                                            placeholder="Nhập điện thoại"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="mb-2 text-lg font-semibold">
                                                    Thông tin công việc
                                                </p>
                                                <div className="grid grid-cols-3 gap-3 ">
                                                    <SearchField
                                                        name="DepID"
                                                        label="Phòng ban"
                                                        placeholder="Chọn phòng ban"
                                                        typeApi="department"
                                                        require={true}
                                                    />
                                                    <SearchField
                                                        name="JobID"
                                                        label="Chức vụ"
                                                        placeholder="Chọn chức vụ"
                                                        typeApi="job"
                                                        require={true}
                                                    />
                                                    <SearchField
                                                        name="RoleID"
                                                        label="Vai trò"
                                                        placeholder="Chọn vai trò"
                                                        typeApi="role"
                                                        require={true}
                                                    />

                                                    <SelectionField
                                                        label="Hình thức"
                                                        name="EmpStatus"
                                                        placeholder="Chọn hình thức"
                                                    >
                                                        <SelectItem value="Toàn thời gian">
                                                            <Badge
                                                                className={`${colorBucket['Toàn thời gian']} hover:${colorBucket['Toàn thời gian']}`}
                                                            >
                                                                Toàn thời gian
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="Bán thời gian">
                                                            <Badge
                                                                className={`${colorBucket['Bán thời gian']} hover:${colorBucket['Bán thời gian']}`}
                                                            >
                                                                Bán thời gian
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="Thực tập sinh">
                                                            <Badge
                                                                className={`${colorBucket['Thực tập sinh']} hover:${colorBucket['Thực tập sinh']}]`}
                                                            >
                                                                Thực tập sinh
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="Ngưng làm việc">
                                                            <Badge
                                                                className={`${colorBucket['Ngưng làm việc']} hover:${colorBucket['Ngưng làm việc']}`}
                                                            >
                                                                Ngưng làm việc
                                                            </Badge>
                                                        </SelectItem>
                                                    </SelectionField>
                                                    <CalendarTypingField
                                                        name="HireDate"
                                                        label="Ngày gia nhập"
                                                    />
                                                    <CalendarTypingField
                                                        name="BirthDate"
                                                        label="Ngày sinh"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="w-full sticky mt-4">
                                            <Button
                                                onClick={() => {
                                                    setDialogState(1);
                                                    setOpenDialog(false);
                                                    formCreate.reset();
                                                }}
                                                type="button"
                                                variant="outline"
                                            >
                                                Hủy
                                            </Button>
                                            <Button type="submit" disabled={loading}>
                                                {loading && (
                                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                                )}{' '}
                                                Lưu
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <DataTableViewOptions table={table} />
            </div>
            <div className="rounded-md border">
                <ScrollArea style={{ height: 'calc(100vh - 220px)' }} className=" relative w-full">
                    <Table>
                        <TableHeader className="sticky top-0 z-[2] bg-[hsl(var(--background))]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
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
                                            className="cursor-pointer"
                                            onClick={() => handleDetailEmp(row.original.EmpID)}
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
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader className="">
                        <DialogTitle className="mb-2">Sửa mới thông tin</DialogTitle>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <ScrollArea className="h-[450px] ">
                                <div className="ml-1 mr-3">
                                    <div className="mb-3">
                                        <p className="mb-2 text-lg font-semibold">
                                            Thông tin cá nhân
                                        </p>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <TextField
                                                name="EmpName"
                                                label="Tên nhân viên"
                                                placeholder="Nhập tên nhân viên"
                                                require={true}
                                            />
                                            <TextField
                                                name="Email"
                                                label="Email"
                                                placeholder="Nhập email"
                                                require={true}
                                                type="email"
                                            />
                                            <TextField
                                                name="CCCD"
                                                label="Số CCCD/CMND"
                                                placeholder="Nhập CCCD/CMND"
                                                require={true}
                                            />
                                            <SelectionField
                                                name="Gender"
                                                label="Giới tính"
                                                placeholder="Chọn giới tính"
                                            >
                                                <SelectItem value="Nam">Nam</SelectItem>
                                                <SelectItem value="Nữ">Nữ</SelectItem>
                                                <SelectItem value="Không xác định">
                                                    Không xác định
                                                </SelectItem>
                                            </SelectionField>

                                            <TextField
                                                name="TaxCode"
                                                label="Mã số thuế"
                                                placeholder="Nhập mã số thuế"
                                            />
                                            <TextField
                                                name="Address"
                                                label="Địa chỉ"
                                                placeholder="Nhập địa chỉ"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <BankField
                                                name="BankName"
                                                label="Tên ngân hàng"
                                                placeholder="Chọn ngân hàng"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <TextField
                                                    name="BankAccountNumber"
                                                    label="Số tài khoản"
                                                    placeholder="Nhập số tài khoản"
                                                />
                                                <TextField
                                                    name="Phone"
                                                    label="Số điện thoại"
                                                    placeholder="Nhập điện thoại"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="mb-2 text-lg font-semibold">
                                            Thông tin công việc
                                        </p>
                                        <div className="grid grid-cols-3 gap-3 ">
                                            <SearchField
                                                name="DepID"
                                                label="Phòng ban"
                                                placeholder="Chọn phòng ban"
                                                typeApi="department"
                                                require={true}
                                            />
                                            <SearchField
                                                name="JobID"
                                                label="Chức vụ"
                                                placeholder="Chọn chức vụ"
                                                typeApi="job"
                                                require={true}
                                            />
                                            <SearchField
                                                name="RoleID"
                                                label="Vai trò"
                                                placeholder="Chọn vai trò"
                                                typeApi="role"
                                                require={true}
                                            />

                                            <SelectionField
                                                label="Hình thức"
                                                name="EmpStatus"
                                                placeholder="Chọn hình thức"
                                            >
                                                <SelectItem value="Toàn thời gian">
                                                    <Badge
                                                        className={`${colorBucket['Toàn thời gian']} hover:${colorBucket['Toàn thời gian']}`}
                                                    >
                                                        Toàn thời gian
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Bán thời gian">
                                                    <Badge
                                                        className={`${colorBucket['Bán thời gian']} hover:${colorBucket['Bán thời gian']}`}
                                                    >
                                                        Bán thời gian
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Thực tập sinh">
                                                    <Badge
                                                        className={`${colorBucket['Thực tập sinh']} hover:${colorBucket['Thực tập sinh']}]`}
                                                    >
                                                        Thực tập sinh
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Ngưng làm việc">
                                                    <Badge
                                                        className={`${colorBucket['Ngưng làm việc']} hover:${colorBucket['Ngưng làm việc']}`}
                                                    >
                                                        Ngưng làm việc
                                                    </Badge>
                                                </SelectItem>
                                            </SelectionField>
                                            <CalendarTypingField
                                                name="HireDate"
                                                label="Ngày gia nhập"
                                            />
                                            <CalendarTypingField
                                                name="BirthDate"
                                                label="Ngày sinh"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <DialogFooter className="w-full sticky mt-4">
                                <DialogClose asChild>
                                    <Button
                                        onClick={() => {
                                            setOpenEditDialog(false);
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Đóng
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
}
