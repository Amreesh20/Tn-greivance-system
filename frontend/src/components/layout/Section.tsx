// src/components/layout/Section.tsx
import { ReactNode } from "react"
import { Container } from "./Container"
import { cn } from "@/lib/utils"

interface SectionProps {
  children: ReactNode
  className?: string
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  background?: 'white' | 'gray' | 'blue' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({ 
  children, 
  className,
  containerSize = 'lg',
  background = 'white',
  padding = 'lg'
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    gradient: 'bg-gradient-to-br from-tn-blue to-blue-600',
  }

  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  }

  return (
    <section className={cn(
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  )
}
