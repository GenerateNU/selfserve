import { Skeleton } from "@/components/ui/skeleton";

export function GuestProfilePageSkeleton() {
  return (
    <div className="grid gap-[2vh] xl:grid-cols-[minmax(0,45vw)_minmax(0,32vw)]">
      <section className="border border-black bg-white px-[1vw] py-[2vh]">
        <div className="mb-[2vh] flex items-start gap-[1.1vw]">
          <Skeleton className="h-[3vw] w-[3vw] rounded-full" />
          <div className="flex-1 space-y-[1vh]">
            <Skeleton className="h-[3vh] w-[16vw]" />
            <Skeleton className="h-[2vh] w-[10vw]" />
          </div>
        </div>
        <div className="space-y-[1vh] pt-[1vh]">
          <Skeleton className="h-[2.5vh] w-full" />
          <Skeleton className="h-[2.5vh] w-full" />
          <Skeleton className="h-[2.5vh] w-full" />
        </div>
      </section>

      <div className="flex flex-col gap-[2vh]">
        <section className="border border-black bg-white px-[1vw] py-[2vh]">
          <Skeleton className="mb-[2vh] h-[3vh] w-[12vw]" />
          <Skeleton className="h-[16vh] w-full" />
        </section>
        <section className="border border-black bg-white px-[1vw] py-[2vh]">
          <Skeleton className="mb-[2vh] h-[3vh] w-[14vw]" />
          <div className="space-y-[1vh]">
            <Skeleton className="h-[6vh] w-full" />
            <Skeleton className="h-[6vh] w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
