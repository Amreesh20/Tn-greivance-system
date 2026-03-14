// src/test-api.ts
import { healthService } from './services/healthService'
import { complaintService } from './services/complaintService'

async function testAPI() {
  console.log('🧪 Testing API Connection...\n')

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...')
    const health = await healthService.check()
    console.log('✅ Health check passed:', health)

    // Test 2: Get all complaints
    console.log('\n2️⃣ Testing get all complaints...')
    const complaints = await complaintService.getAll({ limit: 5 })
    console.log('✅ Got complaints:', complaints.count, 'total')

    console.log('\n🎉 All tests passed!')
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPI()
