/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as scheduleApi, default as workShiftApi } from '@/api/scheduleApi';
import { TextField, TimeFieldCus } from '@/components/FormControls';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
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
import { useInfoUser } from '@/hooks';
import {
    InfoWorkShift,
    ListResponse,
    QueryParam,
    WorkShiftCreateForm,
    WorkShiftEditForm,
} from '@/models';
import { ConvertQueryParam, formatTime, formatTimeValue, parseTimeString } from '@/utils';
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
import queryString from 'query-string';
import * as React from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

export const WorkShift = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listJob, setListJob] = React.useState<InfoWorkShift[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [pageCount, setPageCount] = React.useState<number>();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [loadingTable, setLoadingTable] = React.useState(false);
    const param = queryString.parse(location.search);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const { toast } = useToast();
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'id', desc: false }]);
    const [selectRowDelete, setSelectRowDelete] = React.useState<InfoWorkShift | null>(null);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
    const [openEditForm, setOpenEditForm] = React.useState<boolean>(false);
    const [openCreateForm, setOpenCreateForm] = React.useState<boolean>(false);
    const [openDeleteForm, setOpenDeleteForm] = React.useState<boolean>(false);

    const handleNavigateQuery = () => {
        const paramObject: QueryParam = {
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
    const columns: ColumnDef<InfoWorkShift>[] = [
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã ca" />,
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'WorkShiftName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên ca" />,
            cell: ({ row }) => <div>{row.getValue('WorkShiftName')}</div>,
        },
        {
            accessorKey: 'StartTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ bắt đầu" />,
            cell: ({ row }) => <div>{formatTime(row.getValue('StartTime'))}</div>,
        },
        {
            accessorKey: 'EndTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ kết thúc" />,
            cell: ({ row }) => <div>{formatTime(row.getValue('EndTime'))}</div>,
        },
        {
            accessorKey: 'Color',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã màu" />,
            cell: ({ row }) => <div>{row.getValue('Color')}</div>,
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
                                Chỉnh sửa ca
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectRowDelete(row.original);
                                    setOpenDeleteForm(true);
                                }}
                                className="cursor-pointer"
                            >
                                Xóa ca làm việc
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
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const jobData = (await scheduleApi.getListWorkShift(parsed)) as unknown as ListResponse;
            setListJob(jobData.data);
            setTotalRow(jobData.total_rows);
            setPageCount(Math.ceil(jobData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    const handleValueEdit = (data: InfoWorkShift) => {
        formEdit.setValue('id', data.id);
        formEdit.setValue('WorkShiftName', data.WorkShiftName);
        formEdit.setValue('StartTime', parseTimeString(data.StartTime));
        formEdit.setValue('EndTime', parseTimeString(data.EndTime));
        formEdit.setValue('RawStartTime', data.StartTime);
        formEdit.setValue('RawEndTime', data.EndTime);
        formEdit.setValue('Color', data.Color);

        setOpenEditForm(true);
    };
    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
    }, [sorting, columnFilters, pagination]);

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

    const schema_create = yup.object().shape({
        WorkShiftName: yup.string().required('Nhập tên ca'),
        StartTime: yup.string().required('Cần nhập thời gian bắt đầu'),
        EndTime: yup.string().required('Cần nhập thời gian kết thúc'),
        Color: yup.string().required('Cần nhập màu'),
    });
    const schema_edit = yup.object().shape({
        id: yup.number().required('number'),
        WorkShiftName: yup.string().required('Nhập tên ca'),
        RawStartTime: yup.string().required('Nhập giờ bắt đầu'),
        RawEndTime: yup.string().required('Nhập giờ kết thúc'),
        Color: yup.string().required('Cần nhập màu'),
    });
    const formCreate = useForm<WorkShiftCreateForm>({
        resolver: yupResolver(schema_create) as Resolver<WorkShiftCreateForm, any>,
    });
    const formEdit = useForm<WorkShiftEditForm>({
        resolver: yupResolver(schema_edit) as Resolver<WorkShiftEditForm, any>,
    });
    const handleEdit: SubmitHandler<WorkShiftEditForm> = (data) => {
        (async () => {
            try {
                if (data.StartTime && data.EndTime) {
                    const { id } = data;
                    const postData: WorkShiftCreateForm = {
                        WorkShiftName: data.WorkShiftName,
                        StartTime: formatTimeValue(data.StartTime),
                        EndTime: formatTimeValue(data.EndTime),
                        Color: data.Color,
                    };
                    setLoading(true);
                    await scheduleApi.updateWorkShift(id, postData);
                    fetchData();
                    setOpenEditForm(false);
                    toast({
                        title: 'Thành công',
                        description: 'Sửa ca làm việc thành công',
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
    const handleCreate: SubmitHandler<WorkShiftCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                await scheduleApi.createWorkShift(data);
                fetchData();
                formCreate.reset();
                setOpenCreateForm(false);
                toast({
                    title: 'Thành công',
                    description: 'Tạo ca làm việc thành công',
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

    const handleDeleteWorkShift = async (id?: number) => {
        try {
            if (id) {
                setLoading(true);
                await workShiftApi.deleteWorkShift(id);
                setSelectRowDelete(null);
                toast({
                    title: 'Thành công',
                    description: 'Xóa thành công',
                });
                fetchData();
                setOpenDeleteForm(false);
            }
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
    const user = useInfoUser();
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center">
                <div className="flex flex-row gap-4">
          
                        <Dialog open={openCreateForm} onOpenChange={setOpenCreateForm}>
                            <DialogTrigger asChild>
                                <Button disabled={user?.RoleName !== 'Admin'} className="btn flex gap-2">
                                    <PlusCircledIcon />
                                    Tạo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader className="">
                                    <DialogTitle className="text-xl uppercase">
                                        Tạo mới ca làm việc
                                    </DialogTitle>
                                </DialogHeader>
                                <Form {...formCreate}>
                                    <form onSubmit={formCreate.handleSubmit(handleCreate)}>
                                        <div className="grid grid-cols-3 gap-3 mx-1 mb-3">
                                            <TextField
                                                name="WorkShiftName"
                                                label="Tên ca"
                                                placeholder="Tên ca làm việc"
                                                require={true}
                                            />
                                            <TimeFieldCus
                                                name="StartTime"
                                                label="Giờ bắt đầu"
                                                require={true}
                                            />
                                            <TimeFieldCus
                                                name="EndTime"
                                                label="Giờ kết thúc"
                                                require={true}
                                            />
                                            <TextField
                                                type="color"
                                                name="Color"
                                                label="Mã màu"
                                                placeholder="Nhập mã màu"
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
                        <DialogTitle>Xác nhận xóa ca làm việc?</DialogTitle>
                    </DialogHeader>
                    <p>Xóa chức vụ {selectRowDelete?.WorkShiftName}</p>
                    <p>
                        Bạn có chắc chắn xóa ca làm việc{' '}
                        <strong>{selectRowDelete?.WorkShiftName}</strong>?
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
                            onClick={() => handleDeleteWorkShift(selectRowDelete?.id)}
                            disabled={loading}
                        >
                            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />} Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa chức vụ</DialogTitle>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <div className="grid grid-cols-2 gap-3 mx-1 mb-3">
                                <TextField
                                    name="WorkShiftName"
                                    label="Tên ca"
                                    placeholder="Tên ca làm việc"
                                    require={true}
                                />
                                <TimeFieldCus name="StartTime" label="Giờ bắt đầu" require={true} />
                                <TimeFieldCus name="EndTime" label="Giờ kết thúc" require={true} />
                                <TextField
                                    type="color"
                                    name="Color"
                                    label="Mã màu"
                                    placeholder="Nhập mã màu"
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
