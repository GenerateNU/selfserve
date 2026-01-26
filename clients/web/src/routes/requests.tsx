import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { timeoutManager } from '@tanstack/react-query';

export const Route = createFileRoute("/requests")({
  component: KanbanBoard
});

// Types matching Go backend
interface Request {
  id: string;
  created_at: string;
  updated_at: string;
  hotel_id: string;
  guest_id?: string | null;
  user_id?: string | null;
  reservation_id?: string | null;
  name: string;
  description?: string | null;
  room_id?: string | null;
  request_category?: string | null;
  request_type: string;
  department?: string | null;
  status: string;
  priority: string;
  estimated_completion_time?: number | null;
  scheduled_time?: string | null;
  completed_at?: string | null;
  notes?: string | null;
}

const fetchRequests = async (status: string, cursor: string | null = null, limit: number = 10) => {

    // so you can see my loading wheel
    await new Promise(resolve => setTimeout(resolve, 1000));
  const startId = cursor ? parseInt(cursor) : 0;
  const requests: Request[] = Array.from({ length: limit }, (_, i) => ({
    id: i.toString(),
    created_at: Date.now().toString(),
    updated_at: Date.now().toString(),
    hotel_id: "1",
    name: `Request ${startId + i + 1}`,
    description: `Description for ${status} request ${startId + i + 1}`,
    request_category: ['Cleaning', 'Maintenance', 'Room Service', 'Concierge'][i % 4],
    request_type: ['recurring', 'one-time', 'urgent'][i % 3],
    department: ['housekeeping', 'maintenance', 'front-desk'][i % 3],
    status,
    priority: ['low', 'medium', 'high', 'urgent'][i % 4],
  }));

  // Simulate end of data after 50 items
  const hasMore: boolean = startId + limit < 50;
  const nextCursor: string | null = hasMore ? `${startId + limit}` : null;
  
  return {
    data: requests,
    nextCursor,
    hasMore,
  };
};

const STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-gray-100' },
  { id: 'assigned', label: 'Assigned', color: 'bg-blue-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-100' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100' },
];

const RequestCard = ({ request }: { request: Request }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{request.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(request.priority)}`}>
          {request.priority}
        </span>
      </div>
      
      {request.description && (
        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
      )}
      
      <div className="space-y-2 text-xs text-gray-500">
        {request.request_category && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Category:</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{request.request_category}</span>
          </div>
        )}
        
        {request.department && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Department:</span>
            <span>{request.department}</span>
          </div>
        )}
        
        {request.room_id && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Room:</span>
            <span className="font-mono text-xs">{request.room_id.slice(-8)}</span>
          </div>
        )}
        
        {request.estimated_completion_time && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Est. Time:</span>
            <span>{request.estimated_completion_time} min</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
          {request.scheduled_time && (
            <span className="text-xs text-blue-600">
              Scheduled: {new Date(request.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ status }: { status: { id: string; label: string; color: string } }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await fetchRequests(status.id, cursor);
      setRequests(prev => [...prev, ...result.data]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [status.id, cursor, hasMore, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div className="flex flex-col h-full min-w-[300px] w-full">
      <div className={`${status.color} p-4 rounded-t-lg border-b-2 border-gray-300`}>
        <h2 className="font-bold text-gray-800 text-lg">
          {status.label}
          <span className="ml-2 text-sm font-normal text-gray-600">
            ({requests.length}{!hasMore ? '' : '+'})
          </span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
        {isInitialLoad ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium">No requests</p>
          </div>
        ) : (
          <>
            {requests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
            
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-4">
                {isLoading && (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                )}
              </div>
            )}
            
            {!hasMore && requests.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-400">
                No more requests
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function KanbanBoard() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage requests across different stages</p>
      </header>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {STATUSES.map(status => (
            <KanbanColumn key={status.id} status={status} />
          ))}
        </div>
      </div>
    </div>
  );
}