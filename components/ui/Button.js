'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-purple hover:bg-purple-light text-white shadow-lg shadow-purple/20",
        secondary: "bg-card text-text-primary hover:bg-border border border-border",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-purple text-purple hover:bg-purple hover:text-white",
        ghost: "hover:bg-card hover:text-white text-text-secondary",
        link: "text-purple underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, fullWidth, asChild = false, isLoading = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : motion.button
  const motionProps = asChild ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...motionProps}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button