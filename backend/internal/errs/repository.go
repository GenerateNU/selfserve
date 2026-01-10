package errs

import "errors"

// Repository layer errors (errors thrown at the DB level)
var (
	ErrNotFoundInDB      = errors.New("not found in DB")
	ErrAlreadyExistsInDB = errors.New("already exists in DB")
)
