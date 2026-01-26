import { useState, useRef, useCallback, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/requests")({
  component: KanbanBoard
});

export interface Request {
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

  const hasMore: boolean = startId + limit < 50;
  const nextCursor: string | null = hasMore ? `${startId + limit}` : null;
  
  return {
    data: requests,
    nextCursor,
    hasMore,
  };
};

const STATUSES = [
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

const RequestCard = ({ request }: { request: Request }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '12px',
      marginBottom: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {request.name}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        {request.description}
      </div>
      {request.request_category && (
        <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
          Category: {request.request_category}
        </div>
      )}
      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
        Priority: {request.priority}
      </div>
    </div>
  );
};

const KanbanColumn = ({ status }: { status: { id: string; label: string } }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
    }
  }, [status.id, cursor, hasMore, isLoading]);

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

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div style={{
      width: '300px',
      backgroundColor: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
      height: '100%',
      overflow: 'auto'
    }}>
      <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        {status.label}
      </h2>
      
      {isLoading && requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          No requests
        </div>
      ) : (
        <>
          {requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          
          {hasMore && (
            <div ref={observerTarget} style={{ textAlign: 'center', padding: '10px' }}>
              {isLoading && 'Loading more...'}
            </div>
          )}
          
          {!hasMore && (
            <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
              No more requests
            </div>
          )}
        </>
      )}
    </div>
  );
};

function KanbanBoard() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Request Management</h1>
        <p style={{ color: '#666' }}>Track and manage requests</p>
      </div>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '16px', 
        padding: '20px', 
        overflow: 'auto',
        backgroundColor: '#e5e5e5'
      }}>
        {STATUSES.map(status => (
          <KanbanColumn key={status.id} status={status} />
        ))}
      </div>
    </div>
  );
}