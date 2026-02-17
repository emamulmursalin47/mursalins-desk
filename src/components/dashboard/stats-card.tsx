"use client";

import { useEffect, useRef, useState } from "react";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  prefix?: string;
}

import type { ReactNode } from "react";

export function StatsCard({ label, value, icon, trend, prefix }: StatsCardProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current || value === 0) {
      setDisplay(value);
      return;
    }
    animated.current = true;
    const duration = 600;
    const start = performance.now();
    let frameId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div
      ref={ref}
      className="glass-card glass-shine rounded-2xl p-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/8"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {prefix}
            {display.toLocaleString()}
          </p>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="glass-subtle flex h-10 w-10 items-center justify-center rounded-xl text-primary-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
