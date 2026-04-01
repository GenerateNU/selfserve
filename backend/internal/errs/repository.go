package errs

import "errors"

// Repository layer errors (errors thrown at the DB level)
var (
	ErrNotFoundInDB      = errors.New("not found in DB")
	ErrAlreadyExistsInDB = errors.New("already exists in DB")

	// Request insert / tasks (Postgres constraint or type errors)
	ErrRequestUnknownHotel    = errors.New("request insert: unknown hotel")
	ErrRequestUnknownAssignee = errors.New("request insert: unknown assignee")
	ErrRequestInvalidUserID   = errors.New("request insert: user_id value rejected by database")

	// Users table cannot map a Clerk id (e.g. user_…) to requests.user_id — migrations incomplete.
	ErrStaffUserIDNeedsDBMigration = errors.New("staff user id: database schema out of date for Clerk ids")

	// Task claim/drop: row exists but preconditions (pending/unassigned or assignee match) failed.
	ErrTaskStateConflict = errors.New("task state conflict")
)
