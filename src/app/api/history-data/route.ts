import { prisma } from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { HistoryDataQuerySchema } from "@/schema/historyData";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const {searchParams} = new URL(request.url);
    const timeframe = searchParams.get('timeframe');
    const year = searchParams.get('year');
    const month = searchParams.get('month');


    const queryParams = HistoryDataQuerySchema.safeParse({
        timeframe,
        year: year,
        month: month,
    });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }


    const data = await getHistoryData(user.id, queryParams.data.timeframe, {month: queryParams.data.month, year: queryParams.data.year});
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>;
async function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {
    switch (timeframe) {
        case 'year': 
        return await getYearHistoryData(userId, period.year);
        case 'month':
        return await getMonthHistoryData(userId, period.year, period.month);
        default:
            throw new Error('Invalid timeframe');
    }
}

type HistoryData = {
    month: number;
    day?: number;
    year: number;
    expense: number;
    income: number;
}

async function getYearHistoryData(userId: string, year: number) {
    const result = await prisma.yearHistory.groupBy({
        by: ['month'],
        where: {
            userId: userId,
            year: year,
        },
        _sum: {
            income: true,
            expense: true,
        },
       orderBy:{
            month: 'asc',
        },
       });

       if(!result || result.length === 0) {
           return [];
       }

       const historyData: HistoryData[] = [];
       for (let i = 0; i < 12; i++) {
        let expense = 0;
        let income = 0;

        const monthData = result.find(item => item.month === i);
        if (monthData) {
            expense = monthData._sum.expense || 0;
            income = monthData._sum.income || 0;
        }
        historyData.push({
            month: i,
            year: year,
            expense: expense,
            income: income,
        });
       }

       return historyData;
}

async function getMonthHistoryData(userId: string, year: number, month: number) {
    const result = await prisma.monthHistory.groupBy({
        by: ['day'],
        where: {
            userId: userId,
            year: year,
            month: month,
        },
        _sum: {
            income: true,
            expense: true,
        },
        orderBy: {
            day: 'asc',
        },
    });

    if (!result || result.length === 0) {
        return [];
    }

    const historyData: HistoryData[] = [];
    const daysInMonth = getDaysInMonth(new Date(year, month));

    for (let i = 1; i < daysInMonth; i++) {
        let expense = 0;
        let income = 0;

        const dayData = result.find(item => item.day === i);
        if (dayData) {
            expense = dayData._sum.expense || 0;
            income = dayData._sum.income || 0;
        }
        historyData.push({
            month: month,
            day: i,
            year: year,
            expense: expense,
            income: income,
        });
    }

    return historyData;
}