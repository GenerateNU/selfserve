import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type OverviewCardColumn = {
  field: string
  value: ReactNode
  description: string
}

type OverviewCardProps = {
  title: string
  columns: [OverviewCardColumn, OverviewCardColumn, OverviewCardColumn]
  className?: string
}

export function OverviewCard({
  title,
  columns,
  className = '',
}: OverviewCardProps) {
  return (
    <section
      className={cn('bg-white dark:bg-zinc-900 px-[1vw] py-[1.5vh]', className)}
    >
      <h2 className="text-md font-medium text-zinc-600 light:text-zinc-100">
        {title}
      </h2>

      <div className="mt-[1vh] h-[0.125vh] w-full bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-[1.8vh] grid grid-cols-3 gap-[1.7vw]">
        {columns.map((col) => (
          <div key={col.field} className="flex flex-col gap-[1vw]">
            <div className="text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-100">
              {col.field}
            </div>

            <div className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {col.value}
            </div>

            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {col.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
