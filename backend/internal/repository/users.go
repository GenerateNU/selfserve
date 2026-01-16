package repository

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

)


type UsersRepository struct {

	db *pgxpool.Pool
}


func NewUsersRepository(db *pgxpool.Pool) *UsersRepository {
	return &UsersRepository{db: db}
}

func (r *UsersRepository) GetUserById(ctx context.Context, id string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, first_name,  last_name, employee_id, profile_picture, role, department, timezone, created_at, updated_at FROM users where id = $1
		`, id)

	var user models.User
	err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.EmployeeID, &user.ProfilePicture, &user.Role, &user.Department, &user.Timezone, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err

	}
	return &user, nil
}
