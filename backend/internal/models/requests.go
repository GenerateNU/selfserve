package models

import "time"

type RequestFeedSort string

const (
	SortByPriority RequestFeedSort = "priority"
	SortByNewest   RequestFeedSort = "newest"
	SortByOldest   RequestFeedSort = "oldest"
)

func (s RequestFeedSort) IsValid() bool {
	switch s {
	case SortByPriority, SortByNewest, SortByOldest:
		return true
	}
	return false
}

type RequestStatus string

const (
	StatusPending    RequestStatus = "pending"
	StatusInProgress RequestStatus = "in progress"
	StatusCompleted  RequestStatus = "completed"
	StatusArchived   RequestStatus = "archived"
)

func (s RequestStatus) IsValid() bool {
	switch s {
	case StatusPending, StatusInProgress, StatusCompleted, StatusArchived:
		return true
	}
	return false
}

type RequestPriority string

const (
	PriorityLow    RequestPriority = "low"
	PriorityMedium RequestPriority = "medium"
	PriorityHigh   RequestPriority = "high"
)

func (p RequestPriority) IsValid() bool {
	switch p {
	case PriorityLow, PriorityMedium, PriorityHigh:
		return true
	}
	return false
}

// pointer fields are for easy handling of optional fields

// for post because the ID and timestamps should always be generated
type MakeRequest struct {
	HotelID                 string     `json:"hotel_id" validate:"notblank,startswith=org_" example:"org_521e8400-e458-41d4-a716-446655440000"`
	GuestID                 *string    `json:"guest_id" validate:"omitempty,uuid" example:"521e8417-e458-41d4-a716-446655440990"`
	UserID                  *string    `json:"user_id" example:"521ee400-e458-41d4-a716-446655440000"`
	ReservationID           *string    `json:"reservation_id" example:"521e8400-e458-41d4-a716-498655440000"`
	Name                    string     `json:"name" validate:"notblank" example:"room cleaning"`
	Description             *string    `json:"description" example:"clean 504"`
	RoomID                  *string    `json:"room_id" example:"521e8422-e458-41d4-a716-446655440000"`
	RequestCategory         *string    `json:"request_category" example:"Cleaning"`
	RequestType             string     `json:"request_type" validate:"notblank" example:"recurring"`
	Department              *string    `json:"department" example:"maintenance"`
	Status                  string     `json:"status" validate:"oneof='pending' 'in progress' 'completed' 'archived'" example:"pending"`
	Priority                string     `json:"priority" validate:"oneof=low medium high" example:"high"`
	EstimatedCompletionTime *int       `json:"estimated_completion_time" example:"30"`
	ScheduledTime           *time.Time `json:"scheduled_time" example:"2024-01-01T00:00:00Z"`
	CompletedAt             *time.Time `json:"completed_at" example:"2024-01-01T00:30:00Z"`
	Notes                   *string    `json:"notes" example:"No special requests"`
} //@name MakeRequest

// RequestUpdateInput is the body for PUT /request/:id — all fields are optional.
// Only non-nil fields are applied; the rest are copied from the current version.
type RequestUpdateInput struct {
	Unassign                bool       `json:"unassign"`
	UserID                  *string    `json:"user_id"`
	GuestID                 *string    `json:"guest_id"`
	ReservationID           *string    `json:"reservation_id"`
	Name                    *string    `json:"name" validate:"omitempty,notblank"`
	Description             *string    `json:"description"`
	RoomID                  *string    `json:"room_id"`
	RequestCategory         *string    `json:"request_category"`
	RequestType             *string    `json:"request_type" validate:"omitempty,notblank"`
	Department              *string    `json:"department"`
	Status                  *string    `json:"status" validate:"omitempty,oneof='pending' 'in progress' 'completed' 'archived'"`
	Priority                *string    `json:"priority" validate:"omitempty,oneof=low medium high"`
	EstimatedCompletionTime *int       `json:"estimated_completion_time"`
	ScheduledTime           *time.Time `json:"scheduled_time"`
	CompletedAt             *time.Time `json:"completed_at"`
	Notes                   *string    `json:"notes"`
} //@name RequestUpdateInput

// AssignRequestInput is the body for POST /request/:id/assign.
// Set assign_to_self to true to assign to the authenticated caller.
// Omit assign_to_self (or set to false) and provide user_id to assign to another user.
type AssignRequestInput struct {
	AssignToSelf *bool   `json:"assign_to_self"`
	UserID       *string `json:"user_id"`
} //@name AssignRequestInput

