/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
interface CalendarFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    require?: boolean;
    disabledDate?:boolean
}
export const CalendarField = (props: CalendarFieldProps) => {
    const { name, label, disabled = false, placeholder, require = false,disabledDate=true } = props;
    const form = useFormContext();
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem >
                    <FormLabel className=" relative">
                        {label}
                        {require && (
                            <span className="text-xl absolute top-[-5px] right-[-10px] text-[red]">
                                {' '}
                                *
                            </span>
                        )}
                    </FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={'outline'}
                                    disabled={disabled}
                                    className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}
                                >
                                    {field.value ? (
                                       dayjs(field.value).format("DD/MM/YYYY")
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: any) =>
                                    disabledDate ?date < new Date():date
                                }
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
