"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { ThemeSwitcherBtn } from "../ThemeSwitcherBtn"
import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import React from "react"
import { Button } from "../ui/button"

interface BreadcrumbItem {
  label: string
  href?: string
}

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  let breadcrumbs: BreadcrumbItem[] = [];

  if (pathname === "/") {
    // Special case: home page
    breadcrumbs = [{ label: "Dashboard", href: "/" }];
  } else {
    // Build breadcrumbs from segments
    breadcrumbs = segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      return {
        label: formatSegment(segment),
        href,
      };
    });
  }

  return (
    <nav className="px-3 ml-10 lg:ml-0 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium mt-1.5 text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        <Breadcrumb>
          <BreadcrumbList className="text-base">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  CashTrail
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.length > 0 && <BreadcrumbSeparator className="pt-0.5" />}

            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <React.Fragment key={`breadcrumb-${item.label}-${index}`}>
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-gray-600 dark:text-gray-300" />
        </Button>

        <ThemeSwitcherBtn />
        <Button
          variant="outline"
          size="icon"
          className="rounded-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          asChild
        >
          <div className="h-9 w-9">
            <UserButton />
          </div>
        </Button>
      </div>
    </nav>
  )
}
