import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { TimePicker } from '../ui/time-picker';
interface TextFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    require?: boolean;

}
export const TimeFieldCus = (props: TextFieldProps) => {
    const {
        name,
        label,
        disabled = false,
        require = false,

    } = props;
    const form = useFormContext();
    return (
        <FormField
            defaultValue=""
            control={form.control}
            name={name}
            disabled={disabled}
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
                    <FormControl>
                        <TimePicker
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
