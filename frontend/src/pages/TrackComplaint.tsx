// src/pages/TrackComplaint.tsx
import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ComplaintCard } from '@/components/ui/ComplaintCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useComplaint } from '@/hooks/useComplaint'
import { useToast } from '@/hooks/useToast'
import { Search, FileSearch } from 'lucide-react'
import { Complaint } from '@/types'

export function TrackComplaint() {
  const [phone, setPhone] = useState('')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [searched, setSearched] = useState(false)
  const { trackByPhone, loading } = useComplaint()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (phone.length !== 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'error',
      })
      return
    }

    try {
      const response = await trackByPhone(phone)
      setComplaints(response.complaints || [])
      setSearched(true)

      if (response.count === 0) {
        toast({
          title: 'No Complaints Found',
          description: `No complaints found for ${phone}`,
          variant: 'warning',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Search Failed',
        description: error.message || 'Please try again',
        variant: 'error',
      })
      setSearched(true)
      setComplaints([])
    }
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-tn-blue to-blue-600 py-12 text-white">
        <Container size="md">
          <h1 className="text-4xl font-bold">Track Your Complaint</h1>
          <p className="text-xl text-blue-100 mt-2">
            Enter your phone number to see all your complaints
          </p>
        </Container>
      </div>

      <div className="py-12">
        <Container size="md">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || phone.length !== 10}>
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the phone number you used to register the complaint
                </p>
              </div>
            </div>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Searching for complaints..." />
            </div>
          )}

          {/* Results */}
          {!loading && searched && (
            <>
              {complaints.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      Found {complaints.length} Complaint{complaints.length !== 1 ? 's' : ''}
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {complaints.map((complaint) => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={FileSearch}
                  title="No Complaints Found"
                  description={`We couldn't find any complaints registered with phone number ${phone}`}
                />
              )}
            </>
          )}

          {/* Initial State */}
          {!loading && !searched && (
            <div className="text-center py-12 text-gray-500">
              <FileSearch className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Enter your phone number to track complaints</p>
            </div>
          )}
        </Container>
      </div>
    </PageLayout>
  )
}
