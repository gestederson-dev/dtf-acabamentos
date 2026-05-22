"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex border-b border-[#E4E4E7] dark:border-[#27272A]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative py-3 px-1 mr-6 text-sm font-medium transition-colors duration-150",
      "text-[#71717A] hover:text-[#3F3F46] dark:text-[#71717A] dark:hover:text-[#A1A1AA]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#232021] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-40",
      "data-[state=active]:text-[#232021] dark:data-[state=active]:text-white",
      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full",
      "after:bg-transparent data-[state=active]:after:bg-[#232021] dark:data-[state=active]:after:bg-white",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#232021] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
