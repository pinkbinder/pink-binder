import { cva, type VariantProps } from 'class-variance-authority'
import { splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      class={cn('bg-card text-card-foreground rounded-lg border shadow-xs', local.class)}
      {...rest}
    />
  )
}

function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('flex flex-col space-y-1.5 p-6', local.class)} {...rest} />
}

const cardTitleVariants = cva('font-semibold tracking-tight', {
  variants: {
    size: {
      default: 'text-2xl leading-none',
      /** Compact section titles, e.g. catalog product names. */
      sm: 'text-lg leading-tight',
      /** Dense table or dashboard summary cards. */
      xs: 'text-base leading-snug',
      /** Large numeric stats; figures align across cards. */
      metric: 'text-3xl leading-none tabular-nums',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface CardTitleProps
  extends JSX.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof cardTitleVariants> {}

function CardTitle(props: CardTitleProps) {
  const [local, rest] = splitProps(props, ['class', 'size'])
  return <h3 class={cn(cardTitleVariants({ size: local.size }), local.class)} {...rest} />
}

function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p class={cn('text-muted-foreground text-sm', local.class)} {...rest} />
}

function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('p-6 pt-0', local.class)} {...rest} />
}

function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('flex items-center p-6 pt-0', local.class)} {...rest} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
