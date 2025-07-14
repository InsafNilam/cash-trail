"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteTransaction } from '../_actions/transaction';

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    transactionId: string;
}

export default function DeleteTransactionDialog({ open, setOpen, transactionId }: Props) {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            toast.success('Transaction deleted successfully!', {
                id: `delete-transaction-${transactionId}`,
            });

            await queryClient.invalidateQueries({
                queryKey: ['transactions'],
            });
        },
        onError: () => {
            toast.error('Failed to delete transaction', {
                id: `delete-transaction-${transactionId}`,
            });
        },
    });
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the transaction.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading('Deleting category...', { id: `delete-transaction-${transactionId}` });
                        deleteMutation.mutate(transactionId);
                    }}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
