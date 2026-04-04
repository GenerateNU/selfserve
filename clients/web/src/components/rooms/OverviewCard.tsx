import type { ReactNode } from "react";
import { UrgentIcon } from "@/icons/urgent";
import { cn } from "@/lib/utils";

export type OverviewCardColumn = {
  field: string;
  value: ReactNode;
  valueSecondary?: ReactNode;
  description: string;
  urgent?: boolean;
};

type OverviewCardProps = {
  title: string;
  columns: [OverviewCardColumn, OverviewCardColumn, OverviewCardColumn];
  className?: string;
};

export function OverviewCard({
  title,
  columns,
  className = "",
}: OverviewCardProps) {
  return (
<section className={cn("flex w-full min-w-0 flex-col", className)}>
  <h2 className="my-2 shrink-0 text-sm font-medium leading-tight text-neutral-400">
    {title}
  </h2>

  <div className="h-0.5 w-full shrink-0 bg-stroke-subtle" />

      <div className="mt-0 flex flex-wrap items-start justify-between gap-y-2">
        {columns.map((col) => (
          <div
            key={col.field}
            className="flex min-h-px min-w-px flex-1 flex-col gap-1 p-4"
          >
            <div className="text-sm leading-tight text-text-default">
              {col.urgent ? (
                <span className="inline-flex gap-0.5">
                  <UrgentIcon
                    className="h-4.5 w-4.5 shrink-0 text-text-default"
                    aria-hidden
                  />
                  {col.field}
                </span>
              ) : (
                col.field
              )}
            </div>

            <div
              className={cn(
                "inline-flex max-w-full min-w-0 flex-nowrap items-center gap-x-1 leading-[1.4] tracking-[-0.32px]",
                col.valueSecondary != null && "whitespace-nowrap",
              )}
            >
              <span className="text-2xl lg:text-[32px] font-bold text-text-default">
                {col.value}
              </span>
              {col.valueSecondary != null && (
                <span className="text-[11px] font-medium tracking-normal text-text-subtle">
                  {" / "}
                  {col.valueSecondary}
                </span>
              )}
            </div>

            <div className="text-sm leading-tight text-neutral-400">
              {col.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
