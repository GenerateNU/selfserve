import { Link } from '@tanstack/react-router'
import { UserButton, useAuth } from '@clerk/clerk-react'

export default function Header() {
const { isSignedIn } = useAuth(); 
  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/">
          <img src="/logo.webp" alt="SelfServe Logo" className="h-10" />
        </Link>
      </h1>
      {isSignedIn && <UserButton />}
    </header>
  )
}
