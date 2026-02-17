"use client";

import { useState, useMemo } from "react";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export function BookingCalendar({
  selectedDate,
  onSelect,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month (0=Sun → shift so Mon=0)
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-based

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    // Padding for days before month start
    for (let i = 0; i < startOffset; i++) cells.push(null);
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    // Pad to fill 6 rows (42 cells)
    while (cells.length < 42) cells.push(null);

    return cells;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function isPast(date: Date) {
    return date < today;
  }

  function isWeekend(date: Date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function prevMonth() {
    setCurrentMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
    );
  }

  const canGoPrev =
    currentMonth.getFullYear() > today.getFullYear() ||
    currentMonth.getMonth() > today.getMonth();

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="btn-outline-glass rounded-lg p-2 text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
        <button
          onClick={nextMonth}
          className="btn-outline-glass rounded-lg p-2 text-muted-foreground"
          aria-label="Next month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <span
            key={d}
            className="py-1.5 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const disabled = isPast(day) || isWeekend(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => !disabled && onSelect(day)}
              disabled={disabled}
              className={`aspect-square rounded-lg text-sm font-medium transition-all duration-150 ${
                isSelected
                  ? "glass-heavy ring-2 ring-primary-500 text-primary-600 shadow-sm"
                  : disabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : isToday
                      ? "glass-subtle text-primary-600 font-semibold hover:glass"
                      : "text-foreground hover:glass-subtle"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
