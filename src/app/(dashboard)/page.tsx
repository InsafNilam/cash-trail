"use server";

import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import CreateTransactionDialog from './_components/CreateTransactionDialog';
import Overview from './_components/Overview';
import History from './_components/History';

async function page() {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    return redirect("/wizard");
  }

  return (
    <div className="h-full py-6 pt-0">
      {/* Header Section */}
      <div className="border-b border-border">
        <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hello, {user.firstName}! 👋
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <CreateTransactionDialog
              trigger={
                <Button
                  variant="outline"
                  className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  New income 😊
                </Button>
              }
              type="income"
            />

            <CreateTransactionDialog
              trigger={
                <Button
                  variant="outline"
                  className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white transition-colors"
                >
                  New expense 😤
                </Button>
              }
              type="expense"
            />
          </div>
        </div>
      </div>

      {/* Overview and History */}
      <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Overview userSettings={userSettings} />
        <History userSettings={userSettings} />
      </div>
    </div>
  )
}

export default page
