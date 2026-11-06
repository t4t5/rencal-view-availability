import {
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  cn,
  formatMonth,
  formatWeekday,
  startOfWeek,
  Temporal,
  useDisplaySettings,
  useToday,
} from "@rencomputer/rencal-sdk"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { focusSurface, SelectIcon } from "./select"

const WEEKS = 6

/** A button that opens a month and reports the date you pick. */
export function DatePicker({
  defaultDate,
  onPick,
  placeholder,
  className,
}: {
  /** Marked in the calendar, which opens on its month. */
  defaultDate: Temporal.PlainDate
  onPick: (date: Temporal.PlainDate) => void
  placeholder: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-control="select"
          className={cn(
            "control-row group h-control cursor-default rounded-md border border-transparent bg-transparent text-left text-sm whitespace-nowrap outline-none select-none hover:border-input",
            focusSurface,
            className,
          )}
        >
          <span data-slot="item-content" className="control-content">
            {placeholder}
          </span>
          {/* Hidden by default to fit narrow forms; combo-box themes can show it. */}
          <SelectIcon visible={open} className="hidden" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0">
        <Month
          marked={defaultDate}
          onPick={(date) => {
            onPick(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

// Mounted with the popover, so it reopens on the marked date's month.
function Month({
  marked,
  onPick,
}: {
  marked: Temporal.PlainDate
  onPick: (date: Temporal.PlainDate) => void
}) {
  const { firstDayOfWeek } = useDisplaySettings()
  const today = useToday()
  const [month, setMonth] = useState(() => marked.with({ day: 1 }))

  const first = startOfWeek(month, firstDayOfWeek)
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => first.add({ days: i }))

  return (
    <div data-slot="calendar" className="w-fit bg-transparent p-3 [--cell-size:--spacing(8)]">
      <div data-slot="calendar-header" className="flex items-center justify-between gap-1.5 pb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          onClick={() => setMonth(month.subtract({ months: 1 }))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="select-none text-sm font-medium">
          {formatMonth(month, "long")} {month.year}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next month"
          onClick={() => setMonth(month.add({ months: 1 }))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      <div data-slot="calendar-grid" className="grid grid-cols-7">
        {days.slice(0, 7).map((day) => (
          <span
            key={day.dayOfWeek}
            data-slot="calendar-weekday"
            className="pb-1 text-center text-2xs font-normal uppercase text-muted-foreground select-none"
          >
            {formatWeekday(day, "short")}
          </span>
        ))}
        {days.map((day) => (
          <Button
            key={day.toString()}
            type="button"
            variant="ghost"
            size="icon"
            data-slot="calendar-day"
            data-selected={day.equals(marked) || undefined}
            data-today={day.equals(today) || undefined}
            className={cn(
              "data-selected:bg-selected data-selected:text-selected-foreground data-today:text-today data-today:data-selected:bg-today data-today:data-selected:text-today-foreground h-(--cell-size) w-full min-w-(--cell-size) font-normal leading-none",
              day.month !== month.month && "text-muted-foreground",
            )}
            onClick={() => onPick(day)}
          >
            {day.day}
          </Button>
        ))}
      </div>
    </div>
  )
}
