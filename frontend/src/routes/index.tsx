import { createFileRoute } from '@tanstack/react-router'
import { Route as RouteIcon, Shield, Sparkles, Zap } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/logosquare.webp"
              alt="SelfServe Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-black">
              <span className="text-white">SelfServe Frontend</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            React + TanStack Start
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://tanstack.com/start/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              TanStack Start Docs
            </a>
            <p className="text-gray-400 text-sm mt-2">
              Get started by editing{' '}
              <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">
                /src/routes/index.tsx
              </code>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
