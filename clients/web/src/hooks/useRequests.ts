import { useCallback, useState } from 'react'
import type { Request } from '../routes/requests'

interface FetchRequestsResponse {
  requests: Request[]
  next_cursor: string
}

const INITIAL_CURSOR = '00000000-0000-0000-0000-000000000000'
const API_BASE_URL = 'http://localhost:8080'

export const fetchRequests = async (
  status: string,
  cursor: string | null = null,
): Promise<{
  data: Request[]
  nextCursor: string | null
  hasMore: boolean
}> => {
  const cursorToUse = cursor || INITIAL_CURSOR
  const response = await fetch(
    `${API_BASE_URL}/api/v1/request/cursor/${cursorToUse}?status=${status}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch requests')
  }

  const result: FetchRequestsResponse = await response.json()

  return {
    data: result.requests || [],
    nextCursor: result.next_cursor || null,
    hasMore: !!result.next_cursor,
  }
}

export const useRequests = (status: string) => {
  const [requests, setRequests] = useState<Request[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    if (!hasMore) return

    try {
      const result = await fetchRequests(status, cursor)
      setRequests((prev) => [...prev, ...result.data])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }, [status, cursor, hasMore])

  return {
    requests,
    loadMore,
    hasMore,
  }
}
