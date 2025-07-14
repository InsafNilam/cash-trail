"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/category';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';
import Picker from "@emoji-mart/react";
import data from '@emoji-mart/data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { Category } from '@/generated/prisma';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

interface Props {
  type: TransactionType;
  onSuccessCallback: (category: Category) => void;
  trigger?: React.ReactNode;
}

export default function CreateCategoryDialog({ type, onSuccessCallback, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type: type,
      name: '',
      icon: '',
    },
  })
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });

      toast.success(`Category ${data.name} created successfully! 🎉`, {
        id: 'create-category',
      });

      onSuccessCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });

      setOpen((prev) => !prev);
    },
    onError: () => {
      toast.error('Something went wrong', {
        id: 'create-category',
      })
    }
  })

  const onSubmit = React.useCallback((values: CreateCategorySchemaType) => {
    toast.loading('Creating category...', {
      id: 'create-category',
    });

    mutate(values);
  }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <PlusSquare className="h-4 w-4" />
            Create new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create <span className={cn('m-1', type === "income" ? "text-emerald-500" : "text-red-500")}>{type}</span> category
          </DialogTitle>
          <DialogDescription>
            Categories are used to group your transactions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Category name (3-20 characters)</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <PickerDialog onChange={field.onChange} theme={theme.resolvedTheme} trigger={
                      <Button variant="outline" className="h-[100px] w-full">
                        {form.watch("icon") ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-5xl" role="img">
                              {field.value}
                            </span>
                            <p className="text-xs text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <CircleOff className="h-[48px] w-[48px]" />
                            <p className="text-xs text-muted-foreground">Click to select</p>
                          </div>
                        )}
                      </Button>
                    }>
                    </PickerDialog>
                  </FormControl>
                  <FormDescription>Category icon (optional)</FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant={"secondary"} onClick={() => form.reset()}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>{isPending ? <Loader2 className='animate-spin' /> : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PickerDialog({
  onChange,
  theme,
  trigger,
}: {
  onChange: (value: string) => void;
  theme: string | undefined;
  trigger: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const handleEmojiSelect = (emoji: { native: string }) => {
    onChange(emoji.native);
    setOpen(false);
  };

  // const getPerLine = () => {
  //   if (typeof window === 'undefined') return 9; // Default value for server-side rendering
  //   const width = window.innerWidth;
  //   if (width < 640) return 5; // Mobile
  //   if (width < 768) return 6; // Tablet
  //   return 9; // Desktop
  // }

  // const getEmojiSize = () => {
  //   if (typeof window !== 'undefined') {
  //     const width = window.innerWidth;
  //     if (width < 480) return 20;
  //     if (width < 640) return 22;
  //     return 24;
  //   }
  //   return 24;
  // };

  // const getEmojiButtonSize = () => {
  //   if (typeof window !== 'undefined') {
  //     const width = window.innerWidth;
  //     if (width < 480) return 30;
  //     if (width < 640) return 34;
  //     return 36;
  //   }
  //   return 36;
  // };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="max-w-sm max-h-[85vh] sm:max-h-[90vh] overflow-hidden p-0" style={{ maxWidth: '24rem', maxHeight: '90vh' }}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">Select a Category Icon</DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="p-2 sm:p-4 pt-0 overflow-y-auto">
          <Picker
            data={data}
            previewPosition="none"
            theme={theme}
            onEmojiSelect={handleEmojiSelect}
            emojiButtonSize={36}
            emojiSize={24}
            perLine={9}
            maxFrequentRows={0}
            searchPosition="sticky"
            skinTonePosition="none"
            set="native"
            autoFocus={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
