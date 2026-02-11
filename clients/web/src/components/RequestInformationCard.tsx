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
    <div className="bg-white p-3 mb-2 border border-gray-300 rounded">
      <div className="font-bold mb-1">{request.name}</div>
      <div className="text-sm text-gray-600">{request.description}</div>
      {request.request_category && (
        <div className="text-xs text-gray-500 mt-2">
          Category: {request.request_category}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        Priority: {request.priority}
      </div>
    </div>
  )
}
