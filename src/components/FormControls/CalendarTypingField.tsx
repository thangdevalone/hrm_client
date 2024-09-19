import { useFormContext } from 'react-hook-form';
import { DateField } from '../ui/date-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { parseDate } from '@internationalized/date';
import { useEffect, useState } from 'react';
import { DateValue } from 'react-aria';
import { format } from 'date-fns';

interface CalendarFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    require?: boolean;
}

export const CalendarTypingField = (props: CalendarFieldProps) => {
    const { name, label, disabled = false, require = false } = props;
    const form = useFormContext();
    const [value, setValue] = useState<DateValue | null>(
        form.getValues(name) ? parseDate(form.getValues(name)) : null
    );

    useEffect(() => {
        setValue(form.getValues(name) ? parseDate(form.getValues(name)) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.getValues(name)]);
    
    return (
        <FormField
            control={form.control}
            name={name}
            disabled={disabled}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className=" relative">
                        {label}
                        {require && (
                            <span className="text-xl absolute top-[-5px] right-[-10px] text-[red]">
                                {' '}
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <DateField
                            isDisabled={disabled}
                            {...field}
                            aria-label={name}
                       
                            value={value}
                            onChange={(value) => {
                                if (value && value.toDate('UTC')) {
                                    setValue(value);
                                }
                                if (value && value.toString()) {
                                    form.setValue(name, format(value.toString(), 'yyyy-MM-dd'));
                                }
                            }}
                        />
                        
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
