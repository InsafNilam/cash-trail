"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Currencies, Currency } from "@/lib/currencies"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { UserSettings } from "@/generated/prisma"
import { updateUserCurrency } from "@/app/wizard/_actions/userSettings"
import { toast } from "sonner"


export default function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  )

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const response = await fetch("/api/user-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch user settings");
      }
      return response.json();
    },
  });

  React.useEffect(() => {
    if (!userSettings.data) return;

    const currency = Currencies.find(
      (c) => c.value === userSettings.data.currency
    )

    setSelectedOption(currency || null)

  }, [userSettings.data])

  const mutation = useMutation({
    mutationFn: updateUserCurrency,
  });

  const selectOption = React.useCallback((currency: Currency | null) => {
    if (!currency) {
      toast.error("Please select a currency")
      return;
    }

    toast.loading("Updating currency...", {
      id: "update-currency"
    });

    mutation.mutate(currency.value, {
      onSuccess: (data: UserSettings) => {
        toast.success("Currency updated successfully 🎉", {
          id: "update-currency"
        });
        setSelectedOption(Currencies.find(c => c.value === data.currency) || null);
      },
      onError: (error) => {
        toast.error(`Failed to update currency: ${error.message}`, {
          id: "update-currency"
        });
      },
    });
  }, [mutation, setSelectedOption]);

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching} fullWidth>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
              {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching} fullWidth>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
            {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  )
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (status: Currency | null) => void
}) {
  return (
    <Command>
      <div className="border-b">
        <CommandInput placeholder="Filter currency..." />
      </div>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency: Currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((priority) => priority.value === value) || null
                )
                setOpen(false)
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
