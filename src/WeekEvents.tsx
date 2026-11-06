import {
  type AllDayBar,
  type CalendarEvent,
  cn,
  formatTime,
  type TimedBlock,
  UntitledEventText,
  useDisplaySettings,
  useEventProps,
} from "@rencomputer/rencal-sdk"
import { memo } from "react"

import { DAY_MINUTES, GUTTER_WIDTH, overlapBox, weekEventBox } from "./grid"

type DisplayMode = "xs" | "sm" | "md" | "lg"

// Thresholds are the shortest durations whose block fits each mode's lines at 48px per hour.
function displayModeFor(event: CalendarEvent): DisplayMode {
  // An event ending at midnight ends at the bottom of its day.
  const minutes = Math.min(event.endMinutes, DAY_MINUTES) - event.startMinutes
  if (minutes < 45) return "xs"
  if (minutes < 60) return "sm"
  if (minutes < 75) return "md"
  return "lg"
}

function TimedEvent({ block }: { block: TimedBlock<CalendarEvent> }) {
  const event = block.item
  const { timeFormat } = useDisplaySettings()
  const eventProps = useEventProps(event)

  const mode = displayModeFor(event)
  const hasStripe = event.rsvp !== "needs-action" && event.rsvp !== "declined"
  const summary = event.summary || <UntitledEventText />
  const startTime = formatTime(event.start, timeFormat)
  const endTime = formatTime(event.end, timeFormat)

  return (
    <div
      {...eventProps}
      data-view="week"
      className={cn(
        "absolute overflow-hidden rounded-sm px-(--event-padding-inline) text-xs cursor-default",
        hasStripe && "pl-[calc(var(--event-padding-inline)+4px)]",
      )}
      style={{
        ...weekEventBox(block.top, block.height),
        ...overlapBox(block),
        ...eventProps.style,
      }}
    >
      {hasStripe && (
        <div
          data-slot="calendar-event-color-marker"
          className="absolute left-0 top-0 bottom-0 w-1"
        />
      )}

      {mode === "xs" ? (
        <div className="flex items-baseline gap-1 pt-px">
          <span
            data-slot="calendar-event-title"
            className="truncate font-medium leading-tight min-w-0 flex-1"
          >
            {summary}
          </span>
          <span data-slot="calendar-event-time" className="text-2xs shrink-0 leading-tight">
            {startTime}
          </span>
        </div>
      ) : (
        <div className={mode === "sm" ? "pt-0.5" : "py-1"}>
          <div
            data-slot="calendar-event-title"
            className={cn(
              "font-medium leading-tight",
              mode === "sm" && "truncate",
              mode === "lg" && "line-clamp-2",
            )}
          >
            {summary}
          </div>
          <div data-slot="calendar-event-time" className="truncate leading-tight">
            {startTime} – {endTime}
          </div>
        </div>
      )}
    </div>
  )
}

export const WeekTimedEvent = memo(TimedEvent)

export function WeekAllDayBar({ bar }: { bar: AllDayBar<CalendarEvent> }) {
  const event = bar.item
  const eventProps = useEventProps(event)

  return (
    <div
      data-slot="week-all-day-lane"
      className="p-0.5 py-px pr-[3px]"
      // Past the gutter column and the header and padding rows.
      style={{ gridColumn: `${bar.column + 2} / span ${bar.span}`, gridRow: bar.lane + 3 }}
    >
      <div
        {...eventProps}
        data-view="week"
        className="flex items-center px-(--event-padding-inline) py-px leading-4 rounded-xs text-xs cursor-default"
      >
        {/* Sticky so the title stays visible when the user scrolls. */}
        <span
          data-slot="calendar-event-title"
          className="sticky truncate min-w-0"
          style={{ left: GUTTER_WIDTH + 4 }}
        >
          {event.summary || <UntitledEventText />}
        </span>
      </div>
    </div>
  )
}
