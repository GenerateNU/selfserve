import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type RoomAccordionItem = {
  value: string;
  trigger: string;
  content: ReactNode;
};

type RoomAccordionProps = {
  items: Array<RoomAccordionItem>;
  defaultValue?: Array<string>;
  className?: string;
};

export function RoomAccordion({
  items,
  defaultValue,
  className,
}: RoomAccordionProps) {
  return (
    <Accordion
      multiple
      className={cn("mx-auto w-full px-8", className)}
      defaultValue={defaultValue}
    >
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
