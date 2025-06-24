"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/MediaUtils"

// Custom Dialog component that can't be closed by clicking outside or pressing escape
const BlockingDialog = DialogPrimitive.Root

// Custom DialogContent that doesn't allow closing
const BlockingDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      onEscapeKeyDown={(e) => {
        // Prevent closing with escape key
        e.preventDefault()
      }}
      onPointerDownOutside={(e) => {
        // Prevent closing when clicking outside
        e.preventDefault()
      }}
      onInteractOutside={(e) => {
        // Prevent any interaction outside
        e.preventDefault()
      }}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#2a2a2a] bg-[#1a1a1a] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg text-white sm:rounded-lg md:w-full",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
BlockingDialogContent.displayName = "BlockingDialogContent"

// Reuse the same header, footer, title components from the original Dialog
const BlockingDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
BlockingDialogHeader.displayName = "BlockingDialogHeader"

const BlockingDialogFooter = ({
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
BlockingDialogFooter.displayName = "BlockingDialogFooter"

const BlockingDialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
BlockingDialogTitle.displayName = DialogPrimitive.Title.displayName

const BlockingDialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
))
BlockingDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  BlockingDialog,
  BlockingDialogContent,
  BlockingDialogHeader,
  BlockingDialogFooter,
  BlockingDialogTitle,
  BlockingDialogDescription,
}
