// src/pages/Success.tsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { CheckCircle2, Copy, Home, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { getTrackingNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const complaint = location.state?.complaint

  useEffect(() => {
    // Redirect if no complaint data
    if (!complaint) {
      navigate('/')
    }
  }, [complaint, navigate])

  if (!complaint) {
    return null
  }

  const trackingNumber = getTrackingNumber(complaint.id)

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber)
    toast({
      title: 'Copied!',
      description: 'Tracking number copied to clipboard',
      variant: 'success',
    })
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-green-500 to-green-600 py-12 text-white">
        <Container size="md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white text-green-500 mb-6">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Complaint Submitted Successfully!</h1>
            <p className="text-xl text-green-100">
              Your grievance has been registered and will be addressed soon.
            </p>
          </motion.div>
        </Container>
      </div>

      <div className="py-12">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Tracking Number */}
                  <div className="text-center pb-6 border-b">
                    <p className="text-sm text-gray-600 mb-2">Your Tracking Number</p>
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl font-bold text-tn-blue">
                        {trackingNumber}
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyTrackingNumber}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Save this number to track your complaint
                    </p>
                  </div>

                  {/* Complaint Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">Priority</p>
                        <div className="mt-1">
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Expected Resolution</p>
                        <p className="font-semibold">{complaint.slaHours} hours</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">District</p>
                      <p className="font-semibold">{complaint.district?.name || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Complaint Description</p>
                      <p className="mt-1">{complaint.text}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Contact Phone</p>
                      <p className="font-semibold">{complaint.citizenPhone}</p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-tn-blue mb-2">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✓ Your complaint will be reviewed by our AI system</li>
                      <li>✓ It will be assigned to the relevant department officer</li>
                      <li>✓ You can track progress using your phone number</li>
                      <li>✓ You'll be notified of any updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/track')}
                className="flex-1"
              >
                <Search className="mr-2 h-5 w-5" />
                Track My Complaints
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>
    </PageLayout>
  )
}
