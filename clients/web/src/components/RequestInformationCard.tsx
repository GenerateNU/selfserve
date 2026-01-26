import type { Request } from "../routes/requests";

interface RequestInformationCardProps {
  request: Request;
}

export default function RequestInformationCard({ request }: RequestInformationCardProps) {
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
}