import { cn } from "@rencomputer/rencal-sdk"
import * as SelectPrimitive from "@radix-ui/react-select"
import type { ComponentProps } from "react"

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "./icons"

// renCal's select, with its class names and slots so themes style this one too.
export const focusSurface =
  "focus-visible:border-(--control-active-border) focus-visible:bg-(--control-active-background) [&[data-state=open]:not([aria-invalid=true])]:border-(--control-active-border) data-[state=open]:bg-(--control-active-background)"

export function SelectIcon({ visible = true, className }: { visible?: boolean; className?: string }) {
  return (
    <span
      data-slot="select-icon"
      aria-hidden="true"
      className={cn(
        "text-muted-foreground opacity-0 group-hover:opacity-100",
        visible && "opacity-100",
        className,
      )}
    >
      <ChevronDownIcon className="size-3 text-current" />
    </span>
  )
}

export const Select = SelectPrimitive.Root

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-control="select"
      data-variant="default"
      data-size="default"
      className={cn(
        "border border-border hover:border-input flex h-control w-fit items-center justify-between gap-2 px-3 rounded-md bg-transparent text-sm whitespace-nowrap transition-[color] outline-none *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 group",
        focusSurface,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <SelectIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position="popper"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton
          data-slot="select-scroll-up-button"
          className="flex cursor-default items-center justify-center py-1"
        >
          <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          data-slot="select-viewport"
          className="p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton
          data-slot="select-scroll-down-button"
          className="flex cursor-default items-center justify-center py-1"
        >
          <ChevronDownIcon className="size-3" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
