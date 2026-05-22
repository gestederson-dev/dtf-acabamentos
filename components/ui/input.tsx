import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#232021]",
          "placeholder:text-[#A1A1AA]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#232021] focus-visible:border-[#232021]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "transition-colors duration-150",
          "dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:placeholder:text-[#52525B]",
          "dark:focus-visible:ring-white dark:focus-visible:border-white",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
