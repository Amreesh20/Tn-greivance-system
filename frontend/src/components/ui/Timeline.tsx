// src/components/ui/Timeline.tsx
import { formatDate } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"

interface TimelineItem {
  id: number
  status: string
  comment?: string
  createdAt: string
  user?: {
    name: string
    role: string
  }
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isCompleted = index < items.length - 1

        return (
          <div key={item.id} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-1 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-full min-h-[40px] ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold capitalize">
                    {item.status.replace('_', ' ')}
                  </p>
                  {item.comment && (
                    <p className="text-sm text-gray-600 mt-1">{item.comment}</p>
                  )}
                  {item.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {item.user.name} ({item.user.role})
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
