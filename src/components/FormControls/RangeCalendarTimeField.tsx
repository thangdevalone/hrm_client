/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, subDays } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { TimePickerDemo } from '../ui/time-picker-2';
interface RangeCalendarTimeFieldProps {
    label?: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    require?: boolean;
    disableDate?: boolean;
}
export const RangeCalendarTimeField = (props: RangeCalendarTimeFieldProps) => {
    const {
        name,
        label = '',
        disabled = false,
        placeholder,
        require = false,
        disableDate = true,
    } = props;
    const form = useFormContext();  
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
                        <FormControl>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={disabled}
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                        format(field.value, 'dd/MM/yyyy HH:mm:ss')
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: any) => (disableDate ? date < subDays(new Date(), 1) : false)}
                                initialFocus
                            />
                            <div className="p-3 border-t border-border">
                                <TimePickerDemo setDate={field.onChange} date={field.value} />
                            </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
