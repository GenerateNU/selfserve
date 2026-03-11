import { createFileRoute } from '@tanstack/react-router'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { SideBarWithContent } from '@/components/SideBarWithContent'

export const Route = createFileRoute('/_protected')({
  component: () => (
    <>
      <SignedIn>
        <SideBarWithContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  ),
})
