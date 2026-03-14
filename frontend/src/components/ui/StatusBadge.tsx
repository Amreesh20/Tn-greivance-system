// src/components/ui/StatusBadge.tsx
import { Badge } from "./badge"
import { 
  Clock, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Archive 
} from "lucide-react"

interface StatusBadgeProps {
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
  showIcon?: boolean
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = {
    submitted: {
      label: 'Submitted',
      className: 'status-submitted',
      icon: Clock,
    },
    acknowledged: {
      label: 'Acknowledged',
      className: 'status-acknowledged',
      icon: Eye,
    },
    in_progress: {
      label: 'In Progress',
      className: 'status-in_progress',
      icon: Loader2,
    },
    resolved: {
      label: 'Resolved',
      className: 'status-resolved',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Rejected',
      className: 'status-rejected',
      icon: XCircle,
    },
    closed: {
      label: 'Closed',
      className: 'status-closed',
      icon: Archive,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <Badge className={`${className} flex items-center gap-1`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  )
}
