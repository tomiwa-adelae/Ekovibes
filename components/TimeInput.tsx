"use client";

import { ClockIcon } from "lucide-react";
import { Time } from "@internationalized/date";
import { DateSegment, type TimeValue } from "react-aria-components";
import { DateInput, TimeField } from "@/components/ui/datefield-rac";

interface TimeInputProps {
  value: string; // "HH:mm" format
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

function parseTime(value: string): Time | null {
  if (!value) return null;
  // Strip any trailing timezone text like " WAT"
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  try {
    return new Time(Number(match[1]), Number(match[2]));
  } catch {
    return null;
  }
}

function formatTime(t: TimeValue): string {
  const h = String(t.hour).padStart(2, "0");
  const m = String(t.minute).padStart(2, "0");
  return `${h}:${m}`;
}

export function TimeInput({
  value,
  onChange,
  label,
  className,
}: TimeInputProps) {
  const timeValue = parseTime(value);

  const handleChange = (t: TimeValue | null) => {
    onChange(t ? formatTime(t) : "");
  };

  return (
    <TimeField
      value={timeValue ?? undefined}
      onChange={handleChange}
      className={className}
      aria-label={label ?? "Time"}
      hourCycle={24}
    >
      <div className="relative">
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center justify-center pe-3 text-muted-foreground/80">
          <ClockIcon aria-hidden size={16} />
        </div>
      </div>
    </TimeField>
  );
}
