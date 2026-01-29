package repository

import (
	"context"

	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepository struct {
	db *pgxpool.Pool
}

func NewUsersRepository(db *pgxpool.Pool) *UsersRepository {
	return &UsersRepository{db: db}
}

func (r *UsersRepository) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	createdUser := &models.User{
		CreateUser: *user,
	}

	err := r.db.QueryRow(ctx, `
		INSERT INTO public.users (
			first_name, last_name, employee_id, profile_picture, role, department, timezone, clerk_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, COALESCE($7, 'UTC'), $8 
		)
		RETURNING id, created_at, updated_at
	`,
		user.FirstName,
		user.LastName,
		user.EmployeeID,
		user.ProfilePicture,
		user.Role,
		user.Department,
		user.Timezone,
		user.ClerkID,
	).Scan(&createdUser.ID, &createdUser.CreatedAt, &createdUser.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return createdUser, nil
}
