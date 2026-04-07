package utils

// Apply sets *dst to *src when src is non-nil, leaving dst unchanged otherwise.
// Use this to apply optional patch fields onto an existing value.
//
//	utils.Apply(&current.Status, patch.Status)
func Apply[T any](dst *T, src *T) {
	if src != nil {
		*dst = *src
	}
}

// ApplyPtr sets dst to src when src is non-nil, leaving dst unchanged otherwise.
// Use this for pointer fields on the target struct.
//
//	utils.ApplyPtr(&current.UserID, patch.UserID)
func ApplyPtr[T any](dst **T, src *T) {
	if src != nil {
		*dst = src
	}
}
