package aiflows

import (
	"context"
	"strings"

	"github.com/generate/selfserve/internal/models"
)

type DepartmentLookupRepository interface {
	GetDepartmentsByHotelID(ctx context.Context, hotelID string) ([]*models.Department, error)
}

// LookupDepartmentID finds the department ID whose name matches the given name
// (case-insensitive). Returns nil if no match is found.
func LookupDepartmentID(departments []*models.Department, name string) *string {
	for _, d := range departments {
		if strings.EqualFold(d.Name, name) {
			return &d.ID
		}
	}
	return nil
}
