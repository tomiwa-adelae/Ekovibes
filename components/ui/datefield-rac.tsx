"use client";

import {
  DateInput as AriaDateInput,
  DateSegment,
  TimeField as AriaTimeField,
  type DateInputProps as AriaDateInputProps,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
} from "react-aria-components";
import { cn } from "@/lib/utils";

function DateInput({ className, ...props }: AriaDateInputProps) {
  return (
    <AriaDateInput
      className={cn(
        "border-input bg-transparent dark:bg-input/30 flex h-12 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {(segment) => (
        <DateSegment
          segment={segment}
          className={cn(
            "inline rounded px-0.5 caret-transparent outline-none",
            "data-[type=literal]:text-muted-foreground",
            "data-[focused]:bg-primary data-[focused]:text-primary-foreground",
            "data-[placeholder]:text-muted-foreground",
          )}
        />
      )}
    </AriaDateInput>
  );
}

function TimeField<T extends TimeValue>({
  className,
  ...props
}: AriaTimeFieldProps<T> & { className?: string }) {
  return (
    <AriaTimeField
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export { DateInput, TimeField };
export type { TimeValue };
