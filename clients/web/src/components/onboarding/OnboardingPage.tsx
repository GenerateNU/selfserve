import { useState } from 'react'
import WelcomeStep from './WelcomeStep'
import RoleSelectionStep from './RoleSelectionStep'
import EmployeeRoleStep from './EmployeeRoleStep'
import PropertyDetailsStep from './PropertyDetailsStep'
import InviteTeamStep from './InviteTeamStep'
import type { OnboardingFormData } from './types'

const INITIAL_FORM_DATA: OnboardingFormData = {
  role: null,
  employeeRole: null,
  hotelName: '',
  numberOfRooms: '',
  propertyType: '',
  inviteEmail: '',
}

type Step = 'welcome' | 'role' | 'employeeRole' | 'propertyDetails' | 'inviteTeam'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)

  const updateForm = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleRoleSelected = (role: string) => {
    updateForm({ role })
    if (role === 'employee') {
      setCurrentStep('employeeRole')
    } else {
      setCurrentStep('propertyDetails')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={() => setCurrentStep('role')} />
      case 'role':
        return (
          <RoleSelectionStep
            formData={formData}
            updateForm={updateForm}
            onNext={handleRoleSelected}
          />
        )
      case 'employeeRole':
        return (
          <EmployeeRoleStep
            formData={formData}
            updateForm={updateForm}
            onNext={() => setCurrentStep('propertyDetails')}
            onBack={() => setCurrentStep('role')}
          />
        )
      case 'propertyDetails':
        return (
          <PropertyDetailsStep
            formData={formData}
            updateForm={updateForm}
            onNext={() => setCurrentStep('inviteTeam')}
            onBack={() => setCurrentStep(formData.role === 'employee' ? 'employeeRole' : 'role')}
          />
        )
      case 'inviteTeam':
        return (
          <InviteTeamStep
            formData={formData}
            updateForm={updateForm}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {renderStep()}
    </div>
  )
}