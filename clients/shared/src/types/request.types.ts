export interface MakeRequest {
  hotel_id: string
  guest_id?: string
  user_id?: string
  reservation_id?: string
  name: string
  description?: string
  room_id?: string
  request_category?: string
  request_type: string
  department?: string
  status: string
  priority: string
  estimated_completion_time?: number
  scheduled_time?: string
  completed_at?: string
  notes?: string
}

export interface Request {
  id: string
  created_at: string
  updated_at: string
  hotel_id: string
  guest_id?: string
  user_id?: string
  reservation_id?: string
  name: string
  description?: string
  room_id?: string
  request_category?: string
  request_type: string
  department?: string
  status: string
  priority: string
  estimated_completion_time?: number
  scheduled_time?: string
  completed_at?: string
  notes?: string
}
