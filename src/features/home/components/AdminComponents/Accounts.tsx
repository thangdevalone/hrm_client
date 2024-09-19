/* eslint-disable react-hooks/exhaustive-deps */
import { adminApi } from '@/api/adminApi';
import { DataTablePagination, DataTableViewOptions } from '@/components/common';
import { DataTableFilter } from '@/components/common/DataTableFilter';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoAccount, ListResponse, QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import { ReloadIcon } from '@radix-ui/react-icons';
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
import { useLocation, useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components

export function Accounts() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'UserID', desc: false }]);
    const [listAccount, setListAccount] = React.useState<InfoAccount[]>([]);
    const [totalRow, setTotalRow] = React.useState<number>();
    const [pageCount, setPageCount] = React.useState<number>(1);
    const [loadingTable, setLoadingTable] = React.useState(false);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [query, setQuery] = React.useState<string>('');
    const param = queryString.parse(location.search);
    const [queryLodash, setQueryLodash] = React.useState<string>('');
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: Number(param?.pageIndex || 1) - 1,
        pageSize: Number(param?.pageSize || 10),
    });
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
    const columns: ColumnDef<InfoAccount>[] = [
        {
            accessorKey: 'username',
            header: 'Tên đăng nhập',
            cell: ({ row }) => <div>{row.getValue('username')}</div>,
        },
        {
            accessorKey: 'password',
            header: 'Mật khẩu',
            cell: () => <div>**********</div>,
        },

        {
            accessorKey: 'employee',
            header: 'Thuộc về',
            cell: ({ row }) => <div>{row.original.employee.employeeName}</div>,
        },
        {
            accessorKey: 'userStatus',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge
                    className={`${row.getValue('userStatus') == 'ACTIVE' ? 'bg-[green]' : 'bg-[red]'}`}
                >
                    {row.getValue('userStatus') == 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const { userStatus, id, employee } = row.original;

                // eslint-disable-next-line react-hooks/rules-of-hooks
                const handleSwitchChange = React.useCallback(
                    (checked: boolean) => {
                        console.log(`Switch for EmpID ${employee.employeeName}: `, checked);
                        handleEditAccount(id, checked);
                    },
                    [id],
                );

                return (
                    <Switch checked={userStatus === 'ACTIVE'} onCheckedChange={handleSwitchChange} />
                );
            },
        },
    ];

    React.useEffect(() => {
        handleNavigateQuery();
        const fetchData = async () => {
            try {
                setLoadingTable(true);
                const parsed = queryString.parse(
                    location.search ? location.search : '?page=1&size=10&query=',
                ) as unknown as QueryParam;
                const { data } = (await adminApi.getUserAccount(
                    parsed,
                )) as unknown as { data: ListResponse<InfoAccount[]> };
                setListAccount(data.data);
                setTotalRow(data.totalItems);
                setPageCount(
                    Math.ceil(data.totalItems / table.getState().pagination.pageSize),
                );
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingTable(false);
            }
        };
        fetchData();
    }, [query, pagination, sorting, columnFilters]);

    const table = useReactTable({
        data: listAccount,
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
    // const setDataEdit = (data: Row<InfoAccount>) => {};

    const handleEditAccount = (id: string | undefined, checked: boolean) => {
        if (id === undefined) return;
        (async () => {
            try {
                await adminApi.editAccount(id, { userStatus: checked ? 'ACTIVE' : 'INACTIVE' });
                const newData = listAccount.map((account) =>
                    account.id === id ? { ...account, userStatus: checked ? 'ACTIVE' : 'INACTIVE' } : account,
                );
                setListAccount(newData as unknown as InfoAccount[]);
            } catch (error) {
                console.log(error);
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
                    {table.getColumn('userStatus') && (
                        <DataTableFilter
                            column={table.getColumn('userStatus')}
                            title="Trạng thái"
                            options={[
                                {
                                    value: 'Hoạt động',
                                    id: '1',
                                },
                                {
                                    value: 'Ngừng hoạt động',
                                    id: '0',
                                },
                            ]}
                            reverse={true}
                            api=""
                        />
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
            <div className="rounded-md border">
                <ScrollArea style={{ height: 'calc(100vh - 270px)' }} className=" relative w-full">
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
            <DataTablePagination table={table} totalRow={totalRow || 0} />
        </div>
    );
}
