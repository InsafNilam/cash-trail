"use client";

import { GetCategoriesStatsResponseType } from '@/app/api/stats/categories/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserSettings } from '@/generated/prisma';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { TransactionType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

interface Props {
  userSettings: UserSettings,
  from: Date,
  to: Date,
}

export default function CategoriesStats({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ['overview', 'stats', 'categories', from, to],
    queryFn: async () => {
      const response = await fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories stats');
      }
      return response.json();
    },
  });

  const formatter = React.useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className='flex w-full flex-wrap gap-4 md:flex-nowrap'>
      <SkeletonWrapper isLoading={statsQuery.isFetching} fullWidth>
        <CategoryCard formatter={formatter} type="income" data={statsQuery.data || []} />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching} fullWidth>
        <CategoryCard formatter={formatter} type="expense" data={statsQuery.data || []} />
      </SkeletonWrapper>
    </div>
  )
}

function CategoryCard({ type, data, formatter }: { type: TransactionType, data: GetCategoriesStatsResponseType, formatter: Intl.NumberFormat }) {
  const filteredData = data.filter(item => item.type === type);
  const total = filteredData.reduce((acc, item) => acc + (item._sum?.amount || 0), 0);

  return (
    <Card className="w-full h-auto flex flex-col border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#0F0F12] rounded-xl overflow-hidden">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {type === "income" ? "Incomes" : "Expenses"}
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex items-center justify-between px-6 pb-6">
        {filteredData.length === 0 ? (
          <div className="flex h-60 w-full flex-col items-center justify-center text-center px-4">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No data for the selected period
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different period or add new{" "}
              {type === "income" ? "incomes" : "expenses"}.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-60 w-full pr-2">
            <div className="flex flex-col gap-4">
              {filteredData.map((item) => {
                const amount = item._sum?.amount || 0;
                const percentage = (amount * 100) / (total || amount);

                return (
                  <div
                    key={`${item.category}-${item.categoryIcon}`}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{item.categoryIcon}</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatter.format(amount)}
                        </span>
                      </div>
                    </div>

                    <Progress
                      value={percentage}
                      indicator={
                        type === "income"
                          ? "bg-emerald-500"
                          : "bg-destructive"
                      }
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