type GetRequestsByStatusInput struct {
	HotelID    string  `json:"-"           label:"X-Hotel-ID" validate:"notblank"`
	Status     string  `json:"status"      label:"Status"     validate:"oneof='pending' 'in progress' 'completed' 'archived'"`
	CursorTime *int64  `json:"cursor_time"`
	CursorID   *string `json:"cursor_id"`
} //@name GetRequestsByStatusInput

type GenerateRequestInput struct {
	RawText string `json:"raw_text" example:"Guest in room 504 needs extra towels urgently"`
	HotelID string `json:"hotel_id" validate:"notblank,startswith=org_" example:"org_521e8400-e458-41d4-a716-446655440000"`
} //@name GenerateRequestInput

type GenerateRequestWarning struct {
	Code    string `json:"code" example:"room_not_found"`
	Message string `json:"message" example:"Room 301 could not be resolved for this hotel."`
} //@name GenerateRequestWarning

type GenerateRequestResponse struct {
	Request Request                 `json:"request"`
	Warning *GenerateRequestWarning `json:"warning,omitempty"`
} //@name GenerateRequestResponse

type Request struct {
	ID             string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt      time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	RequestVersion time.Time `json:"request_version" example:"2024-01-02T00:00:00Z"`
	ChangedBy      *string   `json:"changed_by,omitempty"`
	MakeRequest
} //@name Request

type RequestActivityType string

const (
	ActivityCreated         RequestActivityType = "created"
	ActivityStatusChanged   RequestActivityType = "status_changed"
	ActivityPriorityChanged RequestActivityType = "priority_changed"
	ActivityAssigned        RequestActivityType = "assigned"
	ActivityUnassigned      RequestActivityType = "unassigned"
	ActivityNameChanged     RequestActivityType = "name_changed"
)

type RequestActivityItem struct {
	Type      RequestActivityType `json:"type"`
	ChangedBy *string             `json:"changed_by"`
	OldValue  *string             `json:"old_value,omitempty"`
	NewValue  *string             `json:"new_value,omitempty"`
	Timestamp time.Time           `json:"timestamp"`
} //@name RequestActivityItem

type RequestActivityPage struct {
	Items      []*RequestActivityItem `json:"items"`
	NextCursor *string                `json:"next_cursor,omitempty"`
} //@name RequestActivityPage

// RequestsFeedInput is the body for POST /requests/feed.
type RequestsFeedInput struct {
	HotelID     string          `json:"hotel_id" validate:"notblank,startswith=org_"`
	Cursor      string          `json:"cursor"`
	Limit       int             `json:"limit"       validate:"omitempty,min=1,max=100"`
	UserID      string          `json:"user_id"`
	Unassigned  bool            `json:"unassigned"`
	Status      string          `json:"status"      validate:"omitempty,oneof='pending' 'in progress' 'completed' 'archived'"`
	Priorities  []string        `json:"priorities"  validate:"omitempty,dive,oneof=low medium high"`
	Departments []string        `json:"departments"`
	Floors      []int           `json:"floors"`
	Sort        RequestFeedSort `json:"sort"        validate:"omitempty,oneof=priority newest oldest"`
	Search      string          `json:"search"`
} //@name RequestsFeedInput

type GetRequestsByGuestInput struct {
	GuestID string `json:"guest_id" validate:"required,uuid"`
	HotelID string `json:"hotel_id" validate:"required"`
	Cursor  string `json:"cursor"`
	Limit   int    `json:"limit" validate:"omitempty,min=1,max=100"`
} //@name GetRequestsByGuestInput

type GuestRequestPage struct {
	Data       []*GuestRequest `json:"data"`
	NextCursor *string         `json:"next_cursor"`
} //@name GuestRequestPage

type GetRequestsByRoomInput struct {
	RoomID  string `json:"room_id" validate:"required,uuid"`
	HotelID string `json:"hotel_id" validate:"required"`
} //@name GetRequestsByRoomInput

type RoomRequestsResponse struct {
	Assigned   []*GuestRequest `json:"assigned"`
	Unassigned []*GuestRequest `json:"unassigned"`
} //@name RoomRequestsResponse

type GuestRequest struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Priority        string    `json:"priority"`
	Status          string    `json:"status"`
	Description     *string   `json:"description,omitempty"`
	Notes           *string   `json:"notes,omitempty"`
	RoomNumber      *int      `json:"room_number,omitempty"`
	Floor           *int      `json:"floor,omitempty"`
	RequestType     string    `json:"request_type"`
	RequestCategory *string   `json:"request_category,omitempty"`
	DepartmentID    *string   `json:"department_id,omitempty"`
	DepartmentName  *string   `json:"department_name,omitempty"`
	UserID          *string   `json:"user_id,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	RequestVersion  time.Time `json:"request_version"`
} //@name GuestRequest
