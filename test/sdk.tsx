// What the tests need of the SDK, which only exists at runtime inside renCal.
import { Temporal } from "@js-temporal/polyfill"
import type { ComponentProps } from "react"

export { Temporal }

export const cn = (...classes: unknown[]) => classes.filter(Boolean).join(" ")

export const Button = ({
  variant: _variant,
  size: _size,
  ...props
}: ComponentProps<"button"> & { variant?: string; size?: string }) => <button {...props} />

export const useDisplaySettings = () => ({ timeFormat: "24h", firstDayOfWeek: "monday" })
export const useViewerTzid = () => "Europe/Stockholm"
export const useToday = () => Temporal.Now.plainDateISO("Europe/Stockholm")

export const formatMonth = (date: Temporal.PlainDate, style: "short" | "long") =>
  date.toLocaleString("en-GB", { month: style, calendar: date.calendarId })
export const formatWeekday = (date: Temporal.PlainDate, style: "short" | "long") =>
  date.toLocaleString("en-GB", { weekday: style, calendar: date.calendarId })

export const formatShortDate = (date: Temporal.PlainDate) =>
  `${formatWeekday(date, "short")}, ${date.day} ${formatMonth(date, "short")}`

export function formatWallclockTime(hour: number, minute: number, timeFormat: string): string {
  const mm = String(minute).padStart(2, "0")
  if (timeFormat === "24h") return `${String(hour).padStart(2, "0")}:${mm}`
  return `${hour % 12 === 0 ? 12 : hour % 12}:${mm} ${hour < 12 ? "AM" : "PM"}`
}

export const startOfWeek = (date: Temporal.PlainDate) =>
  date.subtract({ days: date.dayOfWeek - 1 })
