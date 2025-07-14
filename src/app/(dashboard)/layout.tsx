import AppLayout from '@/components/navigation/AppLayout'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <div className='relative flex h-screen w-full flex-col'>
        <div className="w-full">
          {children}
        </div>
      </div>
    </AppLayout>
  )
}

export default layout
