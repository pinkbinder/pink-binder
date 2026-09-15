import * as SelectPrimitive from '@kobalte/core/select'
import { Check, ChevronDown } from 'lucide-solid'
import { splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

const Select = SelectPrimitive.Root

type SelectTriggerProps = SelectPrimitive.SelectTriggerProps & {
  class?: string
  children?: JSX.Element
}

function SelectTrigger(props: SelectTriggerProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <SelectPrimitive.Trigger
      class={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        local.class
      )}
      {...rest}
    >
      {local.children}
      <SelectPrimitive.Icon>
        <ChevronDown class="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectValueProps = SelectPrimitive.SelectValueProps<unknown> & { class?: string }

function SelectValue(props: SelectValueProps) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <SelectPrimitive.Value
      class={cn('data-[placeholder-shown]:text-muted-foreground', local.class)}
      {...rest}
    />
  )
}

type SelectContentProps = SelectPrimitive.SelectContentProps & {
  class?: string
  children?: JSX.Element
}

function SelectContent(props: SelectContentProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        class={cn(
          'bg-popover text-popover-foreground data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 relative max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md',
          local.class
        )}
        {...rest}
      >
        <SelectPrimitive.Listbox class="m-0 max-h-(--kb-popper-content-available-height) overflow-y-auto p-1" />
        {local.children}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

type SelectItemProps = SelectPrimitive.SelectItemProps & {
  class?: string
  children?: JSX.Element
}

function SelectItem(props: SelectItemProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <SelectPrimitive.Item
      class={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default items-center rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class
      )}
      {...rest}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check class="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemLabel>{local.children}</SelectPrimitive.ItemLabel>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
