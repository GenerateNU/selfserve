import type { ReactNode } from 'react'

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
      className={[
        'rounded-lg bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'px-5 py-4',
        className,
      ].join(' ')}
    >
      <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      <div className="mt-3 h-px w-full bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-5 grid grid-cols-3 gap-8">
        {columns.map((col) => (
          <div key={col.field} className="flex flex-col gap-2">
            <div className="text-lg font-medium leading-tight text-zinc-900 dark:text-zinc-100">
              {col.field}
            </div>

            <div className="text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
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
