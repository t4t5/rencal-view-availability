import {
  Button,
  cn,
  formatShortDate,
  useDisplaySettings,
  useToday,
  useViewerTzid,
} from "@rencomputer/rencal-sdk"
import { memo, useEffect, useState } from "react"

import { TimeSelect } from "./TimeSelect"
import {
  clearDays,
  dropDay,
  dropRange,
  editRange,
  pickRange,
  setDuration,
  setTheirTzid,
  useAvailability,
} from "./availability-store"
import { freeTimesMessage } from "./free-times-message"
import { DAY_MINUTES } from "./grid"
import {
  DEFAULT_RANGE,
  LAST_START_MINUTES,
  nextDate,
  nextRange,
  offeredSpans,
  type PickedDay,
  rangeFrom,
  TIME_STEP_MINUTES,
} from "./picked-days"
import { DatePicker } from "./ui/date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { CheckIcon, CloseIcon, CopyIcon, MoreHorizIcon, PlusIcon } from "./ui/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { TimeZoneSelect } from "./ui/time-zone-select"

const PANEL_WIDTH = 392
const DURATIONS = [15, 30, 45, 60, 90]
const COPIED_MS = 1500
const LABEL = "flex items-center gap-2 text-sm leading-none font-medium select-none"
const SMALL_LABEL = "text-xs font-normal text-muted-foreground"

/**
 * The inspector on the right: your times, then the message they turn into.
 * Memoized so drag steps in the grid don't re-render every closed TimeSelect.
 */
export const AvailabilityPanel = memo(function AvailabilityPanel() {
  const { days } = useAvailability()

  return (
    <aside
      data-slot="availability-panel"
      className="flex flex-col shrink-0 min-h-0 border-l border-border bg-background"
      style={{ width: PANEL_WIDTH }}
    >
      <div className="flex flex-col gap-4 overflow-y-auto p-4 grow min-h-0">
        <div className="flex items-center justify-between h-control-xs">
          <h3 data-typography="heading" className="text-sm">
            Availability schedule
          </h3>
          {days.length > 0 && (
            <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={clearDays}>
              Clear
            </Button>
          )}
        </div>
        {days.map((day) => (
          <DayRow key={day.date.toString()} day={day} />
        ))}
        <NewDayRow />
      </div>
      <MessageSection />
    </aside>
  )
})

