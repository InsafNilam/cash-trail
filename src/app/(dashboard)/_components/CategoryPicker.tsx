"use client";

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Category } from '@/generated/prisma'
import { TransactionType } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import CreateCategoryDialog from './CreateCategoryDialog'
import { Check, ChevronsUpDown, Loader2, PlusSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  type: TransactionType;
  onChange: (category: string) => void;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function CategoryPicker({
  type,
  onChange,
  value: controlledValue,
  placeholder = "Select a category",
  disabled = false,
  className
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | null>(controlledValue || null);
  const [searchValue, setSearchValue] = React.useState("");

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue ?? internalValue;

  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const categories = React.useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const selectedCategory = categories.find((category: Category) => category.name === value);

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchValue.trim()) return categories;
    return categories.filter((category: Category) =>
      category.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [categories, searchValue]);

  const handleSelect = React.useCallback((categoryName: string) => {
    const newValue = categoryName === value ? null : categoryName;

    if (!controlledValue) {
      setInternalValue(newValue);
    }

    onChange(newValue || "");
    setOpen(false);
    setSearchValue("");
  }, [value, controlledValue, onChange]);

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (!controlledValue) {
      setInternalValue(null);
    }

    onChange("");
    setSearchValue("");
  }, [controlledValue, onChange]);

  const successCallback = React.useCallback((category: Category) => {
    if (!controlledValue) {
      setInternalValue(category.name);
    }
    onChange(category.name);
    setOpen(false);
    setSearchValue("");
  }, [controlledValue, onChange]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={selectedCategory ? `Selected category: ${selectedCategory.name}` : placeholder}
          className={cn(
            "w-full min-w-0 justify-between px-3 py-2",
            "bg-background text-foreground border-border shadow-sm",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "sm:w-[200px] md:w-[250px]",
            className
          )}
          disabled={disabled}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            {selectedCategory ? (
              <CategoryRow category={selectedCategory} />
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="h-5 w-5 p-0 text-muted-foreground hover:bg-destructive/10 rounded-md flex items-center justify-center transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>

      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] rounded-md bg-popover text-popover-foreground border border-border shadow-lg p-0"
        align="start"
      >
        <Command className="max-h-[300px]" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b border-border">
            {/* Search Input */}
            <div className='flex-1'>
              <CommandInput
                placeholder="Search categories..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>

            {/* Create Button */}
            <CreateCategoryDialog
              type={type}
              onSuccessCallback={successCallback}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent transition"
                  aria-label="Create new category"
                >
                  <PlusSquare className="h-4 w-4" />
                </Button>
              }
            />
          </div>

          <CommandList>
            {categoriesQuery.isLoading && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading categories...
              </div>
            )}

            {categoriesQuery.isError && (
              <div className="flex items-center justify-center py-6 text-destructive">
                Failed to load categories
              </div>
            )}

            {!categoriesQuery.isLoading && !categoriesQuery.isError && (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs text-muted-foreground">
                      {searchValue
                        ? "Try different keywords"
                        : "Create a new category to get started"}
                    </p>
                  </div>
                </CommandEmpty>

                <CommandGroup>
                  {filteredCategories.map((category: Category) => (
                    <CommandItem
                      key={category.name}
                      value={category.name}
                      onSelect={() => handleSelect(category.name)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <CategoryRow category={category} />
                      <Check
                        className={cn(
                          "h-4 w-4 transition-opacity",
                          value === category.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span
        role="img"
        aria-label={category.name}
        className="text-lg shrink-0"
      >
        {category.icon}
      </span>
      <span className="truncate text-sm font-medium">
        {category.name}
      </span>
    </div>
  );
}
