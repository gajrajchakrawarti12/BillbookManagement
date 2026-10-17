import type React from "react"
import { cn } from "../../lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-[#d9e2ec]/90 bg-white text-[#102a43] shadow-[0_10px_30px_-24px_rgba(16,42,67,.55)]", className)} {...props} />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn("text-xl font-bold leading-none tracking-tight text-[#102a43]", className)} {...props} />
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn("text-sm leading-6 text-[#627d98]", className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
