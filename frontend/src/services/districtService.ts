// src/services/districtService.ts
import api from './api'
import { District } from '@/types'

// Cache districts to avoid repeated API calls
let cachedDistricts: District[] | null = null

// All 38 Tamil Nadu districts with coordinates
const ALL_TN_DISTRICTS: District[] = [
  { id: 'TN_ARI_001', name: 'Ariyalur', tier: 'tier3', population: 754894, latitude: 11.1401, longitude: 79.0783 },
  { id: 'TN_CHG_001', name: 'Chengalpattu', tier: 'tier2', population: 2556244, latitude: 12.6819, longitude: 79.9888 },
  { id: 'TN_CHN_001', name: 'Chennai', tier: 'tier1', population: 7088000, latitude: 13.0827, longitude: 80.2707 },
  { id: 'TN_CBE_001', name: 'Coimbatore', tier: 'tier1', population: 3458045, latitude: 11.0168, longitude: 76.9558 },
  { id: 'TN_CUD_001', name: 'Cuddalore', tier: 'tier2', population: 2605914, latitude: 11.7565, longitude: 79.7647 },
  { id: 'TN_DHA_001', name: 'Dharmapuri', tier: 'tier3', population: 1506843, latitude: 12.1357, longitude: 78.1602 },
  { id: 'TN_DIN_001', name: 'Dindigul', tier: 'tier2', population: 2159775, latitude: 10.3624, longitude: 77.9695 },
  { id: 'TN_ERD_001', name: 'Erode', tier: 'tier2', population: 2251744, latitude: 11.3410, longitude: 77.7172 },
  { id: 'TN_KAL_001', name: 'Kallakurichi', tier: 'tier3', population: 1370281, latitude: 11.7400, longitude: 78.9600 },
  { id: 'TN_KAN_001', name: 'Kanchipuram', tier: 'tier2', population: 1166401, latitude: 12.8342, longitude: 79.7036 },
  { id: 'TN_KAR_001', name: 'Karur', tier: 'tier3', population: 1064493, latitude: 10.9601, longitude: 78.0766 },
  { id: 'TN_KRI_001', name: 'Krishnagiri', tier: 'tier2', population: 1879809, latitude: 12.5186, longitude: 78.2137 },
  { id: 'TN_MAD_001', name: 'Madurai', tier: 'tier1', population: 3038252, latitude: 9.9252, longitude: 78.1198 },
  { id: 'TN_MAY_001', name: 'Mayiladuthurai', tier: 'tier3', population: 918356, latitude: 11.1000, longitude: 79.6500 },
  { id: 'TN_NAG_001', name: 'Nagapattinam', tier: 'tier3', population: 1614069, latitude: 10.7672, longitude: 79.8449 },
  { id: 'TN_NAM_001', name: 'Namakkal', tier: 'tier2', population: 1726601, latitude: 11.2189, longitude: 78.1674 },
  { id: 'TN_NIL_001', name: 'Nilgiris', tier: 'tier3', population: 735394, latitude: 11.4916, longitude: 76.7337 },
  { id: 'TN_PER_001', name: 'Perambalur', tier: 'tier3', population: 565223, latitude: 11.2320, longitude: 78.8810 },
  { id: 'TN_PUD_001', name: 'Pudukkottai', tier: 'tier2', population: 1618345, latitude: 10.3833, longitude: 78.8001 },
  { id: 'TN_RAM_001', name: 'Ramanathapuram', tier: 'tier3', population: 1353445, latitude: 9.3639, longitude: 78.8395 },
  { id: 'TN_RAN_001', name: 'Ranipet', tier: 'tier3', population: 1210277, latitude: 12.9224, longitude: 79.3209 },
  { id: 'TN_SLM_001', name: 'Salem', tier: 'tier1', population: 3482056, latitude: 11.6643, longitude: 78.1460 },
  { id: 'TN_SIV_001', name: 'Sivaganga', tier: 'tier3', population: 1339101, latitude: 9.8477, longitude: 78.4815 },
  { id: 'TN_TEN_001', name: 'Tenkasi', tier: 'tier3', population: 1407627, latitude: 8.9594, longitude: 77.3161 },
  { id: 'TN_TNJ_001', name: 'Thanjavur', tier: 'tier2', population: 2405890, latitude: 10.7870, longitude: 79.1378 },
  { id: 'TN_THE_001', name: 'Theni', tier: 'tier3', population: 1245899, latitude: 10.0104, longitude: 77.4768 },
  { id: 'TN_TRP_001', name: 'Thoothukudi', tier: 'tier2', population: 1750176, latitude: 8.8061, longitude: 78.1364 },
  { id: 'TN_TRY_001', name: 'Tiruchirappalli', tier: 'tier1', population: 2722290, latitude: 10.7905, longitude: 78.7047 },
  { id: 'TN_TIR_001', name: 'Tirunelveli', tier: 'tier1', population: 1665253, latitude: 8.7139, longitude: 77.7567 },
  { id: 'TN_TIP_001', name: 'Tirupathur', tier: 'tier3', population: 1111812, latitude: 12.4960, longitude: 78.5730 },
  { id: 'TN_TPR_001', name: 'Tiruppur', tier: 'tier2', population: 2479052, latitude: 11.1085, longitude: 77.3411 },
  { id: 'TN_TVL_001', name: 'Tiruvallur', tier: 'tier1', population: 3728104, latitude: 13.1431, longitude: 79.9086 },
  { id: 'TN_TVR_001', name: 'Tiruvannamalai', tier: 'tier2', population: 2464875, latitude: 12.2253, longitude: 79.0747 },
  { id: 'TN_TVN_001', name: 'Tiruvarur', tier: 'tier3', population: 1264277, latitude: 10.7661, longitude: 79.6344 },
  { id: 'TN_VEL_001', name: 'Vellore', tier: 'tier2', population: 1614242, latitude: 12.9165, longitude: 79.1325 },
  { id: 'TN_VIL_001', name: 'Viluppuram', tier: 'tier2', population: 2093003, latitude: 11.9401, longitude: 79.4861 },
  { id: 'TN_VIR_001', name: 'Virudhunagar', tier: 'tier2', population: 1942288, latitude: 9.5680, longitude: 77.9624 },
  { id: 'TN_TUP_001', name: 'Tuticorin', tier: 'tier2', population: 1750176, latitude: 8.7642, longitude: 78.1348 },
]

