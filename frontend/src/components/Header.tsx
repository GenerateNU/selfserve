import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/">
          <img src="/logo.webp" alt="SelfServe Logo" className="h-10" />
        </Link>
      </h1>
    </header>
  )
}
