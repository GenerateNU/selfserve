import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import RequestInformationCard from '@/components/RequestInformationCard'
import { useRequests } from '@/hooks/useRequests'

export const Route = createFileRoute('/requests')({
  component: KanbanBoard,
})

export interface Request {
  id: string
  created_at: string
  updated_at: string
  hotel_id: string
  guest_id?: string | null
  user_id?: string | null
  reservation_id?: string | null
  name: string
  description?: string | null
  room_id?: string | null
  request_category?: string | null
  request_type: string
  department?: string | null
  status: string
  priority: string
  estimated_completion_time?: number | null
  scheduled_time?: string | null
  completed_at?: string | null
  notes?: string | null
}

const STATUSES = [
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
]

// Creates the Kanban Column and loads cards using the intersection observer pattern
const KanbanColumn = ({
  status,
}: {
  status: { id: string; label: string }
}) => {
  const { requests, loadMore, hasMore } = useRequests(status.id)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, hasMore])

  useEffect(() => {
    loadMore()
  }, [])

  return (
    <div className="w-[300px] bg-gray-100 p-4 rounded-lg h-full overflow-auto">
      <h2 className="mb-4 text-lg font-bold">{status.label}</h2>

      {requests.length === 0 ? (
        <div className="text-center p-5 text-gray-400">No requests</div>
      ) : (
        <>
          {requests.map((request) => (
            <RequestInformationCard key={request.id} request={request} />
          ))}

          {hasMore && (
            <div ref={observerTarget} className="text-center p-2.5" />
          )}

          {!hasMore && (
            <div className="text-center p-2.5 text-gray-400">
              No more requests
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KanbanBoard() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-5 bg-white border-b border-gray-300">
        <h1 className="text-2xl font-bold">Request Management</h1>
        <p className="text-gray-600">Track and manage requests</p>
      </div>

      <div className="flex-1 flex gap-4 p-5 overflow-auto bg-gray-200">
        {STATUSES.map((status) => (
          <KanbanColumn key={status.id} status={status} />
        ))}
      </div>
    </div>
  )
}
