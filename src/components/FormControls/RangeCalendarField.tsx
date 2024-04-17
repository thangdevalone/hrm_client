/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, subDays } from 'date-fns';
import React, { useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
interface RangeCalendarFieldProps {
    label?: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    require?: boolean;
    disableDate?: boolean;
}
export const RangeCalendarField = (props: RangeCalendarFieldProps) => {
    const {
        name,
        label = '',
        disabled = false,
        placeholder,
        require = false,
        disableDate = true,
    } = props;
    const form = useFormContext();

    // {
    //     from: new Date(2022, 0, 20),
    //     to: addDays(new Date(2022, 0, 20), 20),
    // }
    const [date, setDate] = React.useState<DateRange | undefined>();
    useEffect(() => {
        const val = form.getValues(name);
        if (val) {
            setDate({
                from: form.getValues('RawDateStart'),
                to: form.getValues('RawDateEnd'),
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && (
                        <FormLabel className=" relative">
                            {label}
                            {require && (
                                <span className="text-xl absolute top-[-5px] right-[-10px] text-[red]">
                                    {' '}
                                    *
                                </span>
                            )}
                        </FormLabel>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={'outline'}
                                    disabled={disabled}
                                    className={cn(
                                        'w-full pl-3 flex gap-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}
                                >
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, 'dd/MM/yyyy')} -{' '}
                                                {format(date.to, 'dd/MM/yyyy')}
                                            </>
                                        ) : (
                                            format(date.from, 'dd/MM/yyyy')
                                        )
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={date}
                                onSelect={(date: any) => {
                                    setDate(date);
                                    const valueStringDate = date?.from
                                        ? date.to
                                            ? `${format(date.from, 'dd/MM/yyyy')}-${format(
                                                  date.to,
                                                  'dd/MM/yyyy'
                                              )}`
                                            : `${format(date.from, 'dd/MM/yyyy')}`
                                        : '';
                                    form.setValue(`${name}`, valueStringDate);
                                }}
                                disabled={(date: any) => (disableDate ? date < subDays(new Date(), 1) : false)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
