import { Temporal } from "@rencomputer/rencal-sdk"

let cachedTimeZones: string[] | undefined

export function listTimeZones(): string[] {
  if (!cachedTimeZones) {
    const zones = Intl.supportedValuesOf("timeZone")
    cachedTimeZones = [...zones.filter((z) => z.includes("/") && !z.startsWith("Etc/")), "UTC"]
  }
  return cachedTimeZones
}

export function timeZoneCity(tzid: string): string {
  return tzid.slice(tzid.lastIndexOf("/") + 1).replaceAll("_", " ")
}

/** e.g. "Eastern Time": generic, so it holds on both sides of a DST change. */
export function timeZoneName(tzid: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tzid,
    timeZoneName: "longGeneric",
  }).formatToParts()
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZoneCity(tzid)
}

/** The zone's UTC offset right now, e.g. "GMT+1" or "GMT-3:30". */
export function timeZoneOffsetLabel(tzid: string): string {
  const offset = Temporal.Now.zonedDateTimeISO(tzid).offset // e.g. "+01:00"
  const sign = offset.startsWith("-") ? "-" : "+"
  const [hours, minutes] = offset.slice(1).split(":")
  return `GMT${sign}${Number(hours)}${minutes === "00" ? "" : `:${minutes}`}`
}
