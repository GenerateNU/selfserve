import type { ReactNode } from 'react'

type GuestPageShellProps = {
  title: string
  children: ReactNode
}

export function GuestPageShell({ title, children }: GuestPageShellProps) {
  return (
    <main className="min-h-[calc(100vh-7vh)] bg-neutral-100 px-[3vw] py-[3vh]">
      <section className="mx-auto flex w-full max-w-[94vw] flex-col gap-[2vh]">
        <h1 className="text-[2vh] font-medium text-black">{title}</h1>
        {children}
      </section>
    </main>
  )
}
