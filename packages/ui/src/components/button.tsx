import * as ButtonPrimitive from '@kobalte/core/button'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import { cva, type VariantProps } from 'class-variance-authority'
import { splitProps, type ValidComponent } from 'solid-js'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        /** Blog index filter chips — no ghost hover; touch gets immediate pressed styles. */
        filterChip:
          'rounded-full border-transparent bg-secondary text-secondary-foreground shadow-none aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-xs active:opacity-90 [@media(hover:hover)]:hover:bg-secondary/80 [@media(hover:hover)]:aria-pressed:hover:bg-primary/90',
        link: 'text-primary underline-offset-4 hover:underline',
        /** Quiet left-aligned navigation items (sidebars, menus). */
        navItem:
          'justify-start gap-2.5 px-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps<T extends ValidComponent = 'button'>
  extends ButtonPrimitive.ButtonRootProps<T>, VariantProps<typeof buttonVariants> {
  class?: string | undefined
}

/**
 * Kobalte `as` polymorphism replaces Base UI's `render` prop:
 * `<Button as="a" href="…">` or `<Button as={Link} to="…">`.
 */
function Button<T extends ValidComponent = 'button'>(props: PolymorphicProps<T, ButtonProps<T>>) {
  const [local, rest] = splitProps(props as ButtonProps, ['class', 'variant', 'size'])
  return (
    <ButtonPrimitive.Root
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
