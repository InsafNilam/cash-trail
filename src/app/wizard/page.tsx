"use server";

import CurrencyComboBox from '@/components/CurrencyComboBox';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return (
    <div className="container max-w-2xl mx-auto flex flex-col items-center gap-6 py-10 text-center">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome, <span className="ml-1 font-bold">{user.firstName}! 👋</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Let&apos;s get started by setting up your currency
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You can change these settings at any time
        </p>
      </div>

      <Separator className="w-full" />

      {/* Currency Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Set your preferred currency for transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>

      <Separator className="w-full" />

      {/* CTA Button */}
      <Button className="w-full" asChild>
        <Link href="/" aria-label="Go to Dashboard">
          I&apos;m done! Take me to the dashboard
        </Link>
      </Button>

      {/* Logo */}
      <div className="mt-10 opacity-80">
        <Logo />
      </div>
    </div>

  )
}

export default page
