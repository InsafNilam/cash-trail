"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE } from '@/lib/constants';
import { differenceInDays, startOfMonth } from 'date-fns';
import React from 'react'
import { toast } from 'sonner';
import TransactionTable from './_components/TransactionTable';

function TransactionsPage() {
  const [dateRange, setDateRange] = React.useState<{ from: Date, to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date()
  });

  return (
    <>
      {/* Header Section */}
      <div className="border-b border-border">
        <div className="container max-w-screen-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Transactions History
          </h1>

          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            onUpdate={({ range }) => {
              const { from, to } = range;
              if (!from || !to) return;

              if (differenceInDays(to, from) > MAX_DATE_RANGE) {
                toast.error(
                  `The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE} days.`
                );
                return;
              }

              setDateRange({ from, to });
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="container max-w-screen-xl py-6">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>

  )
}

export default TransactionsPage
