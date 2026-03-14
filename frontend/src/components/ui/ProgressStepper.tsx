// src/components/ui/ProgressStepper.tsx
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    rounded-full h-10 w-10 flex items-center justify-center border-2 transition-all
                    ${isCompleted && 'bg-tn-blue border-tn-blue text-white'}
                    ${isCurrent && 'border-tn-blue text-tn-blue bg-blue-50'}
                    ${isUpcoming && 'border-gray-300 text-gray-400 bg-white'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="absolute top-12 text-center w-32">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-tn-blue' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 transition-all mx-2
                    ${isCompleted ? 'bg-tn-blue' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
