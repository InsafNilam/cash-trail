"use client";

import CurrencyComboBox from '@/components/CurrencyComboBox';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react'
import CreateCategoryDialog from '../_components/CreateCategoryDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Category } from '@/generated/prisma';
import DeleteCategoryDialog from '../_components/DeleteCategoryDialog';

function page() {
  return (
    <>
      {/* Header */}
      <div className="border-b">
        <div className="container flex flex-col gap-2 py-8">
          <h1 className="text-3xl font-bold text-foreground">Manage</h1>
          <p className="text-muted-foreground">
            Manage your transactions, categories, and settings here.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container flex flex-col gap-6 py-6">
        {/* Currency Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your default currency for transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>

        {/* Categories */}
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  )
}

export default page

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const response = await fetch(`/api/categories?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0;

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading} fullWidth>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {type === 'income' ? (
              <TrendingUp className="h-10 w-10 rounded-lg bg-emerald-100/20 p-2 text-emerald-500 dark:bg-emerald-900/20" />
            ) : (
              <TrendingDown className="h-10 w-10 rounded-lg bg-red-100/20 p-2 text-red-500 dark:bg-red-900/20" />
            )}
            <div>
              <CardTitle>{type === 'income' ? 'Income' : 'Expense'} Categories</CardTitle>
              <CardDescription>Sorted by name</CardDescription>
            </div>
          </div>

          <CreateCategoryDialog
            type={type}
            onSuccessCallback={() => categoriesQuery.refetch()}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <PlusSquare className="h-4 w-4" />
                Create
              </Button>
            }
          />
        </CardHeader>

        <Separator />

        {!dataAvailable ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
            <p className="text-base font-medium text-foreground">
              No <span className={cn(type === 'income' ? 'text-emerald-500' : 'text-red-500')}>{type}</span> categories yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create one to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
            {categoriesQuery.data.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex flex-col justify-between rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl" role="img" aria-label={category.name}>
          {category.icon}
        </span>
        <span className="text-sm font-medium text-foreground">{category.name}</span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            variant="ghost"
            className="w-full rounded-t-none border-t px-4 py-2 text-sm text-destructive hover:bg-red-500/10"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Remove
          </Button>
        }
      />
    </div>
  )
}