export const districtService = {
  /**
   * Get all districts from backend API
   * Falls back to hardcoded list if API fails
   */
  async getAll(): Promise<District[]> {
    // Return cached data if available
    if (cachedDistricts) {
      return cachedDistricts
    }

    try {
      const response: any = await api.get('/districts')
      if (response.success && response.data) {
        cachedDistricts = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Failed to fetch districts from API, using fallback data:', error)
    }

    // Fallback to all 38 Tamil Nadu districts
    cachedDistricts = ALL_TN_DISTRICTS
    return ALL_TN_DISTRICTS
  },

  /**
   * Get district by ID
   */
  async getById(id: string): Promise<District | undefined> {
    const districts = await this.getAll()
    return districts.find(d => d.id === id)
  },

  /**
   * Get districts by tier
   */
  async getByTier(tier: 'tier1' | 'tier2' | 'tier3'): Promise<District[]> {
    const districts = await this.getAll()
    return districts.filter(d => d.tier === tier)
  },

  /**
   * Search districts by name
   */
  async searchByName(query: string): Promise<District[]> {
    const districts = await this.getAll()
    const lowerQuery = query.toLowerCase()
    return districts.filter(d => d.name.toLowerCase().includes(lowerQuery))
  },

  /**
   * Clear cached districts (useful after updates)
   */
  clearCache() {
    cachedDistricts = null
  }
}

export default districtService
