import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-up')({
  component: () => <SignUp fallbackRedirectUrl="/home" />,
})
