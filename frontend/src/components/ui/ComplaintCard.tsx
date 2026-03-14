// src/components/ui/ComplaintCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { PriorityBadge } from "./PriorityBadge"
import { StatusBadge } from "./StatusBadge"
import { formatDate, getTrackingNumber } from "@/lib/utils"
import { Calendar, MapPin, User } from "lucide-react"

interface Complaint {
  id: number
  text: string
  category: string
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  createdAt: string
  district?: {
    name: string
  }
  officer?: {
    name: string
  }
}

interface ComplaintCardProps {
  complaint: Complaint
  onClick?: () => void
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {getTrackingNumber(complaint.id)}
            </CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">
              {complaint.text}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          {complaint.district && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{complaint.district.name}</span>
            </div>
          )}
          {complaint.officer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to {complaint.officer.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
