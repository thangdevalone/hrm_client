import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import {
    Select,
    SelectContent,

    SelectTrigger,
    SelectValue
} from '../ui/select';
interface SelectionFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    children: ReactNode;
    require?:boolean
}
export const SelectionField = (props: SelectionFieldProps) => {
    const { name, label, disabled = false, placeholder,require=false } = props;
    const form = useFormContext();

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="">
                    <FormLabel className="relative">{label} {require&& <span className="text-xl absolute top-[-5px] right-[-10px] text-[red]"> *</span>}</FormLabel>
                    <FormControl>
                        <Select
                            disabled={disabled}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                        >
                            <SelectTrigger {...field} className="">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                               {props.children}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
