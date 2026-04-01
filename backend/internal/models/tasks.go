package models

import "time"

type TaskTab string

const (
	TaskTabMy          TaskTab = "my"
	TaskTabUnassigned TaskTab = "unassigned"
)

// TaskFilter is parsed from GET /tasks query parameters.
type TaskFilter struct {
	Tab        string `query:"tab"`
	Limit      int    `query:"limit"`
	Status     string `query:"status"`
	Department string `query:"department"`
	Priority   string `query:"priority"`
}

// TaskCursor is the stable sort key for tasks pagination (tab-specific ordering + keyset).
// Version 2 cursors encode Tab, PriorityRank, DeptKey with CreatedAt and ID.
type TaskCursor struct {
	Tab          TaskTab
	PriorityRank int
	DeptKey      string // LOWER(TRIM(department)) for unassigned ordering; empty for my tasks
	CreatedAt    time.Time
	ID           string
}

// PatchTaskBody is PATCH /tasks/:id JSON body.
type PatchTaskBody struct {
	Status string `json:"status"`
}

// Task is the staff tasks list row derived from requests.
type Task struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Priority    string  `json:"priority"`
	Department  string  `json:"department"`
	Location    string  `json:"location"`
	Description *string `json:"description,omitempty"`
	DueTime     *string `json:"due_time,omitempty"`
	Status      string  `json:"status"`
	IsAssigned  bool    `json:"is_assigned"`
	Cursor      string  `json:"-"`
}

// CreateTaskBody is the POST /tasks JSON body from the mobile app.
type CreateTaskBody struct {
	Name        string `json:"name"`
	AssignToMe  bool   `json:"assign_to_me"`
}
