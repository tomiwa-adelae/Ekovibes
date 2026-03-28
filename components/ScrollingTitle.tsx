"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollingTitleProps {
  href: string;
  title: string;
  className?: string;
}

export function ScrollingTitle({
  href,
  title,
  className,
}: ScrollingTitleProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [title]);

  const duration = `${Math.max(2, title.length * 0.13)}s`;

  return (
    <Link
      href={href}
      className={cn(
        "group/title block overflow-hidden hover:text-primary",
        className,
      )}
    >
      <span
        ref={spanRef}
        className={cn(
          "block text-lg font-semibold uppercase whitespace-nowrap",
          overflows &&
            "group-hover/title:truncate-none group-hover/title:animate-[marquee_var(--_d)_linear_infinite]",
        )}
        style={
          overflows ? ({ "--_d": duration } as React.CSSProperties) : undefined
        }
      >
        {title}
      </span>
    </Link>
  );
}
