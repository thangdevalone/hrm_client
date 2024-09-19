import queryApi from '@/api/queryApi';
import { cn } from '@/lib/utils';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

interface SearchFieldProps {
    typeApi: string;
    label: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    require?: boolean;
}

export interface dataSearch {
    id: string | number;
    value: string;
}

export const SearchField = (props: SearchFieldProps) => {
    const { name, label, disabled = false, placeholder = '', typeApi, require = false } = props;
    const form = useFormContext();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<dataSearch[]>();
    const [loading, setLoading] = useState(false);

    const [choose, setChoose] = useState<string>();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log(typeApi);
            const data = await queryApi.querySearch(typeApi) as unknown as dataSearch[];
            console.log(data);

            setData(data);
            const chosenItem = data.find(item => item.id === form.getValues(name))?.value || undefined;
            setChoose(chosenItem);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.getValues(name), name, typeApi]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="">
                    <FormLabel className="relative">
                        {label}
                        {require && (
                            <span className="text-xl absolute top-[-5px] right-[-10px] text-[red]">
                                {' '}
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl {...field}>

                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={disabled || loading}
                                    variant="outline"
                                    role="combobox"
                                    className="w-full  justify-between"
                                >


                                    <span className="line-clamp-1 block  text-ellipsis">
                                        {choose ? choose : `${placeholder}`}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px]  p-0">
                                <Command>
                                    <CommandInput placeholder="Search..." className="h-9" />
                                    {!loading && (
                                        <ScrollArea className="h-[200px]">
                                            {data && data?.length > 0 ? (
                                                <CommandGroup>
                                                    {data.map((item) => (
                                                        <CommandItem
                                                            key={item.id}
                                                            className="justify-between"
                                                            value={`${item.id}`}
                                                            onSelect={() => {
                                                                form.setValue(`${name}`, item.id);

                                                                setChoose(item.value);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <span className="ml-1">
                                                                {item.value}
                                                            </span>
                                                            <Check
                                                                className={cn(
                                                                    'h-4 w-4',
                                                                    field.value == item.id
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            ) : (
                                                <CommandEmpty>Không tìm thấy dữ liệu</CommandEmpty>
                                            )}
                                        </ScrollArea>
                                    )}
                                    {loading && (
                                        <div className="flex h-[50px] items-center justify-center">
                                            {' '}
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        </div>
                                    )}
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
