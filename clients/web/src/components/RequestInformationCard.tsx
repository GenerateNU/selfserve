import type { Request } from '../routes/requests'

/**
 * This interface displays a neatly ordered card with Request information on it.
 * Specifically
 * - Request name
 * - Priority
 * - Category
 *
 * can add more information later, but to start lets use this
 */
interface RequestInformationCardProps {
  request: Request
}

export default function RequestInformationCard({
  request,
}: RequestInformationCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '12px',
        marginBottom: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
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
  )
}
