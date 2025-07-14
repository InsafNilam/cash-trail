"use client"

import { Category } from '@/generated/prisma';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteCategory } from '../_actions/categories';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionType } from '@/lib/types';

interface Props {
    trigger?: React.ReactNode;
    category: Category;
}

export default function DeleteCategoryDialog({ category, trigger }: Props) {
    const categoryIdentifier = `${category.name}-${category.type}`;
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success('Category deleted successfully!', {
                id: `delete-category-${categoryIdentifier}`,
            });

            await queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
        onError: () => {
            toast.error('Failed to delete category', {
                id: `delete-category-${categoryIdentifier}`,
            });
        },
    });
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the category <strong>{category.name}</strong> of type <strong>{category.type}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading('Deleting category...', { id: `delete-category-${categoryIdentifier}` });
                        deleteMutation.mutate({ name: category.name, type: category.type as TransactionType });
                    }}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
