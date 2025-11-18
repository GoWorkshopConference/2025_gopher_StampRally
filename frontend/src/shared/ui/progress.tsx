"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "./utils";

function Progress({ className, value = 0, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const numeric = typeof value === "number" ? value : 0;
  const clamped = Math.max(0, Math.min(100, numeric));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full border border-cyan-200 bg-cyan-100/60",
        className,
      )}
      value={clamped}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "h-full transition-[width] duration-500",
          "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[inset_0_0_6px_rgba(0,0,0,0.15)]",
        )}
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };


