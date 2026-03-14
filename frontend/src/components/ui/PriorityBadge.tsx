// src/components/ui/PriorityBadge.tsx
import { Badge } from "./badge"
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"

interface PriorityBadgeProps {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  showIcon?: boolean
}

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
  const config = {
    CRITICAL: {
      label: 'Critical',
      className: 'priority-critical',
      icon: AlertCircle,
    },
    HIGH: {
      label: 'High',
      className: 'priority-high',
      icon: AlertTriangle,
    },
    MEDIUM: {
      label: 'Medium',
      className: 'priority-medium',
      icon: Info,
    },
    LOW: {
      label: 'Low',
      className: 'priority-low',
      icon: CheckCircle,
    },
  }

  const { label, className, icon: Icon } = config[priority]

  return (
    <Badge className={`${className} flex items-center gap-1`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  )
}
