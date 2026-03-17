import LeftPanel from './LeftPanel'
import { OnboardingFormData } from './types'

interface RoleSelectionStepProps {
  formData: OnboardingFormData
  updateForm: (updates: Partial<OnboardingFormData>) => void
  onNext: (role: string) => void
}

const ROLES = [
  { id: 'manager', label: 'Manager', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 'employee', label: 'Employee', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
]

export default function RoleSelectionStep({ formData, onNext }: RoleSelectionStepProps) {
  return (
    <div className="flex flex-row w-[1371px] h-[982px]">
      <LeftPanel />

      {/* Right panel */}
      <div
        className="w-[881px] border border-[#000000] bg-white flex items-center justify-center"
      >
        {/* Outer card */}
        <div
          className="bg-[#FFFFFF] border border-[#000000] flex flex-col items-center"
          style={{ width: '642.6px', height: '492px', borderRadius: '24px', padding: '48px 38px', gap: '24px' }}
        >
          {/* Logo placeholder */}
          <div
            className="border border-[#000000] bg-[#FFFFFF] shrink-0"
            style={{ width: '80px', height: '80px', borderRadius: '8px' }}
          />

          {/* Role title */}
          <span style={{
            fontFamily: 'Satoshi Variable',
            fontWeight: 400,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '0.07px',
            color: '#0F172B',
            textAlign: 'center',
          }}>
            Role
          </span>

          {/* Subtitle */}
          <span style={{
            fontFamily: 'Satoshi Variable',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#62748E',
            textAlign: 'center',
            marginTop: '-16px',
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </span>

          {/* Role cards grid */}
          <div
            className="grid w-full"
            style={{
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => onNext(role.id)}
                className="text-left bg-[#FFFFFF]"
                style={{
                  height: '184px',
                  borderRadius: '16px',
                  border: `2px solid ${formData.role === role.id ? '#0F172B' : '#F1F5F9'}`,
                  padding: '16px',
                }}
              >
                <div style={{
                  fontFamily: 'Satoshi Variable',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '-0.31px',
                  color: '#0F172B',
                }}>
                  {role.label}
                </div>
                <div style={{
                  fontFamily: 'Satoshi Variable',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '-0.31px',
                  color: '#62748E',
                  marginTop: '0.5px',
                }}>
                  {role.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}