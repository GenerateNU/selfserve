package errors

import (
	"log/slog"
	"os"
)

func FatalError(msg string, args ...any) {
	slog.Error(msg, args...)
	os.Exit(1)
}
