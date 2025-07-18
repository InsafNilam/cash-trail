"use server";

import { prisma } from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error("Bad request: " + parsedBody.error.message);
    }

    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const { amount, description, date, category, type } = parsedBody.data;

    const categoryExists = await prisma.category.findUnique({
        where: {
            name_userId_type: {
                name: category,
                userId: user.id,
                type: type,
            },
        },
    });

    if (!categoryExists) {
        throw new Error("Category does not exist");
    }

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                amount,
                description: description || "",
                date,
                category: categoryExists.name,
                categoryIcon: categoryExists.icon,
                type,
                userId: user.id,
            },
        }),

        // Update month aggregate table
        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                }
                },
                create: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                    expense: type === "expense"? amount: 0,
                    income: type==="income"? amount: 0,
                },
                update:{
                    expense: {
                        increment: type === "expense"? amount: 0,
                    },
                    income: {
                        increment: type === "income"? amount: 0,
                    }
                }
            }),

            // Update year aggregate table
        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                }
                },
                create: {
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                    expense: type === "expense"? amount: 0,
                    income: type==="income"? amount: 0,
                },
                update:{
                    expense: {
                        increment: type === "expense"? amount: 0,
                    },
                    income: {
                        increment: type === "income"? amount: 0,
                    }
                }
            })

    ]);
}