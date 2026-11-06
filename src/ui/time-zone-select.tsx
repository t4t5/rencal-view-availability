import { cn, useViewerTzid } from "@rencomputer/rencal-sdk"
import { Command as CommandPrimitive } from "cmdk"
import { useState } from "react"

import { listTimeZones, timeZoneCity, timeZoneOffsetLabel } from "../time-zones"
import { GlobeIcon, SearchIcon } from "./icons"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { focusSurface, SelectIcon } from "./select"

type TimeZoneOption = {
  tzid: string
  city: string
  offset: string
  searchText: string
}

function buildOptions(zones: string[]): TimeZoneOption[] {
  return zones
    .map((tzid) => {
      const city = timeZoneCity(tzid)
      const offset = timeZoneOffsetLabel(tzid)
      const region = tzid.replaceAll("_", " ").replaceAll("/", " ")
      return { tzid, city, offset, searchText: `${city} ${region} ${offset}`.toLowerCase() }
    })
    .sort((a, b) => a.city.localeCompare(b.city))
}

function filterOptions(options: TimeZoneOption[], query: string): TimeZoneOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return options

  const prefixMatches: TimeZoneOption[] = []
  const otherMatches: TimeZoneOption[] = []
  for (const option of options) {
    if (option.city.toLowerCase().startsWith(q)) prefixMatches.push(option)
    else if (option.searchText.includes(q)) otherMatches.push(option)
  }
  return [...prefixMatches, ...otherMatches]
}

function withKnownZones(zones: string[], extra: string[]): string[] {
  const missing = extra.filter((tzid) => !zones.includes(tzid))
  return missing.length ? [...missing, ...zones] : zones
}

export function TimeZoneSelect({
  tzid,
  onChange,
}: {
  tzid: string
  onChange: (tzid: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-control="select"
          data-variant="default"
          className={cn(
            "control-row group h-control w-full rounded-md border border-border bg-transparent text-sm outline-none hover:border-input",
            focusSurface,
          )}
        >
          <span data-slot="item-media" className="control-leading">
            <GlobeIcon />
          </span>
          <span data-slot="item-content" className="control-content">
            <TimeZoneLabel offset={timeZoneOffsetLabel(tzid)} city={timeZoneCity(tzid)} />
          </span>
          <SelectIcon />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width)">
        <TimeZoneList
          tzid={tzid}
          onCommit={(next) => {
            if (next !== tzid) onChange(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

// Mounted with the popover content, so it stays filled through the exit animation.
function TimeZoneList({ tzid, onCommit }: { tzid: string; onCommit: (tzid: string) => void }) {
  const viewerTzid = useViewerTzid()
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState<string | undefined>(tzid)

  // Build offsets once per open because calculating every zone is expensive.
  const [options] = useState(() => buildOptions(withKnownZones(listTimeZones(), [tzid, viewerTzid])))
  const filtered = filterOptions(options, query)

  const handleQueryChange = (next: string) => {
    setQuery(next)
    const [best] = filterOptions(options, next)
    setHighlighted(next.trim() ? best?.tzid : tzid)
  }

  return (
    <CommandPrimitive
      data-slot="command"
      shouldFilter={false}
      value={highlighted}
      onValueChange={setHighlighted}
      className="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
    >
      <div data-slot="command-input-wrapper" className="control-row h-control border-b">
        <span className="control-leading">
          <SearchIcon />
        </span>
        <CommandPrimitive.Input
          data-slot="command-input"
          placeholder="Search timezones"
          value={query}
          onValueChange={handleQueryChange}
          className="control-content placeholder:text-placeholder-foreground h-full bg-transparent text-sm outline-hidden"
        />
      </div>
      <CommandPrimitive.List
        data-slot="command-list"
        className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto"
      >
        {filtered.length ? (
          <CommandPrimitive.Group
            data-slot="command-group"
            className="text-foreground overflow-hidden p-1"
          >
            {filtered.map((option) => (
              <CommandPrimitive.Item
                key={option.tzid}
                data-slot="command-item"
                value={option.tzid}
                onSelect={() => onCommit(option.tzid)}
                className={cn(
                  "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
                  option.tzid === tzid && "font-medium",
                )}
              >
                <TimeZoneLabel offset={option.offset} city={option.city} />
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.Group>
        ) : (
          <div data-slot="command-empty" className="py-6 text-center text-sm">
            No timezones found.
          </div>
        )}
      </CommandPrimitive.List>
    </CommandPrimitive>
  )
}

const TimeZoneLabel = ({ offset, city }: { offset: string; city: string }) => (
  <span className="flex min-w-0 items-baseline gap-1.5 text-left">
    <span className="shrink-0 text-muted-foreground">{offset}</span>
    <span className="truncate">{city}</span>
  </span>
)
