import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#232021] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "rounded-md bg-[#232021] text-white hover:bg-[#3F3F46] dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]",
        destructive: "rounded-md bg-[#B91C1C] text-white hover:bg-[#991B1B]",
        outline:     "rounded-md border border-[#232021] bg-white text-[#232021] hover:bg-[#F4F4F5] dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-[#27272A]",
        secondary:   "rounded-md bg-[#F4F4F5] text-[#232021] hover:bg-[#E4E4E7] dark:bg-[#27272A] dark:text-white dark:hover:bg-[#3F3F46]",
        ghost:       "rounded-md text-[#232021] hover:bg-[#F4F4F5] dark:text-white dark:hover:bg-[#27272A]",
        link:        "text-[#232021] underline-offset-4 hover:underline dark:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 px-3 text-xs rounded",
        lg:      "h-12 px-6 text-base rounded-md",
        icon:    "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
