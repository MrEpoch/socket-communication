import React from 'react'

export default function EmailInfoModal() {
  return (
      <div className="max-w-xl py-16 flex flex-col gap-5 shadow rounded-xl w-full bg-card text-black p-0 overflow-hidden">
        <header className="pt-8 px-6">
          <p className="text-2xl text-center font-extrabold text-primary">
            Please verify your email address!
          </p>
          <p className="text-center text-zinc-500 pt-1">
            We&apos;ve sent you an email with link. Please click and verify your email address.
        </p>
      </header>
      <div className="items-center flex text-primary justify-center w-full">
        <svg
      xmlns="http://www.w3.org/2000/svg"
      width="240"
      height="240"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="w-32 h-32"
      viewBox="0 0 24 24"
      >
          <path stroke="none" d="M0 0h24v24H0z"></path>
          <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path>
          <path d="M3 7l9 6 9-6"></path>
        </svg>
      </div>
      </div>
  )
}
