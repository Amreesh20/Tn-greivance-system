import React, { createContext, useContext, ReactNode } from 'react'
import { useToast as useToastHook, Toast } from '../hooks/useToast'
import { Toaster } from '../components/ui/Toaster'

type ToastContextType = {
  toast: (options: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastUtils = useToastHook()

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}