/* eslint-disable @typescript-eslint/no-explicit-any */
import leaveApi from '@/api/leaveApi';
import { TextField, TextareaField } from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { InfoLeave, InfoLeaveType, LeaveTypeCreateForm, ListResponse, QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTrigger } from '@radix-ui/react-dialog';
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
import { debounce } from 'lodash';
import queryString from 'query-string';
import * as React from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

export const LeaveType= () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listLeave, setListLeave] = React.useState<InfoLeaveType[]>([]);
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
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'LeaveTypeID', desc: false }]);
    const [selectRowDelete, setSelectRowDelete] = React.useState<InfoLeave | null>(null);
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
        []
    );
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
    const columns: ColumnDef<InfoLeaveType>[] = [
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
            accessorKey: 'LeaveTypeID',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã loại đơn" />,
            cell: ({ row }) => <div>{row.getValue('LeaveTypeID')}</div>,
        },
        {
            accessorKey: 'LeaveTypeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên loại đơn" />,
            cell: ({ row }) => <div>{row.getValue('LeaveTypeName')}</div>,
        },
        {
            accessorKey: 'LeaveTypeDescription',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
            cell: ({ row }) => <div>{row.getValue('LeaveTypeDescription')}</div>,
        },
        {
            accessorKey: 'LimitedDuration',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số lượng đơn" />,
            cell: ({ row }) => <div>{row.getValue('LimitedDuration')}</div>,
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: () => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                // onClick={() => handleValueEdit(row.original)}
                                className="cursor-pointer"
                            >
                                Chỉnh sửa
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    // setSelectRowDelete(row.original);
                                    setOpenDeleteForm(true);
                                }}
                                className="cursor-pointer"
                            >
                                Xóa loại nghỉ phép
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    // const user=useInfoUser()
    // const handleValueEdit = (data: InfoLeaveType) => {
        // if (data.DepID) {
        //     formEdit.setValue('DepID', data.DepID);
        // }
        // formEdit.setValue('Descriptions', data.Descriptions);
        // formEdit.setValue('JobName', data.JobName);
        // formEdit.setValue('JobID', data.JobID);
        // setOpenEditForm(true);
    // };
    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const parsed = queryString.parse(
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const leaveData = (await leaveApi.getListType(
                parsed
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
        LeaveTypeName:yup.string().required('Cần điền tên'),
        LeaveTypeDescription:yup.string().required('Nhập mô tả'),
        LimitedDuration:yup.number().required('Số lượng đơn'),

    });
    // const schema_edit = yup.object().shape({
    //     DepID: yup.number().required('Cần chọn phòng ban'),
    //     JobName: yup.string().required('Cần nhập tên chức vụ'),
    //     Descriptions: yup.string(),
    // });
    const formCreate = useForm<LeaveTypeCreateForm>({
        resolver: yupResolver(schema_create) as Resolver<LeaveTypeCreateForm, any>,
    });
    // const formEdit = useForm<JobEditForm>({
    //     resolver: yupResolver(schema_edit),
    // });
    // const handleEdit: SubmitHandler<JobEditForm> = (data) => {
    //     (async () => {
    //         try {
    //             if (data?.JobID !== undefined) {
    //                 const { JobID, ...postData } = data;
    //                 setLoading(true);
    //                 await adminApi.editJob(JobID, postData);
    //                 fetchData();
    //                 setOpenEditForm(false);
    //                 toast({
    //                     title: 'Thành công',
    //                     description: 'Sửa loại nghỉ phép thành công',
    //                 });
    //             }
    //         } catch (error: any) {
    //             console.log({ error: error });
    //             toast({
    //                 variant: 'destructive',
    //                 title: 'Có lỗi xảy ra',
    //                 description: error.error,
    //             });
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // };
    const handleCreate: SubmitHandler<LeaveTypeCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                console.log('ấd')
                await leaveApi.createLeaveType(data);
                fetchData();
                formCreate.reset();
                setOpenCreateForm(false);
                toast({
                    title: 'Thành công',
                    description: 'Tạo loại nghỉ phép thành công',
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
    const  handleDeleteLeaveType = async (id: number|undefined) => {
        if (id===undefined){
            setOpenDeleteForm(false)
            return
        }
        try {
            setLoading(true);
            await leaveApi.deleteLeaveType(id);
            setSelectRowDelete(null);
            toast({
                title: 'Thành công',
                description: 'Xóa thành công',
            });
            setOpenDeleteForm(false)
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
                                            name="LeaveTypeName"
                                            label="Loại nghỉ phép"
                                            placeholder="Nhập loại nghỉ phép"
                                            require={true}
                                        />
                                        <TextField
                                            name="LimitedDuration"
                                            label="Số lượng đơn"
                                            placeholder="Nhập số lượng đơn"
                                            require={true}
                                        />
                                        <div className="col-span-2">
                                            <TextareaField
                                                name="LeaveTypeDescription"
                                                label="Mô tả"
                                                placeholder="Mô tả"
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
                        <DialogTitle>Xác nhận xóa loại đơn xin nghỉ?</DialogTitle>
                    </DialogHeader>
                    <p>Xóa loại đơn {selectRowDelete?.LeaveTypeID}</p>
                    <p>
                        Bạn có chắc chắn xóa loại đơn xin nghỉ <strong>{selectRowDelete?.LeaveTypeID}</strong>?
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
                            onClick={() => handleDeleteLeaveType(selectRowDelete?.LeaveRequestID)}
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
                    {/* <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <ScrollArea className="h-[320px] ">
                                <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                    <TextField
                                        name="JobName"
                                        label="Chức vụ"
                                        placeholder="Business analyst"
                                        require={true}
                                    />
                                    <SearchField
                                        name="DepID"
                                        label="Phòng ban"
                                        placeholder="Chọn phòng ban"
                                        typeApi="department"
                                        require={true}
                                    />
                                    <div className="col-span-2">
                                        <TextareaField name="Descriptions" label="Mô tả" />
                                    </div>
                                </div>
                            </ScrollArea>
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
                    </Form> */}
                </DialogContent>
            </Dialog>
            <DataTablePagination table={table} totalRow={totalRow || 0} />
        </div>
    );
};
