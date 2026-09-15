import * as DialogPrimitive from '@kobalte/core/dialog'
import { X } from 'lucide-solid'
import { splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.CloseButton

type DialogOverlayProps = DialogPrimitive.DialogOverlayProps & { class?: string }

function DialogOverlay(props: DialogOverlayProps) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <DialogPrimitive.Overlay
      class={cn(
        'data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:animate-in data-[expanded]:fade-in-0 fixed inset-0 z-50 bg-black/40',
        local.class
      )}
      {...rest}
    />
  )
}

type DialogContentProps = DialogPrimitive.DialogContentProps & {
  class?: string
  children?: JSX.Element
}

function DialogContent(props: DialogContentProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        class={cn(
          'bg-card text-card-foreground data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl p-5 shadow-xl duration-200',
          local.class
        )}
        {...rest}
      >
        {local.children}
        <DialogPrimitive.CloseButton class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('flex flex-col space-y-1.5', local.class)} {...rest} />
}

function DialogFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', local.class)}
      {...rest}
    />
  )
}

type DialogTitleProps = DialogPrimitive.DialogTitleProps & { class?: string }

function DialogTitle(props: DialogTitleProps) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <DialogPrimitive.Title
      class={cn('font-title text-xl leading-none font-semibold tracking-tight', local.class)}
      {...rest}
    />
  )
}

type DialogDescriptionProps = DialogPrimitive.DialogDescriptionProps & { class?: string }

function DialogDescription(props: DialogDescriptionProps) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <DialogPrimitive.Description
      class={cn('text-muted-foreground text-sm', local.class)}
      {...rest}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
