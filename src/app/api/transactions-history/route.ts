import { Transaction } from "@/generated/prisma";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const {searchParams} = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const queryParams = OverviewQuerySchema.safeParse({
        from: from,
        to: to
    });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, { status: 400 });
    }

    const transactions = await getTransactionsHistory({
        userId: user.id,
        from: queryParams.data.from,
        to: queryParams.data.to
    });

    return Response.json(transactions, {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionsHistory>>;
async function getTransactionsHistory({ userId, from, to }: { userId: string; from: Date; to: Date }) {
    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: userId
        },
    });

    if(!userSettings){
        throw new Error('user settings not found');
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);
    const transactions = await prisma.transaction.findMany({
        where:{
            userId: userId,
            date: {
                gte: from,
                lte: to
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    return transactions.map((transaction: Transaction) =>({
        ...transaction,
        formattedAmount: formatter.format(transaction.amount),
    }));

}