"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastActionElement, 
  type ToastProps
} from "./toast"
import { useToast } from "./UseToast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }: ToasterToast) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && (
              <div className="ml-2">
                {action}
              </div>
            )}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="p-4 md:max-w-[420px] md:p-4 gap-4" />
    </ToastProvider>
  )
}
