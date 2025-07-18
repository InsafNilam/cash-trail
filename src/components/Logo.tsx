import { PiggyBank } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
    return (
        <Link href="/" className='flex items-center gap-2'>
            <PiggyBank className='hidden md:block stroke h-11 w-11 stroke-amber-500 stroke-[1.5]' />
            <p className='bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent'>Cash Trail</p>
        </Link>
    )
}
