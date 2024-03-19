/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as scheduleApi } from '@/api/scheduleApi';
import { SelectionField, TextField, TimeFieldCus } from '@/components/FormControls';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
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
import { useInfoUser } from '@/hooks';
import {
    ConfigScheduleCreateForm,
    ConfigScheduleEditForm,
    InfoConfigSchedule,
    ListResponse,
    QueryParam,
} from '@/models';
import { ConvertQueryParam, formatTimeValue, parseTimeString } from '@/utils';
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

export const ConfigSchedule = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listJob, setListJob] = React.useState<InfoConfigSchedule[]>([]);
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
    const [selectRowDelete, setSelectRowDelete] = React.useState<InfoConfigSchedule | null>(null);
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
    const columns: ColumnDef<InfoConfigSchedule>[] = [
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã cấu hình" />,
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'TimeBlock',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Thời gian khóa đăng kí hàng tuần" />
            ),
            cell: ({ row }) => <div>{row.getValue('TimeBlock')}</div>,
        },
        {
            accessorKey: 'DateMin',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Ngày tối thiểu" />
            ),
            cell: ({ row }) => <div>{row.getValue('DateMin')}</div>,
        },
        {
            accessorKey: 'Using',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge className={`${row.getValue('Using') == true ? 'bg-[green]' : 'bg-[red]'}`}>
                    {row.getValue('Using') == true ? 'Được sử dụng' : 'Không sử dụng'}
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
                                onClick={() => handleValueEdit(row.original)}
                                className="cursor-pointer"
                            >
                                Chỉnh sửa cấu hình
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectRowDelete(row.original);
                                    setOpenDeleteForm(true);
                                }}
                                className="cursor-pointer"
                            >
                                Xóa cấu hình
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
            const jobData = (await scheduleApi.getListConfigSchedule(
                parsed
            )) as unknown as ListResponse;
            setListJob(jobData.data);
            setTotalRow(jobData.total_rows);
            setPageCount(Math.ceil(jobData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };
    const handleValueEdit = (data: InfoConfigSchedule) => {
        formEdit.setValue('id', data.id);
        formEdit.setValue('TimeBlock', parseTimeString(data.TimeBlock));
        formEdit.setValue('DateMin', data.DateMin);
        formEdit.setValue('RawTimeBlock', data.TimeBlock);

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
        TimeBlock: yup.string().required('Nhập giờ đóng đăng kí'),
        DateMin: yup.number().required('Cần nhập ngày tối thiểu'),
        Using: yup.bool().required('Cần điền trạng thái'),
    });
    const schema_edit = yup.object().shape({
        id: yup.number().required('number'),
        RawTimeBlock: yup.string().required('Nhập giờ đóng đăng kí'),
        DateMin: yup.number().required('Cần nhập ngày tối thiểu'),
        Using: yup.bool().required('Cần điền trạng thái'),
    });
    const formCreate = useForm<ConfigScheduleCreateForm>({
        resolver: yupResolver(schema_create) as Resolver<ConfigScheduleCreateForm, any>,
    });
    const formEdit = useForm<ConfigScheduleEditForm>({
        resolver: yupResolver(schema_edit) as Resolver<ConfigScheduleEditForm, any>,
    });
    const handleEdit: SubmitHandler<ConfigScheduleEditForm> = (data) => {
        (async () => {
            try {
                if (data.TimeBlock && data.DateMin) {
                    const { id } = data;
                    const postData: ConfigScheduleCreateForm = {
                        TimeBlock: formatTimeValue(data.TimeBlock),
                        DateMin: data.DateMin,
                        Using: data.Using,
                    };
                    setLoading(true);
                    await scheduleApi.updateConfigSchedule(id, postData);
                    fetchData();
                    setOpenEditForm(false);
                    toast({
                        title: 'Thành công',
                        description: 'Tạo cấu hình thành công',
                    });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }
        })();
    };
    const handleCreate: SubmitHandler<ConfigScheduleCreateForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                await scheduleApi.createConfigSchedule(data);
                fetchData();
                formCreate.reset();
                setOpenCreateForm(false);
                toast({
                    title: 'Thành công',
                    description: 'Tạo cấu hình thành công',
                });
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.message,
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
                await scheduleApi.deleteConfigSchedule(id);
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
                                                name="DateMin"
                                                label="Ngày tối thiểu"
                                                placeholder="Nhập ngày tối thiểu"
                                                require={true}
                                            />
                                            <TimeFieldCus
                                                name="TimeBlock"
                                                label="Giờ đóng lịch"
                                                require={true}
                                            />
                                            <SelectionField
                                                name="Using"
                                                label="Trạng thái"
                                                placeholder="Chọn trạng thái"
                                            >
                                                <SelectItem value="1">
                                                    <Badge className="bg-[green]">
                                                        Được sử dụng
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="0">
                                                    <Badge className="bg-[red]">
                                                        Không sử dụng
                                                    </Badge>
                                                </SelectItem>
                                            </SelectionField>
                                        </div>
                                        <p className='text-muted-foreground text-sm'>Lưu ý: Ngày đóng sẽ luôn là <b>chủ nhật</b> trước tuần đăng ký</p>
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
                        <DialogTitle>Xác nhận xóa cấu hình?</DialogTitle>
                    </DialogHeader>
                    <p>Xóa chức vụ {selectRowDelete?.id}</p>
                    <p>
                        Bạn có chắc chắn xóa cấu hình <strong>{selectRowDelete?.id}</strong>?
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
                        <DialogTitle>Chỉnh sửa cấu hình {formEdit.getValues('id')}</DialogTitle>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <div className="grid grid-cols-3 gap-3 mx-1 mb-3">
                                <TextField
                                    name="DateMin"
                                    label="Ngày tối thiểu"
                                    placeholder="Nhập ngày tối thiểu"
                                    require={true}
                                />
                                <TimeFieldCus
                                    name="TimeBlock"
                                    label="Giờ đóng lịch"
                                    require={true}
                                />
                                <SelectionField
                                    name="Using"
                                    label="Trạng thái"
                                    placeholder="Chọn trạng thái"
                                >
                                    <SelectItem value="1">
                                        <Badge className="bg-[green]">Được sử dụng</Badge>
                                    </SelectItem>
                                    <SelectItem value="0">
                                        <Badge className="bg-[red]">Không sử dụng</Badge>
                                    </SelectItem>
                                </SelectionField>
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
