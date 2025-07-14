"use client"

import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { DateToUTCDate } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from 'react'
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader';
import { cn } from '@/lib/utils';
import { DataTableFacetedFilter } from '@/components/datatable/FacetedFilters';
import { DataTableViewOptions } from '@/components/datatable/ColumnToggle';
import { Button } from '@/components/ui/button';
import { download, generateCsv, mkConfig } from "export-to-csv"
import { Download, MoreHorizontal, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DeleteTransactionDialog from './DeleteTransactionDialog';

interface Props {
  from: Date;
  to: Date;
}


type TransactionHistoryRow = GetTransactionHistoryResponseType[0]
const emptyData: GetTransactionHistoryResponseType = [];

const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
    cell: ({ row }) => <div className="flex gap-2 capitalize">
      {row.original.categoryIcon}
      <div className="capitalize">{row.original.category}</div>
    </div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    cell: ({ row }) => <div className="capitalize">{row.original.description}</div>,
  },
  {
    accessorKey: 'date',
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
      return (
        <div className="capitalize">
          {formattedDate}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    cell: ({ row }) => <div className={cn("capitalize rounded-lg text-center p-2", row.original.type === "income" ? "bg-emerald-400/10 text-emerald-500" : "bg-red-400/10 text-red-500")}>{row.original.description}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) => <p className='text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium'>
      {row.original.formattedAmount || row.original.amount}
    </p>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <RowActions transaction={row.original} />
    ),
  }
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

type CSVDataProp = {
  category: string;
  categoryIcon: string;
  description: string;
  type: string;
  amount: number;
  formattedAmount?: string;
  date: Date;
}

type CSVExportRow = {
  [key: string]: string | number | boolean | null;
};

export default function TransactionTable({ from, to }: Props) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const transactionsHistory = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ['transactions', 'history', from, to],
    queryFn: async () => {
      const response = await fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions history');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleExportCSV = (data: CSVDataProp[]) => {
    const processedData: CSVExportRow[] = data.map(item => ({
      category: item.category,
      categoryIcon: item.categoryIcon,
      description: item.description,
      type: item.type,
      amount: item.amount,
      formattedAmount: item.formattedAmount ?? '',
      date: item.date.toISOString(),
    }));

    const csv = generateCsv(csvConfig)(processedData);
    download(csvConfig)(csv);
  }

  const table = useReactTable({
    data: transactionsHistory.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const categoriesOptions = React.useMemo(() => {
    const catergoriesMap = new Map();
    transactionsHistory.data?.forEach((transaction) => {
      catergoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    })

    const uniqueCategories = new Set(catergoriesMap.values());
    return Array.from(uniqueCategories);
  }, [transactionsHistory.data]);

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Filters + Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Category"
              column={table.getColumn("category")}
              options={categoriesOptions}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Type"
              column={table.getColumn("type")}
              options={[
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" },
              ]}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map((row) => ({
                category: row.original.category,
                categoryIcon: row.original.categoryIcon,
                description: row.original.description,
                type: row.original.type,
                amount: row.original.amount,
                formattedAmount: row.original.formattedAmount,
                date: row.original.date,
              }));

              handleExportCSV(data);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table + Pagination */}
      <SkeletonWrapper isLoading={transactionsHistory.isFetching} fullWidth>
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </SkeletonWrapper>
    </div>

  )
}

function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DeleteTransactionDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} transactionId={transaction.id} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='flex items-center gap-2' onSelect={() => {
            setShowDeleteDialog(prev => !prev)
          }}>
            <Trash className='w-4 h-4 text-muted-foreground' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
