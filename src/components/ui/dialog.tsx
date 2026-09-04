"use client"

import * as React from "react"
import { Dialog as DialogNamespace } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const Dialog = DialogNamespace.Root

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Popup>,
  React.ComponentProps<typeof DialogNamespace.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogNamespace.Portal>
    <DialogNamespace.Backdrop className="backdrop-blur-sm bg-black/80" />
    <DialogNamespace.Popup
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogNamespace.Close className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <span className="sr-only">Close</span>
        <X className="size-4" />
      </DialogNamespace.Close>
    </DialogNamespace.Popup>
  </DialogNamespace.Portal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Title>,
  React.ComponentProps<typeof DialogNamespace.Title>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Description>,
  React.ComponentProps<typeof DialogNamespace.Description>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Close>,
  React.ComponentProps<typeof DialogNamespace.Close>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
      className
    )}
    {...props}
  >
    <span className="sr-only">Close</span>
    <X className="size-4" />
  </DialogNamespace.Close>
))
DialogClose.displayName = "DialogClose"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
