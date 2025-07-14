"use client";

import { GetHistoryPeriodsResponseType } from '@/app/api/history-periods/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Period, Timeframe } from '@/lib/types'
import { useQuery } from '@tanstack/react-query';
import React from 'react'

interface Props {
    period: Period;
    timeframe: Timeframe;
    setPeriod: React.Dispatch<React.SetStateAction<Period>>;
    setTimeframe: React.Dispatch<React.SetStateAction<Timeframe>>;
}

export default function HistoryPeriodSelector({ period, timeframe, setPeriod, setTimeframe }: Props) {
    const historyPeriods = useQuery<GetHistoryPeriodsResponseType>({
        queryKey: ['overview', 'history', 'periods'],
        queryFn: async () => {
            const response = await fetch('/api/history-periods');
            if (!response.ok) {
                throw new Error('Failed to fetch history periods');
            }
            return response.json();
        },
    })
    return (
        <div className='flex flex-wrap items-center gap-4'>
            <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
                    <TabsList>
                        <TabsTrigger value='year'>Year</TabsTrigger>
                        <TabsTrigger value='month'>Month</TabsTrigger>
                    </TabsList>
                </Tabs>
            </SkeletonWrapper>
            <div className='flex flex-wrap items-center gap-2'>
                <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                    <YearSelector period={period} setPeriod={setPeriod} years={historyPeriods.data || []} />
                </SkeletonWrapper>

                {timeframe === 'month' && (
                    <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                        <MonthSelector period={period} setPeriod={setPeriod} />
                    </SkeletonWrapper>
                )}
            </div>
        </div>
    )
}

function YearSelector({ period, setPeriod, years }: { period: Period; setPeriod: React.Dispatch<React.SetStateAction<Period>>; years: GetHistoryPeriodsResponseType }) {
    return (
        <Select value={period.year.toString()} onValueChange={(value) => {
            setPeriod((prev) => ({ ...prev, year: parseInt(value) }))
        }}>
            <SelectTrigger className='w-[180px]'>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function MonthSelector({ period, setPeriod }: { period: Period; setPeriod: React.Dispatch<React.SetStateAction<Period>> }) {
    return (
        <Select value={period.month.toString()} onValueChange={(value) => {
            setPeriod((prev) => ({ ...prev, month: parseInt(value) }))
        }}>
            <SelectTrigger className='w-[180px]'>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                    const monthStr = new Date(period.year, i, 1).toLocaleString('default', { month: 'long' });

                    return (
                        <SelectItem key={i} value={i.toString()}>
                            {monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    )
}