function DurationSelect() {
  const { durationMinutes } = useAvailability()

  return (
    <Select value={String(durationMinutes)} onValueChange={(next) => setDuration(Number(next))}>
      <SelectTrigger aria-label="Duration" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DURATIONS.map((minutes) => (
          <SelectItem key={minutes} value={String(minutes)}>
            {minutes} min
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function DayRow({ day }: { day: PickedDay }) {
  const { durationMinutes } = useAvailability()
  const { date, ranges } = day
  const spare = nextRange(ranges, durationMinutes)

  return (
    <div data-slot="availability-day" className="flex gap-1">
      <span data-slot="label" className={cn(LABEL, "w-22 shrink-0 h-control")}>
        {formatShortDate(date)}
      </span>
      <div className="flex flex-col gap-1">
        {ranges.map((range, index) => (
          <div key={index} className="flex items-center gap-1">
            <TimeSelect
              value={range.startMinutes}
              min={0}
              max={LAST_START_MINUTES}
              onChange={(startMinutes) =>
                editRange(
                  date,
                  index,
                  startMinutes < range.endMinutes
                    ? { ...range, startMinutes }
                    : rangeFrom(startMinutes, durationMinutes),
                )
              }
            />
            <span className="text-muted-foreground">–</span>
            <TimeSelect
              value={range.endMinutes}
              min={range.startMinutes + TIME_STEP_MINUTES}
              max={DAY_MINUTES}
              onChange={(endMinutes) => editRange(date, index, { ...range, endMinutes })}
            />
            {index === 0 ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Add times"
                  disabled={!spare}
                  onClick={() => spare && pickRange(date, spare)}
                >
                  <PlusIcon className="size-4" />
                </Button>
                <DayMenu day={day} />
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Remove times"
                onClick={() => dropRange(date, index)}
              >
                <CloseIcon className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** The first range has no remove button of its own, so clearing it lives here. */
function DayMenu({ day: { date, ranges } }: { day: PickedDay }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="More options" size="icon-sm" variant="ghost">
          <MoreHorizIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => dropDay(date)}>Clear day</DropdownMenuItem>
        {ranges.length > 1 && (
          <DropdownMenuItem onClick={() => dropRange(date, 0)}>
            Clear first time range
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Always last: adding it, or changing its date or times, makes it a real row. */
function NewDayRow() {
  const { days, durationMinutes } = useAvailability()
  const date = nextDate(days, useToday())
  const { startMinutes, endMinutes } = DEFAULT_RANGE

  return (
    <div data-slot="availability-new-day" className="flex items-center gap-1">
      <div className="w-22 shrink-0">
        <DatePicker
          defaultDate={date}
          onPick={(picked) => pickRange(picked, DEFAULT_RANGE)}
          placeholder="Add day"
          className="border-0 px-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-transparent data-[state=open]:text-foreground"
        />
      </div>
      <TimeSelect
        value={startMinutes}
        min={0}
        max={LAST_START_MINUTES}
        onChange={(start) =>
          pickRange(
            date,
            start < endMinutes
              ? { ...DEFAULT_RANGE, startMinutes: start }
              : rangeFrom(start, durationMinutes),
          )
        }
      />
      <span className="text-muted-foreground">–</span>
      <TimeSelect
        value={endMinutes}
        min={startMinutes + TIME_STEP_MINUTES}
        max={DAY_MINUTES}
        onChange={(end) => pickRange(date, { ...DEFAULT_RANGE, endMinutes: end })}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        title="Add day"
        onClick={() => pickRange(date, DEFAULT_RANGE)}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  )
}

function MessageSection() {
  const { days, durationMinutes, theirTzid } = useAvailability()
  const { timeFormat } = useDisplaySettings()
  const viewerTzid = useViewerTzid()
  const tzid = theirTzid ?? viewerTzid
  const windows = offeredSpans(days, viewerTzid)
  const message =
    windows.length > 0 ? freeTimesMessage({ windows, durationMinutes }, tzid, timeFormat) : null

  const [copyResult, setCopyResult] = useState<"Copied!" | "Couldn't copy" | null>(null)

  useEffect(() => {
    if (!copyResult) return
    const timer = setTimeout(() => setCopyResult(null), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copyResult])

  const copy = async () => {
    // Dragging to select part of the message shouldn't copy all of it.
    if (!message || window.getSelection()?.toString()) return
    try {
      await navigator.clipboard.writeText(message)
      setCopyResult("Copied!")
    } catch {
      setCopyResult("Couldn't copy")
    }
  }

  return (
    <section className="flex flex-col gap-3 p-4 border-t border-border shrink-0">
      <h3 data-typography="heading" className="text-sm">
        Message
      </h3>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 w-28 shrink-0">
          <span className={cn(LABEL, SMALL_LABEL)}>Duration</span>
          <DurationSelect />
        </div>
        <div className="flex flex-col gap-1 min-w-0 grow">
          <span className={cn(LABEL, SMALL_LABEL)}>Their timezone</span>
          <TimeZoneSelect tzid={tzid} onChange={setTheirTzid} />
        </div>
      </div>
      <div
        className={cn(
          "group relative overflow-hidden rounded-md border border-border bg-muted/30",
          message && "cursor-pointer",
        )}
        onClick={() => void copy()}
      >
        <div
          data-slot="availability-message"
          className={cn(
            "h-32 overflow-y-auto whitespace-pre-wrap p-3 pb-10 text-sm select-text",
            !message && "text-muted-foreground",
          )}
        >
          {message ?? "Pick some times and your message appears here."}
        </div>
        {message && (
          <Button
            variant="secondary"
            size={copyResult ? "sm" : "icon-sm"}
            aria-label={copyResult ? undefined : "Copy message"}
            title={copyResult ? undefined : "Copy message"}
            className="absolute right-2 bottom-2 transition-colors group-hover:bg-secondary-hover"
          >
            {copyResult ? (
              <>
                {copyResult === "Copied!" && <CheckIcon className="size-4" />}
                {copyResult}
              </>
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        )}
      </div>
    </section>
  )
}
