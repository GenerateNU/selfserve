import { Link } from '@tanstack/react-router'

export default function Header() {
  console.log('import.meta.env:', import.meta.env)
console.log('process.env:', process.env)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('API_BASE_URL:', process.env.API_BASE_URL)
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
