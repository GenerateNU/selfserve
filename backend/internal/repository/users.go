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

func (r *UsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
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

func (r *UsersRepository) UpdateProfilePicture(ctx context.Context, userId string, key string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET profile_picture = $1 WHERE id = $2
	`, key, userId)
	return err
}

func (r *UsersRepository) GetKey(ctx context.Context, userId string) (string, error) {
	var key string
	err := r.db.QueryRow(ctx, `SELECT profile_picture FROM users WHERE id=$1`, userId).Scan(&key)
	if err != nil {
		return "", err
	}
	return key, nil
}

func (r *UsersRepository) DeleteProfilePicture(ctx context.Context, userId string) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET profile_picture = NULL WHERE id=$1`, userId)
	return err
}

func (r *UsersRepository) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	batch := &pgx.Batch{}

	for _, u := range users {
		batch.Queue(`
            INSERT INTO users (clerk_id, first_name, last_name, profile_picture)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (clerk_id) DO UPDATE
        `, u.ClerkID, u.FirstName, u.LastName, u.ProfilePicture)
	}

	return r.db.SendBatch(ctx, batch).Close()
}