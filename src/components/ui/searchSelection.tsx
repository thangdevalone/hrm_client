import * as React from 'react';

import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchSelection = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <div className="flex items-center border-b px-3">
                <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    type={type}
                    ref={ref}
                    className={cn(
                        'flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
SearchSelection.displayName = 'SearchSelection';

export { SearchSelection };
