import { createFileRoute } from '@tanstack/react-router'
import OnboardingPage from '../components/onboarding/OnboardingPage'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})
