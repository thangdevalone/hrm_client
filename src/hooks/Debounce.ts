import { useState, useEffect } from 'react';

interface UseDebounceProps {
    value: string;
    seconds: number;
}

export const useDebounce = ({ value, seconds }: UseDebounceProps) => {
    const [debounceValue, setDebounceValue] = useState<string>('');
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebounceValue(value);
        }, seconds);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, seconds]);
    return debounceValue;
};
