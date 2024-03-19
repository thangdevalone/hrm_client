import { CheckIcon } from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';
import * as React from 'react';

import queryApi from '@/api/queryApi';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface DataTableFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options:
        | {
              id: string;
              value: string;
              icon?: React.ComponentType<{ className?: string }>;
          }[]
        | null;
    api: string;
    reverse?: boolean;
}

export function DataTableFilter<TData, TValue>({
    column,
    title,
    options,
    api,
    reverse = false,
}: DataTableFilterProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues();
    const selectedValues = new Set(column?.getFilterValue() as string[]);
    const [optionsData, setOptionsData] = React.useState<
        | {
              id: string;
              value: string;
              icon?: React.ComponentType<{ className?: string }>;
          }[]
        | null
    >(options);
    React.useEffect(() => {
        (async () => {
            if (!options) {
                try {
                    const res = await queryApi.querySearch({ query: '' }, api);
                    const data = res.data as unknown as { id: string; value: string }[];
                    setOptionsData(data);
                } catch (error) {
                    console.log(error);
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed">
                    <Icons.filter className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    optionsData
                                        ?.filter((option) =>reverse ? selectedValues.has(option.id) : selectedValues.has(option.value))
                                        .map((option) => {
                                            console.log(option);
                                            return (
                                                <Badge
                                                    variant="secondary"
                                                    key={option.id}
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {option.value}
                                                </Badge>
                                            );
                                        })
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <ScrollArea className="h-[250px] ">
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {optionsData?.map((option) => {
                                    const isSelected = selectedValues.has(
                                        reverse ? option.id : option.value
                                    );
                                    return (
                                        <CommandItem
                                            key={option.id}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    selectedValues.delete(
                                                        reverse ? option.id : option.value
                                                    );
                                                } else {
                                                    selectedValues.add(
                                                        reverse ? option.id : option.value
                                                    );
                                                }
                                                const filterValues = Array.from(selectedValues);
                                                column?.setFilterValue(
                                                    filterValues.length ? filterValues : undefined
                                                );
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'opacity-50 [&_svg]:invisible'
                                                )}
                                            >
                                                <CheckIcon className={cn('h-4 w-4')} />
                                            </div>
                                            {option.icon && (
                                                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>{option.value}</span>
                                            {facets?.get(option.value) && (
                                                <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                    {facets.get(option.value)}
                                                </span>
                                            )}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {selectedValues.size > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => column?.setFilterValue(undefined)}
                                            className="justify-center text-center"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
