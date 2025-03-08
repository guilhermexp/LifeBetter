
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#8B5CF6] to-[#6E59A5] text-white shadow-sm hover:shadow-md hover:opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        nav: "flex flex-col items-center justify-center rounded-full p-2 hover:bg-gray-100 focus:outline-none transition-colors focus-visible:bg-accent",
        activeNav: "flex flex-col items-center justify-center rounded-full p-2 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white shadow-sm focus:outline-none transition-colors",
        taskTypeInactive: "flex-1 py-3 border border-gray-200 bg-white text-gray-700 rounded-md hover:bg-gray-50",
        taskTypeActive: "flex-1 py-3 border-2 border-purple-500 bg-purple-50 text-purple-700 rounded-md font-medium",
        priorityInactive: "flex-1 py-3 border border-gray-200 bg-white text-gray-700 rounded-md hover:bg-gray-50",
        priorityLow: "flex-1 py-3 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-md font-medium",
        priorityMedium: "flex-1 py-3 border-2 border-orange-500 bg-orange-50 text-orange-700 rounded-md font-medium",
        priorityHigh: "flex-1 py-3 border-2 border-red-500 bg-red-50 text-red-700 rounded-md font-medium",
        colorOption: "w-10 h-10 rounded-full p-0",
        colorOptionActive: "w-10 h-10 rounded-full p-0 ring-2 ring-offset-2 ring-purple-600",
        durationInactive: "px-3 py-2 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200",
        durationActive: "px-3 py-2 text-sm rounded-full bg-purple-500 text-white",
        eventTypeTab: "flex items-center gap-1.5 py-1.5 px-3 rounded-md flex-1",
        eventTypeTabActive: "flex items-center gap-1.5 py-1.5 px-3 rounded-md flex-1 bg-primary text-primary-foreground",
        quickAdd: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 outline-none shadow-none",
        filterButton: "justify-start",
        filterButtonActive: "justify-start bg-primary text-primary-foreground",
        navbarTab: "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-primary",
        navbarTabActive: "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-primary bg-primary/10 font-medium",
        navbarProfile: "flex items-center justify-center rounded-full p-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-200",
        quickNoteOption: "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors rounded-full border",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        nav: "h-12 w-12 sm:h-14 sm:w-14",
        navbarTab: "h-auto w-16",
        navbarProfile: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
