"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/generated/prisma';
import { GetFormatterForCurrency } from '@/lib/helpers';
import { Period, Timeframe } from '@/lib/types';
import React from 'react'
import HistoryPeriodSelector from './HistoryPeriodSelector';
import { useQuery } from '@tanstack/react-query';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { GetHistoryDataResponseType } from '@/app/api/history-data/route';
import type { TooltipProps } from 'recharts';

interface Props {
    userSettings: UserSettings
}

function History({ userSettings }: Props) {
    const [timeframe, setTimeframe] = React.useState<Timeframe>('month');
    const [period, setPeriod] = React.useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    const formatter = React.useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency]);

    const historyDataQuery = useQuery<GetHistoryDataResponseType>({
        queryKey: ['overview', 'history', timeframe, period],
        queryFn: async () => {
            const response = await fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`);
            if (!response.ok) {
                throw new Error('Failed to fetch history data');
            }
            return response.json();
        },
        refetchOnWindowFocus: false,
    });

    const dataAvailable = historyDataQuery.data && historyDataQuery.data.length > 0;

    return (
        <div className='container'>
            <h2 className="mt-12 text-3xl font-bold">
                History
            </h2>
            <Card className='col-span-12 mt-2 w-full'>
                <CardHeader className='gap-2'>
                    <CardTitle className='grid grid-flow-row justify-between gap-2 md:grid-flow-col'>
                        <HistoryPeriodSelector period={period} setPeriod={setPeriod} timeframe={timeframe} setTimeframe={setTimeframe} />
                        <div className="flex h-10 gap-2">
                            <Badge variant={"outline"} className='flex items-center gap-2 text-sm'>
                                <div className="h-4 w-4 rounded-full bg-emerald-500" />
                                Income
                            </Badge>
                            <Badge variant={"outline"} className='flex items-center gap-2 text-sm'>
                                <div className="h-4 w-4 rounded-full bg-red-500" />
                                Expense
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SkeletonWrapper isLoading={historyDataQuery.isFetching} fullWidth>
                        {dataAvailable && (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart height={300} data={historyDataQuery.data} barCategoryGap={5}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34D399" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#34D399" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="5 5" strokeOpacity={"0.2"} vertical={false} />
                                    <XAxis dataKey={(data) => {
                                        const { year, month, day } = data;
                                        const date = new Date(year, month, day || 1);

                                        if (timeframe === 'year') {
                                            return date.toLocaleDateString('default', { month: 'long' });
                                        }
                                        return date.toLocaleDateString('default', { day: '2-digit' });

                                    }} tickLine={false} stroke="#888888" fontSize={12} axisLine={false} padding={{ left: 5, right: 5 }} />
                                    <YAxis tickLine={false} stroke="#888888" fontSize={12} axisLine={false} />
                                    <Bar dataKey="income" fill="url(#incomeGradient)" name="Income" radius={4} className='cursor-pointer' />
                                    <Bar dataKey="expense" fill="url(#expenseGradient)" name="Expense" radius={4} className='cursor-pointer' />
                                    <Tooltip<number, string> cursor={{ opacity: 0.1 }} content={(props) => <CustomTooltip formattingFn={formatter.format} {...props} />} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {!dataAvailable && (
                            <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                <CardContent className="text-center">
                                    <p className="text-lg text-muted-foreground">
                                        No data available for this period.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Try selecting a different period or adding new transactions.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                    </SkeletonWrapper>
                </CardContent>
            </Card>
        </div>
    )
}

export default History

type HistoryData = {
    month: number;
    day?: number;
    year: number;
    expense: number;
    income: number;
}

function CustomTooltip(props: TooltipProps<number, string> & { formattingFn: (value: number) => string }) {
    const { active, payload, formattingFn } = props;

    if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
        return null;
    }

    const data = payload[0].payload as HistoryData;
    const { income, expense } = data;

    return (
        <div className='min-w-[300px] rounded border bg-background p-4'>
            <TooltipRow formattingFn={formattingFn} label="Expense" value={expense} bgColor="bg-red-500" textColor="text-red-500" />
            <TooltipRow formattingFn={formattingFn} label="Income" value={income} bgColor="bg-emerald-500" textColor="text-emerald-500" />
            <TooltipRow formattingFn={formattingFn} label="Balance" value={income - expense} bgColor="bg-gray-100" textColor="text-foreground" />
        </div>
    )
}

function TooltipRow({ label, value, formattingFn, bgColor, textColor }: { label: string; value: number; formattingFn: (value: number) => string; bgColor: string; textColor: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={cn("h-4 w-4 rounded-full", bgColor)} />
            <div className="flex w-full justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className={cn('text-sm font-bold', textColor)}>
                    <CountUp duration={0.5} preserveValue end={value} decimals={0} formattingFn={formattingFn} className='text-sm' />
                </div>
            </div>
        </div>
    );
}