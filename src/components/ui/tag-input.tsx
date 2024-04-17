import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { type VariantProps } from 'class-variance-authority';
import { CommandInput } from '@/components/ui/command';
import { toast } from '../ui/use-toast';
import { v4 as uuid } from 'uuid';
import { TagPopover } from './tag-popover';
import { TagList } from './tag-list';
import { tagVariants } from './tag';
import { Autocomplete } from './auto-complete';

// eslint-disable-next-line react-refresh/only-export-components
export enum Delimiter {
    Comma = ',',
    Enter = 'Enter',
    Space = ' ',
}

type OmittedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'>;

export type Tag = {
    id: string;
    text: string;
    is_complete: boolean;
    old: boolean;
    is_checkin?:boolean;
};

export interface TagInputProps extends OmittedInputProps, VariantProps<typeof tagVariants> {
    placeholder?: string;
    tags: Tag[];
    setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    enableAutocomplete?: boolean;
    autocompleteOptions?: Tag[];
    maxTags?: number;
    minTags?: number;
    readOnly?: boolean;
    disabled?: boolean;
    onTagAdd?: (tag: string) => void;
    onTagRemove?: (tag: string) => void;
    allowDuplicates?: boolean;
    validateTag?: (tag: string) => boolean;
    delimiter?: Delimiter;
    showCount?: boolean;
    placeholderWhenFull?: string;
    sortTags?: boolean;
    delimiterList?: string[];
    truncate?: number;
    minLength?: number;
    maxLength?: number;
    usePopoverForTags?: boolean;
    value?: string | number | readonly string[] | { id: string; text: string }[];
    autocompleteFilter?: (option: string) => boolean;
    direction?: 'row' | 'column';
    onInputChange?: (value: string) => void;
    customTagRenderer?: (tag: Tag) => React.ReactNode;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onTagClick?: (tag: Tag) => void;
    draggable?: boolean;
    inputFieldPostion?: 'bottom' | 'top' | 'inline';
    clearAll?: boolean;
    onClearAll?: () => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    restrictTagsToAutocompleteOptions?: boolean;
    is_checkin?:boolean;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props, ref) => {
        const {
            id,
            placeholder,
            tags,
            setTags,
            variant,
            size,
            shape,
            className,
            enableAutocomplete,
            autocompleteOptions,
            maxTags,
            delimiter = Delimiter.Comma,
            onTagAdd,
            onTagRemove,
            allowDuplicates,
            showCount,
            validateTag,
            placeholderWhenFull = 'Max tags reached',
            sortTags,
            delimiterList,
            truncate,
            autocompleteFilter,
            borderStyle,
            textCase,
            interaction,
            animation,
            textStyle,
            minLength,
            maxLength,
            direction = 'row',
            onInputChange,
            customTagRenderer,
            onFocus,
            onBlur,
            onTagClick,
            draggable = false,
            inputFieldPostion = 'bottom',
            clearAll = false,
            onClearAll,
            usePopoverForTags = false,
            inputProps = {},
            restrictTagsToAutocompleteOptions = false,
            is_checkin=true,
            disabled,
        } = props;

        const [inputValue, setInputValue] = React.useState('');
        const [tagCount, setTagCount] = React.useState(Math.max(0, tags.length));
        const inputRef = React.useRef<HTMLInputElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [draggedTagId, setDraggedTagId] = React.useState<string | null>(null);

        if (
            (maxTags !== undefined && maxTags < 0) ||
            (props.minTags !== undefined && props.minTags < 0)
        ) {
            console.warn('maxTags and minTags cannot be less than 0');
            toast({
                title: 'maxTags and minTags cannot be less than 0',
                description: 'Please set maxTags and minTags to a value greater than or equal to 0',
                variant: 'destructive',
            });
            return null;
        }

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            onInputChange?.(newValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                delimiterList
                    ? delimiterList.includes(e.key)
                    : e.key === delimiter || e.key === Delimiter.Enter
            ) {
                e.preventDefault();
                const newTagText = inputValue.trim();

                // Check if the tag is in the autocomplete options if restrictTagsToAutocomplete is true
                if (
                    restrictTagsToAutocompleteOptions &&
                    !autocompleteOptions?.some((option) => option.text === newTagText)
                ) {
                    toast({
                        title: 'Invalid Tag',
                        description: 'Please select a tag from the autocomplete options.',
                        variant: 'destructive',
                    });
                    return;
                }

                if (validateTag && !validateTag(newTagText)) {
                    return;
                }

                if (minLength && newTagText.length < minLength) {
                    console.warn('Tag is too short');
                    toast({
                        title: 'Tag is too short',
                        description: 'Please enter a tag with more characters',
                        variant: 'destructive',
                    });
                    return;
                }

                // Validate maxLength
                if (maxLength && newTagText.length > maxLength) {
                    toast({
                        title: 'Tag is too long',
                        description: 'Please enter a tag with less characters',
                        variant: 'destructive',
                    });
                    console.warn('Tag is too long');
                    return;
                }

                const newTagId = uuid();

                if (
                    newTagText &&
                    (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
                    (maxTags === undefined || tags.length < maxTags)
                ) {
                    setTags([
                        ...tags,
                        { id: newTagId, text: newTagText, is_complete: false, old: false,is_checkin:is_checkin },
                    ]);
                    onTagAdd?.(newTagText);
                    setTagCount((prevTagCount) => prevTagCount + 1);
                }
                setInputValue('');
            }
        };

        const removeTag = (idToRemove: string) => {
            setTags(tags.filter((tag) => tag.id !== idToRemove));
            onTagRemove?.(tags.find((tag) => tag.id === idToRemove)?.text || '');
            setTagCount((prevTagCount) => prevTagCount - 1);
        };

        const onSortEnd = (oldIndex: number, newIndex: number) => {
            setTags((currentTags) => {
                const newTags = [...currentTags];
                const [removedTag] = newTags.splice(oldIndex, 1);
                newTags.splice(newIndex, 0, removedTag);

                return newTags;
            });
        };

        const handleClearAll = () => {
            onClearAll?.();
        };

        const filteredAutocompleteOptions = autocompleteFilter
            ? autocompleteOptions?.filter((option) => autocompleteFilter(option.text))
            : autocompleteOptions;

        const displayedTags = sortTags ? [...tags].sort() : tags;

        const truncatedTags = truncate
            ? tags.map((tag) => ({
                is_checkin:is_checkin,
                  old: tag.old,
                  is_complete: tag.is_complete,
                  id: tag.id,
                  text:
                      tag.text?.length > truncate
                          ? `${tag.text.substring(0, truncate)}...`
                          : tag.text,
              }))
            : displayedTags;
        const handleChangeTag = (id: string) => {
          
          setTags((currentTags) => {
            // Make a copy of the current tags array to avoid mutating state directly
            const updatedTags = [...currentTags];
            // Find the index of the tag to be updated
            const tagIndex = updatedTags.findIndex((tag) => tag.id === id);
            
            // Make sure the tag index is found
            if (tagIndex !== -1) {
                // Update the is_complete property of the tag
                updatedTags[tagIndex] = {
                    ...updatedTags[tagIndex], // Maintain other properties of the tag
                    is_complete: !updatedTags[tagIndex].is_complete // Toggle is_complete
                };
                
                // Update state with the updated tags array
                return updatedTags;
            }
        
            // If the tag with the given ID is not found, return the current state unchanged
            return currentTags;
        });
        
           
        };
        return (
            <div
                className={`w-full flex gap-3 ${
                    inputFieldPostion === 'bottom'
                        ? 'flex-col'
                        : inputFieldPostion === 'top'
                        ? 'flex-col-reverse'
                        : 'flex-row'
                }`}
            >
                {!usePopoverForTags ? (
                    <TagList
                        tags={truncatedTags}
                        customTagRenderer={customTagRenderer}
                        variant={variant}
                        size={size}
                        shape={shape}
                        borderStyle={borderStyle}
                        textCase={textCase}
                        interaction={interaction}
                        animation={animation}
                        textStyle={textStyle}
                        onTagClick={onTagClick}
                        draggable={draggable}
                        onSortEnd={onSortEnd}
                        onRemoveTag={removeTag}
                        direction={direction}
                        onChangeTag={handleChangeTag}
                    />
                ) : null}
                {enableAutocomplete ? (
                    <div className="w-full max-w-[450px]">
                        <Autocomplete
                            tags={tags}
                            setTags={setTags}
                            autocompleteOptions={filteredAutocompleteOptions as Tag[]}
                            maxTags={maxTags}
                            onTagAdd={onTagAdd}
                            allowDuplicates={allowDuplicates ?? false}
                        >
                            {!usePopoverForTags ? (
                                <CommandInput
                                    placeholder={
                                        maxTags !== undefined && tags.length >= maxTags
                                            ? placeholderWhenFull
                                            : placeholder
                                    }
                                    ref={inputRef}
                                    value={inputValue}
                                    disabled={maxTags !== undefined && tags.length >= maxTags}
                                    onChangeCapture={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                    className="w-full"
                                />
                            ) : (
                                <TagPopover
                                    tags={truncatedTags}
                                    customTagRenderer={customTagRenderer}
                                    variant={variant}
                                    size={size}
                                    shape={shape}
                                    borderStyle={borderStyle}
                                    textCase={textCase}
                                    interaction={interaction}
                                    animation={animation}
                                    textStyle={textStyle}
                                    onTagClick={onTagClick}
                                    draggable={draggable}
                                    onSortEnd={onSortEnd}
                                    onRemoveTag={removeTag}
                                    direction={direction}
                                    onChangeTag={handleChangeTag}
                                >
                                    <CommandInput
                                        placeholder={
                                            maxTags !== undefined && tags.length >= maxTags
                                                ? placeholderWhenFull
                                                : placeholder
                                        }
                                        ref={inputRef}
                                        value={inputValue}
                                        disabled={maxTags !== undefined && tags.length >= maxTags}
                                        onChangeCapture={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                        className="w-full"
                                    />
                                </TagPopover>
                            )}
                        </Autocomplete>
                    </div>
                ) : (
                    <div className="w-full">
                        {!usePopoverForTags ? (
                            <Input
                                ref={inputRef}
                                id={id}
                                autoFocus={true}
                                type="text"
                                placeholder={
                                    maxTags !== undefined && tags.length >= maxTags
                                        ? placeholderWhenFull
                                        : placeholder
                                }
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                {...inputProps}
                                className={className}
                                autoComplete={enableAutocomplete ? 'on' : 'off'}
                                list={enableAutocomplete ? 'autocomplete-options' : undefined}
                                disabled={(maxTags !== undefined && tags.length >= maxTags )|| disabled}
                            />
                        ) : (
                            <TagPopover
                                tags={truncatedTags}
                                customTagRenderer={customTagRenderer}
                                variant={variant}
                                size={size}
                                shape={shape}
                                borderStyle={borderStyle}
                                textCase={textCase}
                                interaction={interaction}
                                animation={animation}
                                textStyle={textStyle}
                                onTagClick={onTagClick}
                                draggable={draggable}
                                onSortEnd={onSortEnd}
                                onRemoveTag={removeTag}
                                direction={direction}
                                onChangeTag={handleChangeTag}
                            >
                                <Input
                                    ref={inputRef}
                                    id={id}
                                    type="text"
                                    placeholder={
                                        maxTags !== undefined && tags.length >= maxTags
                                            ? placeholderWhenFull
                                            : placeholder
                                    }
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                    {...inputProps}
                                    className={className}
                                    autoComplete={enableAutocomplete ? 'on' : 'off'}
                                    list={enableAutocomplete ? 'autocomplete-options' : undefined}
                                    disabled={maxTags !== undefined && tags.length >= maxTags}
                                />
                            </TagPopover>
                        )}
                    </div>
                )}
                {showCount && maxTags && (
                    <div className="flex">
                        <span className="text-muted-foreground text-sm mt-1 ml-auto">
                            {`${tagCount}`}/{`${maxTags}`}
                        </span>
                    </div>
                )}
                {clearAll && (
                    <Button type="button" onClick={handleClearAll} className="mt-2">
                        Clear All
                    </Button>
                )}
            </div>
        );
    }
);

TagInput.displayName = 'TagInput';

export { TagInput };
