import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react"

import type { DaySegment } from "./day-segments"
import { DAY_MINUTES } from "./grid"
import type { WeekDay } from "./useInfiniteDays"

const SNAP_MINUTES = 15
const DRAG_THRESHOLD_PX = 4
const AUTOSCROLL_EDGE_PX = 48
const AUTOSCROLL_MAX_STEP_PX = 16

type Selection = DaySegment & { dayKey: string }

const minutesAtY = (rect: DOMRect, y: number) => ((y - rect.top) / rect.height) * DAY_MINUTES

/** Snapped range that always contains the anchor's slot and grows toward the pointer. */
export function selectionForPointer(anchorMinutes: number, pointerMinutes: number): DaySegment {
  // Keep even an anchor on the exact bottom edge inside the final slot of the day.
  const anchor = Math.max(0, Math.min(DAY_MINUTES - 1e-9, anchorMinutes))
  const slotStart = Math.floor(anchor / SNAP_MINUTES) * SNAP_MINUTES
  const slotEnd = slotStart + SNAP_MINUTES
  const pointer = Math.max(0, Math.min(DAY_MINUTES, pointerMinutes))

  return {
    startMinutes: Math.min(slotStart, Math.floor(pointer / SNAP_MINUTES) * SNAP_MINUTES),
    endMinutes: Math.max(slotEnd, Math.ceil(pointer / SNAP_MINUTES) * SNAP_MINUTES),
  }
}

/** Pixels to scroll this frame: ramps up as the pointer nears or passes an edge. */
function edgeScrollDelta(y: number, top: number, bottom: number): number {
  const edge = AUTOSCROLL_EDGE_PX
  if (y < top - edge || y > bottom + edge) return 0
  const ramp = (depth: number) => Math.ceil(Math.min(1, depth / edge) * AUTOSCROLL_MAX_STEP_PX)
  if (y < top + edge) return -ramp(top + edge - y)
  if (y > bottom - edge) return ramp(y - (bottom - edge))
  return 0
}

/** Drag on a day column to pick a time, snapped to 15 minutes like drag-to-create. */
export function usePickDrag(onPick: (day: WeekDay, range: DaySegment) => void): {
  dragging: Selection | null
  startDrag: (day: WeekDay, event: PointerEvent<HTMLElement>) => void
} {
  const [dragging, setDragging] = useState<Selection | null>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => () => stopRef.current?.(), [])

  const startDrag = useCallback((day: WeekDay, press: PointerEvent<HTMLElement>) => {
    if (press.button !== 0 || stopRef.current) return

    const column = press.currentTarget
    const scrollEl = column.closest<HTMLElement>("[data-slot=week-scroll]")
    const anchorMinutes = minutesAtY(column.getBoundingClientRect(), press.clientY)
    const { clientX: startX, clientY: startY } = press
    let lastY = startY
    let selection: DaySegment | null = null
    let frame = 0

    const update = () => {
      const pointerMinutes = minutesAtY(column.getBoundingClientRect(), lastY)
      const next = selectionForPointer(anchorMinutes, pointerMinutes)
      if (
        selection?.startMinutes === next.startMinutes &&
        selection.endMinutes === next.endMinutes
      ) {
        return
      }
      selection = next
      setDragging({ ...next, dayKey: day.dateKey })
    }

    const autoscroll = () => {
      if (scrollEl) {
        const { top, bottom } = scrollEl.getBoundingClientRect()
        const dy = edgeScrollDelta(lastY, top, bottom)
        if (dy) {
          scrollEl.scrollBy(0, dy)
          update()
        }
      }
      frame = requestAnimationFrame(autoscroll)
    }

    const onMove = (event: globalThis.PointerEvent) => {
      lastY = event.clientY
      if (!selection) {
        const distance = Math.hypot(event.clientX - startX, event.clientY - startY)
        if (distance < DRAG_THRESHOLD_PX) return
        frame = requestAnimationFrame(autoscroll)
      }
      update()
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", stop)
      window.removeEventListener("keydown", onKeyDown)
      stopRef.current = null
      setDragging(null)
    }

    const onUp = () => {
      if (selection) onPickRef.current(day, selection)
      stop()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      stop()
    }

    stopRef.current = stop
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", stop)
    window.addEventListener("keydown", onKeyDown)
  }, [])

  return { dragging, startDrag }
}
