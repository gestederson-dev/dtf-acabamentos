import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "border-[#E4E4E7] bg-white text-[#232021] dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-white",
        secondary:   "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B] dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-[#A1A1AA]",
        success:     "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]",
        warning:     "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
        danger:      "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
        outline:     "border-[#232021] bg-transparent text-[#232021] dark:border-white dark:text-white",
        destructive: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
