/* eslint-disable react-hooks/exhaustive-deps */
import employeeApi from '@/api/employeeApi';
import { BankField, CalendarTypingField, SearchField, SelectionField, TextField } from '@/components/FormControls';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { authActions } from '@/features/auth/AuthSlice';
import { useInfoUser } from '@/hooks';
import { EmployeeCreateForm, EmployeeEditForm, InfoUser, ListResponse, QueryParam } from '@/models';
import { colorBucket, ColorKey, ConvertQueryParam } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { DotsHorizontalIcon, PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
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
    const [listEmployees, setListEmployees] = React.useState<InfoUser[]>([]);
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

    const columns: ColumnDef<InfoUser>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã nhân viên" />,
            cell: ({ row }) => <div className="ml-2">{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhân viên" />,
            cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
        },
        {
            accessorKey: 'gender',
            header: 'Giới tính',
            cell: ({ row }) => <div>{row.getValue('gender') || 'Không xác định'}</div>,
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
            accessorKey: 'phone',
            header: 'Số điện thoại',
            cell: ({ row }) => <div>{row.getValue('Phone') || 'Không xác định'}</div>,
        },
        {
            accessorKey: 'employeeStatus',
            header: 'Hình thức',
            cell: ({ row }) => (
                <Badge className={`${colorBucket[row.getValue('employeeStatus') as ColorKey]}`}>
                    {row.getValue('employeeStatus')}
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
        [],
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
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort_by: sorting[0].id,
            sort: !sorting[0].desc ? 'ASC' : 'DESC',
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
                location.search ? location.search : '?pageIndex=1&pageSize=10&query=',
            ) as unknown as QueryParam;
            const { data } = (await employeeApi.getListEmployee(parsed)) as unknown as {
                data: ListResponse<InfoUser[]>
            };
            setListEmployees(data.data);
            setTotalRow(data.totalItems);
            setPageCount(Math.ceil(data.totalItems / table.getState().pagination.pageSize));
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
        navigate(`/home/info-employee/${id}`);
    };
    const setDataEdit = (data: InfoUser) => {
        formEdit.setValue('id', data.id);
        formEdit.setValue('employeeName', data.employeeName);
        formEdit.setValue('phone', data.phone);
        formEdit.setValue('hireDate', data.hireDate);
        formEdit.setValue('birthDate', data.birthDate);
        formEdit.setValue('address', data.address);
        formEdit.setValue('email', data.email);
        formEdit.setValue('employeeStatus', data.employeeStatus);
        formEdit.setValue('gender', data.gender);
        formEdit.setValue('taxCode', data.taxCode);
        formEdit.setValue('cccd', data.cccd);
        formEdit.setValue('bankAccountNumber', data.bankAccountNumber);
        formEdit.setValue('bankName', data.bankName?.toUpperCase());
        formEdit.setValue('department', data.department);
        formEdit.setValue('job', data.role);
        formEdit.setValue('role', data.job);
        console.log(formEdit);
        setOpenEditDialog(true);
    };

    const schema_edit = yup.object().shape({
        employeeName: yup.string().required('Cần nhập tên tài khoản'),
        email: yup.string().email('Gmail không hợp lệ').required('Cần nhập gmail'),
        cccd: yup
            .string()
            .required('Cần nhận căn cước công dân')
            .test(
                'is-valid-length',
                'CCCD/CMND phải có độ dài 12 ký tự',
                (value) => value.length === 12,
            ),
        department: yup.string().required('Cần nhập tên phòng ban'),
        job: yup.string().required('Cần nhập tên công việc'),
        role: yup.string().required('Cần nhập vị trí'),
        empStatus: yup.string().required('Cần chọn hình thức'),
        phone: yup
            .string()
            .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
            .min(9, 'Quá ngắn')
            .max(11, 'Quá dài'),
    });
    const schema_create = yup.object().shape({
        employeeName: yup.string().required('Cần nhập tên tài khoản'),
        email: yup.string().email('Gmail không hợp lệ').required('Cần nhập gmail'),
        cccd: yup
            .string()
            .required('Cần nhận căn cước công dân')
            .test(
                'is-valid-length',
                'CCCD/CMND phải có độ dài 12 ký tự',
                (value) => value.length === 12,
            ),
        department: yup.string().required('Cần nhập tên phòng ban'),
        job: yup.string().required('Cần nhập tên công việc'),
        role: yup.string().required('Cần nhập vị trí'),
        empStatus: yup.string().required('Cần chọn hình thức'),
        phone: yup
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
    const dispatch = useDispatch();
    const user = useInfoUser();
    const handleEdit: SubmitHandler<EmployeeEditForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                const { id, ...postData } = data;
                const reData: EmployeeEditForm = {
                    ...postData,
                    birthDate: dayjs(data.birthDate).format('DD/MM/YYYY'),
                    hireDate: dayjs(data.hireDate).format('DD/MM/YYYY'),
                };
                if (id) {
                    const res = await employeeApi.editEmployee(id, reData);
                    if (id === user?.id) {
                        dispatch(authActions.setUser(res.data[0] as unknown as InfoUser));
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
                    birthDate: dayjs(data.birthDate).format('DD/MM/YYYY'),
                    hireDate: dayjs(data.hireDate).format('DD/MM/YYYY'),
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
                            column={table.getColumn('gender')}
                            title="Giới tính"
                            options={[
                                {
                                    value: 'FEMALE',
                                    id: 'FEMALE',
                                },
                                {
                                    value: 'MALE',
                                    id: 'MALE',
                                },

                            ]}
                            api=""
                        />
                    )}
                    {table.getColumn('department') && (
                        <DataTableFilter
                            column={table.getColumn('department')}
                            title="Phòng ban"
                            options={null}
                            api="department"
                        />
                    )}
                    {table.getColumn('job') && (
                        <DataTableFilter
                            column={table.getColumn('job')}
                            title="Công việc"
                            options={null}
                            api="job"
                        />
                    )}
                    {table.getColumn('empStatus') && (
                        <DataTableFilter
                            column={table.getColumn('empStatus')}
                            title="Hình thức"
                            options={[
                                {
                                    value: 'FULLTIME',
                                    id: 'FULLTIME',
                                },
                                {
                                    value: 'PARTTIME',
                                    id: 'PARTTIME',
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
                                                        name="employeeName"
                                                        label="Tên nhân viên"
                                                        placeholder="Nhập tên nhân viên"
                                                        require={true}
                                                    />
                                                    <TextField
                                                        name="email"
                                                        label="email"
                                                        placeholder="Nhập email"
                                                        require={true}
                                                        type="email"
                                                    />
                                                    <TextField
                                                        name="cccd"
                                                        label="Số CCCD/CMND"
                                                        placeholder="Nhập CCCD/CMND"
                                                        require={true}
                                                    />
                                                    <SelectionField
                                                        name="gender"
                                                        label="Giới tính"
                                                        placeholder="Chọn giới tính"
                                                    >
                                                        <SelectItem value="MALE">Nam</SelectItem>
                                                        <SelectItem value="FEMALE">Nữ</SelectItem>
                                                    </SelectionField>

                                                    <TextField
                                                        name="taxCode"
                                                        label="Mã số thuế"
                                                        placeholder="Nhập mã số thuế"
                                                    />
                                                    <TextField
                                                        name="address"
                                                        label="Địa chỉ"
                                                        placeholder="Nhập địa chỉ"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <BankField
                                                        name="bankName"
                                                        label="Tên ngân hàng"
                                                        placeholder="Chọn ngân hàng"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <TextField
                                                            name="bankAccountNumber"
                                                            label="Số tài khoản"
                                                            placeholder="Nhập số tài khoản"
                                                        />
                                                        <TextField
                                                            name="phone"
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
                                                        name="department"
                                                        label="Phòng ban"
                                                        placeholder="Chọn phòng ban"
                                                        typeApi="department"
                                                        require={true}
                                                    />
                                                    <SearchField
                                                        name="job"
                                                        label="Chức vụ"
                                                        placeholder="Chọn chức vụ"
                                                        typeApi="job"
                                                        require={true}
                                                    />
                                                    <SearchField
                                                        name="role"
                                                        label="Vai trò"
                                                        placeholder="Chọn vai trò"
                                                        typeApi="role"
                                                        require={true}
                                                    />

                                                    <SelectionField
                                                        label="Hình thức"
                                                        name="empStatus"
                                                        placeholder="Chọn hình thức"
                                                    >
                                                        <SelectItem value="FULLTIME">
                                                            <Badge
                                                                className={`${colorBucket['FULLTIME']} hover:${colorBucket['Thực tập sinh']}]`}
                                                            >
                                                                FULLTIME
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="PASSTIME">
                                                            <Badge
                                                                className={`${colorBucket['PASSTIME']} hover:${colorBucket['Ngưng làm việc']}`}
                                                            >
                                                                PASSTIME
                                                            </Badge>
                                                        </SelectItem>
                                                    </SelectionField>
                                                    <CalendarTypingField
                                                        name="hireDate"
                                                        label="Ngày gia nhập"
                                                    />
                                                    <CalendarTypingField
                                                        name="birthDate"
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
                                                        header.getContext(),
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
                                                        cell.getContext(),
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
                                                name="taxCode"
                                                label="Mã số thuế"
                                                placeholder="Nhập mã số thuế"
                                            />
                                            <TextField
                                                name="address"
                                                label="Địa chỉ"
                                                placeholder="Nhập địa chỉ"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <BankField
                                                name="bankName"
                                                label="Tên ngân hàng"
                                                placeholder="Chọn ngân hàng"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <TextField
                                                    name="bankAccountNumber"
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
                                                name="empStatus"
                                                placeholder="Chọn hình thức"
                                            >

                                                <SelectItem value="FULLTIME">
                                                    <Badge
                                                        className={`${colorBucket['FULLTIME']} hover:${colorBucket['Thực tập sinh']}]`}
                                                    >
                                                        FULLTIME
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="PASSTIME">
                                                    <Badge
                                                        className={`${colorBucket['PASSTIME']} hover:${colorBucket['Ngưng làm việc']}`}
                                                    >
                                                        PASSTIME
                                                    </Badge>
                                                </SelectItem>
                                            </SelectionField>
                                            <CalendarTypingField
                                                name="hireDate"
                                                label="Ngày gia nhập"
                                            />
                                            <CalendarTypingField
                                                name="birthDate"
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
