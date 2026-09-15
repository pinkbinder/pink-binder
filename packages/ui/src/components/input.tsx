import { splitProps, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>

function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ['class', 'type'])
  return (
    <input
      type={local.type}
      class={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...rest}
    />
  )
}

export { Input }
export type { InputProps }
