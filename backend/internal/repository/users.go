package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepository struct {
	db *pgxpool.Pool
}

func NewUsersRepository(db *pgxpool.Pool) *UsersRepository {
	return &UsersRepository{db: db}
}

// ResolveStaffUserIDForRequests maps X-Dev-User-Id / Clerk ids to the value stored in requests.user_id.
// Supports: (1) post-migration schema where users.id is the Clerk id (text), and (2) legacy schema with
// uuid users.id plus users.clerk_id.
// TODO(production): Prefer a verified auth principal from middleware instead of
// accepting raw user identity from request headers.
func (r *UsersRepository) ResolveStaffUserIDForRequests(ctx context.Context, header string) (string, error) {
	header = strings.TrimSpace(header)
	if header == "" {
		return "", nil
	}

	var id string
	var idLookupWasInvalidUUID bool
	err := r.db.QueryRow(ctx, `SELECT id::text FROM users WHERE id = $1`, header).Scan(&id)
	if err == nil {
		return id, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "22P02" {
			idLookupWasInvalidUUID = true
			err = pgx.ErrNoRows
		} else {
			return "", err
		}
	}

	err = r.db.QueryRow(ctx, `SELECT id::text FROM users WHERE clerk_id = $1`, header).Scan(&id)
	if err == nil {
		return id, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errs.ErrNotFoundInDB
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "42703" && idLookupWasInvalidUUID {
		return "", errs.ErrStaffUserIDNeedsDBMigration
	}
	if errors.As(err, &pgErr) && pgErr.Code == "42703" {
		return "", errs.ErrNotFoundInDB
	}
	return "", err
}

func (r *UsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, first_name, last_name, hotel_id, employee_id, profile_picture, role, department, timezone, created_at, updated_at FROM users where id = $1
		`, id)

	var user models.User
	err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.HotelID, &user.EmployeeID, &user.ProfilePicture, &user.Role, &user.Department, &user.Timezone, &user.CreatedAt, &user.UpdatedAt)
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
			id, first_name, last_name, hotel_id, employee_id, profile_picture, role, department, timezone
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'UTC')
		)
		RETURNING id, created_at, updated_at
	`,
		user.ID,
		user.FirstName,
		user.LastName,
		user.HotelID,
		user.EmployeeID,
		user.ProfilePicture,
		user.Role,
		user.Department,
		user.Timezone,
	).Scan(&createdUser.ID, &createdUser.CreatedAt, &createdUser.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return createdUser, nil
}

func (r *UsersRepository) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	batch := &pgx.Batch{}

	for _, u := range users {
		batch.Queue(`
            INSERT INTO users (id, first_name, last_name, profile_picture)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                profile_picture = EXCLUDED.profile_picture
        `, u.ID, u.FirstName, u.LastName, u.ProfilePicture)
	}

	return r.db.SendBatch(ctx, batch).Close()
}
