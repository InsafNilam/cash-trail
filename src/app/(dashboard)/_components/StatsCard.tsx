"use client";

import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card } from '@/components/ui/card';
import { UserSettings } from '@/generated/prisma';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import CountUp from 'react-countup';
import React from 'react'

interface Props {
  userSettings: UserSettings,
  from: Date,
  to: Date,
}

export default function StatsCards({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ['overview', 'stats', from, to],
    queryFn: async () => {
      const response = await fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance stats');
      }
      return response.json();
    },
  });

  const formatter = React.useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery.data?.income ?? 0;
  const expense = statsQuery.data?.expense ?? 0;

  const balance = income - expense;

  return (
    <div className='relative flex w-full flex-wrap gap-4 md:flex-nowrap'>
      <SkeletonWrapper isLoading={statsQuery.isFetching} fullWidth>
        <StatCard formatter={formatter} title="Income" value={income} icon={<TrendingUp className='w-12 h-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10' />} />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching} fullWidth>
        <StatCard formatter={formatter} title="Expense" value={expense} icon={<TrendingDown className='w-12 h-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10' />} />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching} fullWidth>
        <StatCard formatter={formatter} title="Balance" value={balance} icon={<Wallet className='w-12 h-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10' />} />
      </SkeletonWrapper>
    </div>
  )
}

export function StatCard({ title, value, icon, formatter }: { title: string, value: number, icon: React.ReactNode, formatter: Intl.NumberFormat }) {
  const formatFn = React.useCallback((value: number) => formatter.format(value), [formatter]);

  return (
    <Card className="flex w-full flex-row items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-center rounded-lg bg-muted p-3">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl font-semibold text-foreground"
          aria-label={`Count: ${formatFn(value)}`}
        />
      </div>
    </Card>
  );
}
