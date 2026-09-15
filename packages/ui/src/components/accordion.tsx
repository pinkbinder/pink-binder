import * as AccordionPrimitive from '@kobalte/core/accordion'
import { ChevronDown } from 'lucide-solid'
import { splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

const Accordion = AccordionPrimitive.Root

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  class?: string
  children?: JSX.Element
}

function AccordionItem(props: AccordionItemProps) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <AccordionPrimitive.Item
      class={cn('border-border/60 border-b last:border-b-0', local.class)}
      {...rest}
    />
  )
}

type AccordionTriggerProps = AccordionPrimitive.AccordionTriggerProps & {
  class?: string
  children?: JSX.Element
}

function AccordionTrigger(props: AccordionTriggerProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <AccordionPrimitive.Header class="flex">
      <AccordionPrimitive.Trigger
        class={cn(
          'hover:text-foreground focus-visible:ring-ring flex flex-1 items-center justify-between gap-2 rounded-md py-3 text-left text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden [&[data-expanded]>svg]:rotate-180',
          local.class
        )}
        {...rest}
      >
        {local.children}
        <ChevronDown
          class="text-muted-foreground size-4 shrink-0 transition-transform duration-200"
          aria-hidden
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = AccordionPrimitive.AccordionContentProps & {
  class?: string
  children?: JSX.Element
}

function AccordionContent(props: AccordionContentProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <AccordionPrimitive.Content
      class="overflow-hidden text-sm data-[closed]:animate-accordion-up data-[expanded]:animate-accordion-down"
      {...rest}
    >
      <div class={cn('pt-0 pb-4', local.class)}>{local.children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
