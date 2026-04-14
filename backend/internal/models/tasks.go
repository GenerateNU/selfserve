package models

import "time"

// TaskTab selects which task list is being fetched.
type TaskTab string

const (
	TaskTabMy         TaskTab = "my"
	TaskTabUnassigned TaskTab = "unassigned"
)

func (t TaskTab) IsValid() bool {
	switch t {
	case TaskTabMy, TaskTabUnassigned:
		return true
	}
	return false
}

// TaskFilter captures GET /tasks query parameters.
type TaskFilter struct {
	Tab        TaskTab `query:"tab" validate:"required,oneof=my unassigned"`
	Cursor     string  `query:"cursor"`
	Limit      int     `query:"limit" validate:"omitempty,min=1,max=100"`
	Status     string  `query:"status" validate:"omitempty,oneof='pending' 'assigned' 'in progress' 'completed'"`
	Department string  `query:"department"`
	Priority   string  `query:"priority" validate:"omitempty,oneof=low medium high urgent"`
}

// Task is the staff-facing JSON shape for list/detail.
type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Priority    string     `json:"priority"`
	Department  *string    `json:"department,omitempty"`
	Location    string     `json:"location"`
	Description *string    `json:"description,omitempty"`
	DueTime     *time.Time `json:"due_time,omitempty"`
	Status      string     `json:"status"`
	IsAssigned  bool       `json:"is_assigned"`
	Cursor      string     `json:"-"`
}

// PatchTaskBody is the body for PATCH /tasks/:id.
type PatchTaskBody struct {
	Status string `json:"status" validate:"required,oneof='pending' 'assigned' 'in progress' 'completed'"`
}

// CreateTaskBody is the body for POST /tasks (adhoc staff task).
type CreateTaskBody struct {
	Name        string `json:"name" validate:"required,notblank"`
	AssignToMe  bool   `json:"assign_to_me"`
	Description string `json:"description" validate:"omitempty"`
	Priority    string `json:"priority" validate:"omitempty,oneof=low medium high"`
	Department  string `json:"department" validate:"omitempty"`
}
