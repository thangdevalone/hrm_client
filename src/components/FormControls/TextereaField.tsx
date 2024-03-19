import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
interface TextFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    autoComplete?: string;
    require?: boolean;
    type?: string;
    placeholder: string;
}
export const TextareaField = (props: TextFieldProps) => {
    const {
        name,
        label,
        disabled = false,
        autoComplete = 'false',
        placeholder,
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
                <FormItem className="w-full">
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
                        <Textarea
                            placeholder={placeholder}
                            className="min-h-[140px]"
                            autoComplete={autoComplete}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
