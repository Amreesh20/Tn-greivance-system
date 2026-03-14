import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DistrictSelector } from '@/components/ui/DistrictSelector'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { useComplaint } from '@/hooks/useComplaint'
import { useToast } from '@/contexts/ToastContext'
import { ArrowLeft, Send, Mic, Image, FileText, ArrowRight } from 'lucide-react'

export function SubmitComplaint() {
  const navigate = useNavigate()
  const { submitComplaint, loading } = useComplaint()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    text: '',
    districtId: '',
  })

  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const steps = [
    { id: 1, title: 'Personal Info', description: 'Your details' },
    { id: 2, title: 'Complaint', description: 'Describe issue' },
    { id: 3, title: 'Review', description: 'Confirm & submit' },
  ]

  // Voice Recording
  const handleVoiceRecord = async () => {
    if (!navigator.mediaDevices) {
      toast({
        title: 'Not Supported',
        description: 'Voice recording not supported in your browser',
        variant: 'error',
      })
      return
    }

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        audioChunksRef.current = []

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm'
        })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
          }

          // Create audio file from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioFile = new File([audioBlob], `voice_complaint_${Date.now()}.webm`, {
            type: 'audio/webm'
          })
          setVoiceFile(audioFile)

          toast({
            title: 'Recording Stopped',
            description: 'Voice recorded successfully',
            variant: 'success',
          })
        }

        mediaRecorder.start(1000) // Collect data every second
        setIsRecording(true)

        // Start timer
        let seconds = 0
        timerRef.current = setInterval(() => {
          seconds++
          setRecordingTime(seconds)

          // Auto-stop after 60 seconds
          if (seconds >= 60) {
            handleVoiceRecord()
          }
        }, 1000)

        toast({
          title: 'Recording Started',
          description: 'Speak your complaint now... (max 60 seconds)',
          variant: 'default',
        })
      } catch (err) {
        console.error('Error starting recording:', err)
        toast({
          title: 'Microphone Error',
          description: 'Could not access microphone. Please grant permission.',
          variant: 'error',
        })
      }
    }
  }

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB',
          variant: 'error',
        })
        return
      }
      setImageFile(file)
      toast({
        title: 'Image Added',
        description: file.name,
        variant: 'success',
      })
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.citizenName || !formData.citizenPhone) {
        toast({
          title: 'Missing Information',
          description: 'Name and phone are required',
          variant: 'error',
        })
        return
      }
      if (formData.citizenPhone.length !== 10) {
        toast({
          title: 'Invalid Phone',
          description: 'Phone number must be 10 digits',
          variant: 'error',
        })
        return
      }
    }

    if (currentStep === 2) {
      if (!formData.text && !voiceFile && !imageFile) {
        toast({
          title: 'Complaint Required',
          description: 'Please describe your complaint using text, voice, or image',
          variant: 'error',
        })
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      // Submit with media files if present
      const response = await submitComplaint(
        {
          ...formData,
          districtId: formData.districtId || 'TN_CHN_001', // Default if not selected
        },
        {
          imageFile: imageFile || undefined,
          audioFile: voiceFile || undefined,
        }
      )

      toast({
        title: 'Success!',
        description: 'Your complaint has been submitted',
        variant: 'success',
      })

      navigate('/success', {
        state: { complaint: response.complaint },
      })
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Please try again',
        variant: 'error',
      })
    }
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-tn-blue to-blue-600 py-12 text-white">
        <Container size="md">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold">Register Your Complaint</h1>
          <p className="text-xl text-blue-100 mt-2">
            AI-powered complaint submission
          </p>
        </Container>
      </div>

      <div className="py-12">
        <Container size="md">
          {/* Progress Stepper */}
          <ProgressStepper steps={steps} currentStep={currentStep} />

          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                  <p className="text-gray-600 mb-6">
                    Enter your details to track your complaint
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.citizenName}
                    onChange={(e) =>
                      setFormData({ ...formData, citizenName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.citizenPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        citizenPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                      })
                    }
                    maxLength={10}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use this number to track your complaint
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.citizenEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, citizenEmail: e.target.value })
                    }
                  />
                </div>

                <div>
                  <DistrictSelector
                    value={formData.districtId}
                    onChange={(value) =>
                      setFormData({ ...formData, districtId: value })
                    }
                    label="District (Optional)"
                    required={false}
                  />
                  <p className="text-sm text-blue-600 mt-1">
                    💡 If not selected, AI will detect your district automatically
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Complaint Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Describe Your Complaint</h2>
                  <p className="text-gray-600 mb-6">
                    Use text, voice, or upload an image
                  </p>
                </div>

                {/* Text Input */}
                <div>
                  <Label htmlFor="complaint">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Write Your Complaint
                  </Label>
                  <Textarea
                    id="complaint"
                    placeholder="Describe your issue in detail..."
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    rows={6}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Voice Recording */}
                <div>
                  <Label>
                    <Mic className="inline h-4 w-4 mr-1" />
                    Record Voice Complaint
                  </Label>
                  <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Button
                      type="button"
                      variant={isRecording ? 'destructive' : 'outline'}
                      onClick={handleVoiceRecord}
                      className="mb-2"
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      {isRecording ? `Stop Recording (${recordingTime}s)` : 'Start Voice Recording'}
                    </Button>
                    {isRecording && (
                      <p className="text-sm text-red-500 animate-pulse mt-2">
                        🔴 Recording... {60 - recordingTime}s remaining
                      </p>
                    )}
                    {voiceFile && !isRecording && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">
                          ✓ Voice recorded: {voiceFile.name}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 mt-1"
                          onClick={() => setVoiceFile(null)}
                        >
                          Remove recording
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Click to record your complaint using voice (max 60 seconds)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="image">
                    <Image className="inline h-4 w-4 mr-1" />
                    Upload Image
                  </Label>
                  <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Image className="mr-2 h-5 w-5" />
                          Choose Image
                        </span>
                      </Button>
                    </label>
                    {imageFile && (
                      <div className="mt-4">
                        <p className="text-sm text-green-600 mb-2">
                          ✓ Image selected: {imageFile.name}
                        </p>
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a photo of the issue (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Review Your Complaint</h2>
                  <p className="text-gray-600 mb-6">
                    Please verify all information before submitting
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{formData.citizenName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{formData.citizenPhone}</p>
                  </div>
                  {formData.citizenEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{formData.citizenEmail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-semibold">
                      {formData.districtId ? (
                        formData.districtId.split('_')[1]
                      ) : (
                        <span className="text-blue-600">
                          Will be detected by AI 🤖
                        </span>
                      )}
                    </p>
                  </div>
                  {formData.text && (
                    <div>
                      <p className="text-sm text-gray-600">Complaint Text</p>
                      <p className="mt-1">{formData.text}</p>
                    </div>
                  )}
                  {voiceFile && (
                    <div>
                      <p className="text-sm text-gray-600">Voice Recording</p>
                      <p className="text-green-600">✓ Voice file attached</p>
                    </div>
                  )}
                  {imageFile && (
                    <div>
                      <p className="text-sm text-gray-600">Image</p>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="max-h-32 rounded mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="flex-1">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  )
}
