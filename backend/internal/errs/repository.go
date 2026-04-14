package errs

import "errors"

// Repository layer errors (errors thrown at the DB level)
var (
	ErrNotFoundInDB      = errors.New("not found in DB")
	ErrAlreadyExistsInDB = errors.New("already exists in DB")

	ErrTaskStateConflict         = errors.New("task state conflict")
	ErrRequestUnknownHotel       = errors.New("unknown hotel for request")
	ErrRequestUnknownAssignee    = errors.New("unknown assignee for request")
	ErrRequestInvalidUserID      = errors.New("invalid user id for request")
	ErrDefaultDepartmentInsertDB = errors.New("failed to insert default departments")
)
