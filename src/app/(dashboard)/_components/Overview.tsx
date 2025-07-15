"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { UserSettings } from '@/generated/prisma';
import { MAX_DATE_RANGE } from '@/lib/constants';
import { differenceInDays, startOfMonth } from 'date-fns';
import React from 'react'
import { toast } from 'sonner';
import StatsCards from './StatsCard';
import CategoriesStats from './CategoriesStats';

interface Props {
  userSettings: UserSettings; // Replace 'any' with the actual type of userSettings
}

function Overview({ userSettings }: Props) {
  const [dateRange, setDateRange] = React.useState<{ from: Date, to: Date }>({ from: startOfMonth(new Date()), to: new Date() });

  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
        <h2 className="text-3xl font-bold">Overview</h2>
        <div className='flex items-center gap-3'>
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            onUpdate={(values) => {
              const { from, to } = values.range
              if (!from || !to) return

              if (differenceInDays(to, from) > MAX_DATE_RANGE) {
                toast.error(`The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE} days.`)
                return
              }

              setDateRange({ from, to })
            }}
          />
        </div>
      </div>
      <div className='container flex flex-col w-full gap-4'>
        <StatsCards userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
        <CategoriesStats userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  )
}

export default Overview
