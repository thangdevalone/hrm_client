import { ColumnFiltersState } from '@tanstack/react-table';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface QueryParam {
    page?: number;
    size?: number;
    query?: string;
    sort_by?: string;
    asc?: boolean;
    filters?: ColumnFiltersState;

    [key: string]: string | number | boolean | ColumnFiltersState | undefined;
}

export interface ListResponse<T> {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    data: T;
}
