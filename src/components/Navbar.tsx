"use client";

import React from 'react'
import Logo from './Logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { UserButton } from '@clerk/nextjs';
import { ThemeSwitcherBtn } from './ThemeSwitcherBtn';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <>
            <DesktopNavbar />
            <MobileNavbar />
        </>
    )
}

const items = [
    { name: 'Dashboard', href: '/' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Manage', href: '/manage' },
]

function MobileNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="block border-separate bg-background md:hidden">
            <nav className='container flex items-center justify-between px-8'>
                <Sheet open={isOpen} onOpenChange={setIsOpen} >
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                        <Logo />
                        <div className="flex flex-col gap-1 pt-4">
                            {items.map((item) => (
                                <NavbarItem key={item.name} label={item.name} link={item.href} onClick={() => setIsOpen(prev => !prev)} />
                            ))}
                        </div>
                        <div className='flex items-center justify-between p-4'>
                            <ThemeSwitcherBtn />
                            <UserButton />
                        </div>
                    </SheetContent>
                </Sheet>
                <div className='flex h-[80px] min-h-[60px] items-center gap-x-4'>
                    <Logo />
                </div>
                <div className='flex items-center gap-2'>
                    <ThemeSwitcherBtn />
                    <UserButton />
                </div>
            </nav>
        </div>
    )
}

function DesktopNavbar() {
    return (
        <div className='hidden border-separate border-b bg-background md:block'>
            <nav className="container flex items-center justify-between px-8">
                <div className='flex h-[80px] min-h-[60px] items-center gap-x-4'>
                    <Logo />
                    <div className="flex h-full">
                        {items.map((item) => (
                            <NavbarItem key={item.name} label={item.name} link={item.href} />
                        ))}
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <ThemeSwitcherBtn />
                    <UserButton />
                </div>
            </nav>
        </div>
    )
}

function NavbarItem({ label, link, onClick }: { label: string; link: string, onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === link;

    return (
        <div className="relative flex items-center">
            <Link href={link} className={cn(buttonVariants({ variant: 'ghost' }),
                'w-full justify-start text-lg text-muted-foreground hover:text-foreground',
                isActive && 'text-foreground'
            )}
                onClick={() => { if (onClick) onClick() }}>
                {label}
            </Link>
            {isActive && <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block" />}
        </div>
    );
}

export default Navbar