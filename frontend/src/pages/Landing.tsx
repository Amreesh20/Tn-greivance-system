// src/pages/Landing.tsx
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  Brain,
  Shield,
  Smartphone,
  TrendingUp 
} from 'lucide-react'
import { motion } from 'framer-motion'

export function Landing() {
  const navigate = useNavigate()

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section background="gradient" padding="xl" className="text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Voice, Our Priority
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            AI-powered grievance redressal system for Tamil Nadu citizens
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/submit')}
              className="text-lg px-8 py-6"
            >
              <FileText className="mr-2 h-5 w-5" />
              Register Complaint
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/track')}
              className="text-lg px-8 py-6 bg-white/10 border-white text-white hover:bg-white hover:text-tn-blue"
            >
              <Search className="mr-2 h-5 w-5" />
              Track Complaint
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* Stats Section */}
      <Section padding="lg" background="white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-tn-blue mb-2">2.5L+</h3>
            <p className="text-gray-600">Complaints Resolved</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-tn-blue mb-2">48 Hrs</h3>
            <p className="text-gray-600">Average Resolution Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold text-tn-blue mb-2">94%</h3>
            <p className="text-gray-600">Citizen Satisfaction</p>
          </motion.div>
        </div>
      </Section>

      {/* Features Section */}
      <Section padding="xl" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose TN Grievance Portal?
          </h2>
          <p className="text-xl text-gray-600">
            Modern technology meets citizen service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Brain}
            title="AI-Powered"
            description="Automatic complaint classification and priority assignment using machine learning"
          />
          <FeatureCard
            icon={Smartphone}
            title="Easy Access"
            description="Submit complaints via text, voice, or image - no registration required"
          />
          <FeatureCard
            icon={Shield}
            title="Secure & Private"
            description="Your data is protected with enterprise-grade security"
          />
          <FeatureCard
            icon={Clock}
            title="Fast Response"
            description="Track your complaint in real-time with SLA-based deadlines"
          />
        </div>
      </Section>

      {/* How It Works */}
      <Section padding="xl" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple process, powerful results
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <StepCard
              number={1}
              title="Submit Your Complaint"
              description="Describe your issue through text, voice, or upload an image"
            />
            <StepCard
              number={2}
              title="AI Analysis"
              description="Our AI automatically classifies, prioritizes, and routes your complaint"
            />
            <StepCard
              number={3}
              title="Officer Assignment"
              description="Complaint is assigned to the relevant department officer"
            />
            <StepCard
              number={4}
              title="Track & Resolve"
              description="Monitor progress and get notified when your issue is resolved"
            />
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section padding="xl" background="blue">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Have a Grievance? We're Here to Help
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Tamil Nadu citizens who have successfully resolved their issues through our platform
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/submit')}
            className="text-lg px-8 py-6"
          >
            Get Started Now
          </Button>
        </div>
      </Section>
    </PageLayout>
  )
}

function FeatureCard({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tn-blue text-white mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title, description }: {
  number: number
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className="flex gap-6 items-start"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-tn-blue text-white flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}
