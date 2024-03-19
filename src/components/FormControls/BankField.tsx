import { Bank } from '@/models';
import { ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VietQR } from 'vietqr';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
interface BankFieldProps {
    label: string;
    name: string;
    disabled?: boolean | undefined;
    placeholder: string;
    require?: boolean;
}
export const BankField = (props: BankFieldProps) => {
    const { name, label, disabled = false, placeholder = '', require = false } = props;
    const form = useFormContext();
    const [choose, setChoose] = React.useState<string>();
    const [open, setOpen] = React.useState(false);

    const [banks, setBanks] = React.useState<Bank[]>([]);
    React.useEffect(() => {
        const vietQR = new VietQR({
            clientID: '2e85ba36-7cbd-45e6-945b-a8a843e0d698',
            apiKey: 'bdf88036-a074-4499-9e35-9d5791896abb',
        });

        vietQR
            .getBanks()
            .then((data) => {
                //
                setBanks(data.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    React.useEffect(() => {
        setChoose(form.getValues(name)||"");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.getValues(name), name]);
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="">
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
                        <Popover open={open}  onOpenChange={setOpen} >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className=" justify-between  w-full"
                                    disabled={disabled}
                                >
                                    <span className="line-clamp-1 block  text-ellipsis">
                                        {choose ? choose : `${placeholder}`}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[500px] p-0">
                                <Command {...field} value={field.value}>
                                    <CommandInput placeholder="Search bank..." />
                                    <CommandEmpty>No bank found.</CommandEmpty>
                                    <ScrollArea className="h-[200px] overflow-y-auto">
                                        <CommandGroup>
                                            {banks.map((bank) => {
                                                
                                                const bankmerge = (
                                                    bank.shortName +
                                                    ' – ' +
                                                    bank.name
                                                ).toUpperCase();
                                                return (
                                                    <CommandItem
                                                        key={bank.id}
                                                        value={bankmerge}
                                                        onSelect={() => {
                                                        
                                                            form.setValue(name, bankmerge);
                                                            setChoose(bankmerge);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <img
                                                            src={bank.logo}
                                                            className="w-[100px] rounded-[50%]"
                                                            alt={bank.code}
                                                        />{' '}
                                                        <span className="line-clamp-1 block text-ellipsis">
                                                            {bankmerge}
                                                        </span>
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </ScrollArea>
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
