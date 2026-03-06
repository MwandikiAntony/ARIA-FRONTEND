import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`pt-16 ${className}`}>
      {children}
    </div>
  )
} 
