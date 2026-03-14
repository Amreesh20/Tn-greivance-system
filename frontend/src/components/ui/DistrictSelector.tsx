import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Label } from "./label"
import { districtService } from '@/services/districtService'
import { District } from '@/types'

// All 38 Tamil Nadu districts (fallback)
export const TN_DISTRICTS = [
  { id: 'TN_ARI_001', name: 'Ariyalur' },
  { id: 'TN_CHG_001', name: 'Chengalpattu' },
  { id: 'TN_CHN_001', name: 'Chennai' },
  { id: 'TN_CBE_001', name: 'Coimbatore' },
  { id: 'TN_CUD_001', name: 'Cuddalore' },
  { id: 'TN_DHA_001', name: 'Dharmapuri' },
  { id: 'TN_DIN_001', name: 'Dindigul' },
  { id: 'TN_ERD_001', name: 'Erode' },
  { id: 'TN_KAL_001', name: 'Kallakurichi' },
  { id: 'TN_KAN_001', name: 'Kanchipuram' },
  { id: 'TN_KAR_001', name: 'Karur' },
  { id: 'TN_KRI_001', name: 'Krishnagiri' },
  { id: 'TN_MAD_001', name: 'Madurai' },
  { id: 'TN_MAY_001', name: 'Mayiladuthurai' },
  { id: 'TN_NAG_001', name: 'Nagapattinam' },
  { id: 'TN_NAM_001', name: 'Namakkal' },
  { id: 'TN_NIL_001', name: 'Nilgiris' },
  { id: 'TN_PER_001', name: 'Perambalur' },
  { id: 'TN_PUD_001', name: 'Pudukkottai' },
  { id: 'TN_RAM_001', name: 'Ramanathapuram' },
  { id: 'TN_RAN_001', name: 'Ranipet' },
  { id: 'TN_SLM_001', name: 'Salem' },
  { id: 'TN_SIV_001', name: 'Sivaganga' },
  { id: 'TN_TEN_001', name: 'Tenkasi' },
  { id: 'TN_TNJ_001', name: 'Thanjavur' },
  { id: 'TN_THE_001', name: 'Theni' },
  { id: 'TN_TRP_001', name: 'Thoothukudi' },
  { id: 'TN_TRY_001', name: 'Tiruchirappalli' },
  { id: 'TN_TIR_001', name: 'Tirunelveli' },
  { id: 'TN_TIP_001', name: 'Tirupathur' },
  { id: 'TN_TPR_001', name: 'Tiruppur' },
  { id: 'TN_TVL_001', name: 'Tiruvallur' },
  { id: 'TN_TVR_001', name: 'Tiruvannamalai' },
  { id: 'TN_TVN_001', name: 'Tiruvarur' },
  { id: 'TN_VEL_001', name: 'Vellore' },
  { id: 'TN_VIL_001', name: 'Viluppuram' },
  { id: 'TN_VIR_001', name: 'Virudhunagar' },
  { id: 'TN_TUP_001', name: 'Tuticorin' },
]

interface DistrictSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export function DistrictSelector({
  value,
  onChange,
  label = "Select District",
  required = false
}: DistrictSelectorProps) {
  const [districts, setDistricts] = useState<District[]>(TN_DISTRICTS as any)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadDistricts = async () => {
      setLoading(true)
      try {
        const data = await districtService.getAll()
        if (data.length > 0) {
          setDistricts(data)
        }
      } catch (error) {
        console.warn('Using fallback districts')
      } finally {
        setLoading(false)
      }
    }
    loadDistricts()
  }, [])

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading districts..." : "Choose your district (optional)"} />
        </SelectTrigger>
        <SelectContent>
          {districts.map((district) => (
            <SelectItem key={district.id} value={district.id}>
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!required && (
        <p className="text-xs text-gray-500">
          Leave empty for AI auto-detection
        </p>
      )}
    </div>
  )
}
