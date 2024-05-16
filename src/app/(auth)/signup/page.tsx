import ActionForm from '@/components/shared/auth/AuthAction'
import React from 'react'

export default function Page() {
  return (
    <main className="min-h-screen w-full flex">
      <div className="max-w-screen-xl flex-1 flex items-center justify-center mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <ActionForm />
        </div>
      </div>
    </main>
  )
}
