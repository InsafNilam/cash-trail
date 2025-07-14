"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteTransaction(transactionId: string) {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const transaction = await prisma.transaction.findUnique({
        where: {
            id: transactionId,
            userId: user.id,
        },
    });

    if(!transaction){
        return new Error("Bad Request");
    }

    await prisma.$transaction([
        prisma.transaction.delete({
            where: {
                id: transactionId,
                userId: user.id,
            },
        }),

        prisma.monthHistory.update({
            where:{
                day_month_year_userId: {
                    day: transaction.date.getUTCDate(),
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getFullYear(),
                    userId: user.id,
                }
            },
            data:{
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount,
                    }}),
                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount,
                    }}),
                },
            }),

        prisma.yearHistory.update({
            where:{
                month_year_userId: {
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getFullYear(),
                    userId: user.id,
                }
            },
            data:{
                ...(transaction.type === 'expense' && {
                    expense: {
                        decrement: transaction.amount,
                    }}),
                ...(transaction.type === 'income' && {
                    income: {
                        decrement: transaction.amount,
                    }}),
                },
            })
    ]);

    return transaction;
}