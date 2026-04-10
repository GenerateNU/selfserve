package models

import "time"

type DepartmentName string

const (
	DepartmentFrontDesk    DepartmentName = "Front Desk"
	DepartmentHousekeeping DepartmentName = "Housekeeping"
	DepartmentMaintenance  DepartmentName = "Maintenance"
	DepartmentFoodBeverage DepartmentName = "Food & Beverage"
)

var DefaultDepartments = []DepartmentName{
	DepartmentFrontDesk,
	DepartmentHousekeeping,
	DepartmentMaintenance,
	DepartmentFoodBeverage,
}

type Department struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	HotelID   string    `json:"hotel_id" example:"org_2abc123"`
	Name      string    `json:"name" example:"Housekeeping"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
} //@name Department

type CreateDepartment struct {
	Name string `json:"name" validate:"notblank"`
}

type UpdateDepartment struct {
	Name string `json:"name" validate:"notblank"`
}
