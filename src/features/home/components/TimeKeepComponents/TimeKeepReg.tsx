/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import timeKeepApi from '@/api/timeKeepApi';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
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
import {
    InfoTimeKeep,
    ListResponse,
    QueryParam
} from '@/models';
import { ConvertQueryParam, cryString } from '@/utils';
import { ReloadIcon } from '@radix-ui/react-icons';
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
import { format } from 'date-fns';
import queryString from 'query-string';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const TimeKeepReg = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listTimeKeep, setListTimeKeep] = React.useState<InfoTimeKeep[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [pageCount, setPageCount] = React.useState<number>();

    // const [loading, setLoading] = React.useState<boolean>(false);
    const [loadingTable, setLoadingTable] = React.useState(false);
    const param = queryString.parse(location.search);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const { toast } = useToast();
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'id', desc: true }]);

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });


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
    const columns: ColumnDef<InfoTimeKeep>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mã chấm công" />,
            cell: ({ row }) => <div className='ml-2'>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'TimeIn',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ đến" />,
            cell: ({ row }) => <div>{format(row.getValue('TimeIn'), 'dd/MM/yyyy hh:mm:ss')}</div>,
        },
        {
            accessorKey: 'TimeOut',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ về" />,
            cell: ({ row }) => <div>{row.getValue('TimeOut')?format(row.getValue('TimeOut'), 'dd/MM/yyyy hh:mm:ss'):"Chưa check out"}</div>,
        },
        {
            accessorKey: 'Late',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số giờ muộn" />,
            cell: ({ row }) => <div>{row.getValue('Late')||0}</div>,
        },
        {
            accessorKey: 'WorkHour',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số giờ làm" />,
            cell: ({ row }) => <div>{row.getValue('WorkHour')||0}</div>,
        },
    ];
    const fetchData = async () => {
        try {
            setLoadingTable(true);
            
            const parsed = queryString.parse(
                location.search ? location.search : '?pageIndex=1&pageSize=10&query='
            ) as unknown as QueryParam;
            const jobData = (await timeKeepApi.getListTimeKeep(parsed)) as unknown as ListResponse;
            setListTimeKeep(jobData.data);
            setTotalRow(jobData.total_rows);
            setPageCount(Math.ceil(jobData.total_rows / table.getState().pagination.pageSize));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };

    React.useEffect(() => {
        handleNavigateQuery();

        fetchData();
    }, [sorting, columnFilters, pagination]);

    const table = useReactTable({
        data: listTimeKeep,
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
    const handleCheckIn= async()=>{
        try {
            await timeKeepApi.checkin(cryto)
            toast({
                title:"Check in thành công!"
            })
            fetchData();
        } catch (error) {
            console.log(error)
            toast({
                variant:"destructive",
                title:"Check in thất bại!",
                description:error.error
            })
        }
    }
    const [cryto, setCrypto] = React.useState('');
    React.useEffect(() => {
        const fetchIP = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                setCrypto(data.ip);
              
            } catch (error) {
                console.error('Error fetching client IP:', error);
            }
        };

        fetchIP();
    }, []);
    const handleCheckOut= async()=>{
        try {
            await timeKeepApi.checkout(cryto)
            toast({
                title:"Check out thành công!"
            })
            fetchData();
        } catch (error) {
            console.log(error)
            toast({
                variant:"destructive",
                title:"Check in thất bại!",
                description:error.error
            })
        }
    }
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center">
                <div className="flex flex-row gap-4">
                    <Button onClick={()=>handleCheckIn()}>Check in</Button>
                    <Button onClick={()=>handleCheckOut()}>Check out</Button>
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
            <DataTablePagination table={table} totalRow={totalRow || 0} />
        </div>
    );
};
