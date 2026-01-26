import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useGetHelloName } from '../../api/hello'

export const Route = createFileRoute('/_protected/test-api')({ component: TestApi })

function TestApi() {
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const { data, isLoading, error, refetch } = useGetHelloName(submittedName)

  const handleSubmitName = (name: string) => {
    setSubmittedName(name)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitName(name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">API Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Test Hello Endpoint
          </h2>
          <p className="text-gray-400 mb-6">
            Test the shared API client by calling GET /api/v1/hello/:name
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Enter your name:
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lebron James"
                className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Loading...' : 'Call API'}
            </button>
          </form>

          {/* Results Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Response:</h3>

            {!submittedName && (
              <p className="text-gray-400 italic">
                Enter a name and click "Call API" to test the endpoint
              </p>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                <span>Fetching data...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 font-semibold">Error:</p>
                <p className="text-red-300 mt-1">{error.message}</p>
                {error.status !== 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    Status: {error.status}
                  </p>
                )}
              </div>
            )}

            {data !== undefined && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-semibold mb-2">Success! 🎉</p>
                <p className="text-white text-lg font-mono bg-slate-700 px-3 py-2 rounded">
                  {data}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 underline"
                >
                  Refetch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
