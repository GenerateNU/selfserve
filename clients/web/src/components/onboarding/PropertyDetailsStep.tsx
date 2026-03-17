import LeftPanel from './LeftPanel'
import type { OnboardingFormData } from './types'

interface PropertyDetailsStepProps {
  formData: OnboardingFormData
  updateForm: (updates: Partial<OnboardingFormData>) => void
  onNext: () => void
  onBack: () => void
}

const PROPERTY_TYPES = ['Hotel', 'Motel', 'Resort', 'Bed & Breakfast', 'Hostel']

export default function PropertyDetailsStep({ formData, updateForm, onNext, onBack }: PropertyDetailsStepProps) {
  const isValid = formData.hotelName && formData.numberOfRooms && formData.propertyType

  return (
    <div className="flex flex-row w-[1371px] h-[982px]">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-[881px] border border-[#000000] bg-white flex items-center justify-center">
        {/* Card */}
        <div
          className="bg-[#FFFFFF] border border-[#000000] flex flex-col"
          style={{ width: '662.6px', height: '705px', borderRadius: '24px', padding: '48px', gap: '24px' ,paddingTop: '150px'}}
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 style={{
              fontFamily: 'Satoshi Variable',
              fontWeight: 400,
              fontSize: '24px',
              lineHeight: '32px',
              color: '#0F172B',
              textAlign: 'center',
            }}>
              Property Details
            </h1>
            <p style={{
              fontFamily: 'Satoshi Variable',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#62748E',
              textAlign: 'center',
            }}>
              Lorem ipsum dolor sit amet.
            </p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4"
              style={{ width: '256.6796875px', height: '254px', gap: '16px',padding: '12px 16px 12px 16px', alignSelf: 'center' }}
>
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'Satoshi Variable', fontSize: '14px', color: '#0F172B' }}>
                Hotel Name
              </label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={e => updateForm({ hotelName: e.target.value })}
                placeholder="Lorem ipsum dolor sit amet"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'Satoshi Variable', fontSize: '14px', color: '#0F172B' }}>
                Number of Rooms
              </label>
              <input
                type="number"
                value={formData.numberOfRooms}
                onChange={e => updateForm({ numberOfRooms: e.target.value })}
                placeholder="e.g. 150"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'Satoshi Variable', fontSize: '14px', color: '#0F172B' }}>
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={e => updateForm({ propertyType: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-900 bg-white"
              >
                <option value="">Select a type</option>
                {PROPERTY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onNext}
              disabled={!isValid}
              className="w-full bg-green-900 hover:bg-green-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
              style={{ height: '56px', width: '256.6796875px', borderRadius: '14px', alignSelf: 'center' }}
            >
              Continue
            </button>
            <button
              onClick={onBack}
              className="text-sm text-center"
              style={{ color: '#62748E' }}
            >
              ‹ Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}