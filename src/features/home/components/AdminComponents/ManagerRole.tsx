/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminApi } from '@/api/adminApi';
import { TextField } from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { DataTableFilter } from '@/components/common/DataTableFilter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { InfoRole, ListResponse, QueryParam, RoleCreateForm, RoleEditForm } from '@/models';
import { ConvertQueryParam } from '@/utils';
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
import { debounce } from 'lodash';
import queryString from 'query-string';
import * as React from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

export const ManagerRole = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listRole, setListRole] = React.useState<InfoRole[]>([]);
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
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'RoleID', desc: false }]);
    const [selectRowDelete, setSelectRowDelete] = React.useState<InfoRole | null>(null);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
    const [openEditForm, setOpenEditForm] = React.useState<boolean>(false);
    const [openCreateForm, setOpenCreateForm] = React.useState<boolean>(false);
    const [openDeleteForm, setOpenDeleteForm] = React.useState<boolean>(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetQuery = React.useCallback(
        debounce((value) => setQuery(value), 500),
        [],
    );
    const handleNavigateQuery = () => {
        const paramObject: QueryParam = {
            query: query,
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort_by: sorting[0].id,
            asc: !sorting[0].desc,
            filters: columnFilters,
        };
        const newSearch = ConvertQueryParam(paramObject);
        navigate({ search: newSearch });
        location.search = newSearch;
    };
    const columns: ColumnDef<InfoRole>[] = [
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
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã vai trò" />,
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'roleName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên vai trò" />,
            cell: ({ row }) => <div>{row.getValue('roleName')}</div>,
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
                                Chỉnh sửa chức vụ
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectRowDelete(row.original);
                                    setOpenDeleteForm(true);
                                }}
                                className="cursor-pointer"
                            >
                                Xóa chức vụ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const parsed = queryString.parse(
                location.search ? location.search : '?page=1&size=10&query=',
            ) as unknown as QueryParam;
            const { data } = (await adminApi.getRole(parsed)) as unknown as {
                code: string,
                data: ListResponse<InfoRole[]>
            };
            setListRole(data.data);
            setTotalRow(data.totalItems);
            setPageCount(Math.ceil(data.totalItems / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    const handleValueEdit = (data: InfoRole) => {
        formEdit.setValue('roleName', data.roleName);
        formEdit.setValue('id', data.id);
        setOpenEditForm(true);
    };
    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, sorting, columnFilters, pagination]);

    const table = useReactTable({
        data: listRole,
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

    const schema_create = yup.object().shape({
        roleName: yup.string().required('Cần nhập tên vai trò'),
    });
    const schema_edit = yup.object().shape({
        roleName: yup.string().required('Cần nhập tên vai trò'),
    });
    const formCreate = useForm<RoleCreateForm>({
        resolver: yupResolver(schema_create) as Resolver<RoleCreateForm, any>,
    });
    const formEdit = useForm<RoleEditForm>({
        resolver: yupResolver(schema_edit) as Resolver<RoleCreateForm, any>,
    });
    const handleEdit: SubmitHandler<RoleEditForm> = (data) => {
        (async () => {
            try {
                if (data?.RoleID !== undefined) {
                    const { RoleID, ...postData } = data;
                    setLoading(true);
                    await adminApi.editRole(RoleID, postData);
                    fetchData();
                    setOpenEditForm(false);
                    toast({
                        title: 'Thành công',
                        description: 'Sửa vai trò thành công',
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
    const handleCreate: SubmitHandler<RoleCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                await adminApi.createRole(data);
                fetchData();
                formCreate.reset();
                setOpenCreateForm(false);
                toast({
                    title: 'Thành công',
                    description: 'Tạo chức vụ thành công',
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

    const handleDeleteRole = async (id: string) => {
        try {
            setLoading(true);
            await adminApi.deleteRole(id);
            setSelectRowDelete(null);
            toast({
                title: 'Thành công',
                description: 'Xóa thành công',
            });
            fetchData();
            setOpenDeleteForm(false);
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
                    {table.getColumn('DepName') && (
                        <DataTableFilter
                            column={table.getColumn('DepName')}
                            title="Phòng ban"
                            options={null}
                            api="department"
                        />
                    )}
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
                                    Tạo mới chức vụ
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...formCreate}>
                                <form onSubmit={formCreate.handleSubmit(handleCreate)}>
                                    <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                        <TextField
                                            name="roleName"
                                            label="Tên vai trò"
                                            placeholder="Hr"
                                            require={true}
                                        />
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
            <Dialog open={openDeleteForm} onOpenChange={setOpenDeleteForm}>
                <DialogContent>
                    <DialogHeader className="">
                        <DialogTitle>Xác nhận xóa vai trò?</DialogTitle>
                    </DialogHeader>
                    <p>Xóa chức vụ {selectRowDelete?.roleName}</p>
                    <p>
                        Bạn có chắc chắn xóa công việc <strong>{selectRowDelete?.roleName}</strong>?
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
                            onClick={() => handleDeleteRole(selectRowDelete?.id + '')}
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
                        <DialogTitle>Chỉnh sửa chức vụ</DialogTitle>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                <TextField
                                    name="roleName"
                                    label="Tên vai trò"
                                    placeholder="Hr"
                                    require={true}
                                />
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
