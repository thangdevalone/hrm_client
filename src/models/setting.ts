import { ColumnFiltersState } from '@tanstack/react-table';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface QueryParam {
    pageIndex?: number;
    pageSize?: number;
    query?: string;
    sort_by?: string;
    asc?: boolean;
    filters?: ColumnFiltersState;
    [key: string]: string | number | boolean | ColumnFiltersState | undefined;
}
export interface ListResponse {
    total_rows: number;
    current_page: number;
    data: any;
}
