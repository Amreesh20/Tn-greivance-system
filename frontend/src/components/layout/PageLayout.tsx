// src/components/layout/PageLayout.tsx
import { ReactNode } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
