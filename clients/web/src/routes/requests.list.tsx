import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateRequest, useGetAllRequests } from '@shared/hooks/use-requests'
import type { MakeRequest, Request } from '@shared/types/request.types'

export const Route = createFileRoute('/requests/list')({
  component: RequestsListPage,
})

function RequestsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: requests, isLoading, error, refetch } = useGetAllRequests()
  const createRequestMutation = useCreateRequest()

  const handleCreateRequest = async () => {
    // TODO: Replace hardcoded values with form inputs
    const newRequest: MakeRequest = {
      hotel_id: '521e8400-e458-41d4-a716-446655440000',
      name: 'Room Cleaning',
      description: 'Please clean room 504',
      request_type: 'one-time',
      status: 'pending',
      priority: 'medium',
      request_category: 'Housekeeping',
      department: 'Housekeeping',
    }

    try {
      await createRequestMutation.mutateAsync(newRequest)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to create request:', err)
    }
  }

  return (
    <div className="min-h-screen bg-white p-12">
      <div className="max-w-6xl mx-auto">
        {/* Create Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium mb-8"
        >
          Create Request
        </button>

        {/* Request List */}
        <div className="space-y-6">
          {isLoading && (
            <div className="border-2 border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-600">Loading requests...</p>
            </div>
          )}

          {error && (
            <div className="border-2 border-red-300 rounded-lg p-8 text-center bg-red-50">
              <p className="text-red-600 font-semibold mb-2">
                Failed to load requests: {error.message}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && requests && requests.length === 0 && (
            <div className="border-2 border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-600">
                No requests yet. Create your first request!
              </p>
            </div>
          )}

          {requests && requests.length > 0 && (
            <>
              {requests.map((request: Request) => (
                <div
                  key={request.id}
                  className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-gray-400 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {request.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {request.description && (
                    <p className="text-gray-700 mb-4">{request.description}</p>
                  )}

                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      Type:{' '}
                      <span className="font-medium text-gray-900">
                        {request.request_type}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Status:{' '}
                      <span className="font-medium text-gray-900">
                        {request.status}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Priority:{' '}
                      <span className="font-medium text-gray-900">
                        {request.priority}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Request
              </h2>
              <p className="text-gray-600 mb-6">
                Creating a new request with default values
              </p>

              <div className="bg-gray-50 rounded-lg p-5 mb-6 space-y-3 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900 font-medium">
                    Room Cleaning
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-gray-900 font-medium">
                    Clean room 504
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900 font-medium">One-time</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-gray-900 font-medium">Pending</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Priority:</span>
                  <span className="text-gray-900 font-medium">Medium</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateRequest}
                  disabled={createRequestMutation.isPending}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {createRequestMutation.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={createRequestMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>

              {createRequestMutation.isError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">
                    {createRequestMutation.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
