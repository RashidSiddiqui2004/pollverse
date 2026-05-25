"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PollClosingTimePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export function PollClosingTimePicker({
  value,
  onChange,
}: PollClosingTimePickerProps) {
  const [selectedDate, setSelectedDate] =
    React.useState<Date | undefined>(
      value ?? undefined
    );

  const [time, setTime] = React.useState(() => {
    if (!value) return "23:59";

    return format(value, "HH:mm");
  });

  const handleDateSelect = (date?: Date) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange(null);
      return;
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const newDate = new Date(date);

    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    setSelectedDate(newDate);

    onChange(newDate);
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTime = e.target.value;

    setTime(newTime);

    if (!selectedDate) return;

    const [hours, minutes] =
      newTime.split(":").map(Number);

    const updated = new Date(selectedDate);

    updated.setHours(hours);
    updated.setMinutes(minutes);

    setSelectedDate(updated);

    onChange(updated);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 text-sm shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          {selectedDate ? (
            <span>
              {format(selectedDate, "PPP p")}
            </span>
          ) : (
            <span className="text-neutral-500">
              Select closing time
            </span>
          )}

          <span>📅</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        align="start"
      >
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Closing Time
            </label>

            <input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}