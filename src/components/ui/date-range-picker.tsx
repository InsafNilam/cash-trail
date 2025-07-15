"use client"

import * as React from "react"
import { format, startOfMonth } from "date-fns"
import { CalendarIcon, X, CalendarCheck } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useIsMobile } from "@/hooks/use-mobile"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDateFrom?: Date
  initialDateTo?: Date
  onUpdate?: (values: { range: DateRange }) => void
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onUpdate,
  ...props
}: DateRangePickerProps) {
  const isMobile = useIsMobile()

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDateFrom ?? startOfMonth(new Date()),
    to: initialDateTo ?? new Date(),
  })

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      onUpdate?.({ range })
    }
  }

  const handleClear = () => {
    setDate(undefined)
    onUpdate?.({ range: { from: undefined, to: undefined } })
  }

  const handleToday = () => {
    const today = new Date()
    const todayRange = { from: today, to: today }
    setDate(todayRange)
    onUpdate?.({ range: todayRange })
  }

  return (
    <div className={cn("grid gap-2 w-full", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full max-w-[90vw] sm:w-auto p-0"
          align="end"
        >
          <div className="max-h-[80vh] overflow-y-auto p-3 space-y-2">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={isMobile ? 1 : 2}
            />

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-destructive"
              >
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToday}
              >
                <CalendarCheck className="mr-1 h-4 w-4" />
                Today
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
