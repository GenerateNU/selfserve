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

// userCols is the SELECT list shared by all user queries.
// Departments is populated via a LEFT JOIN on employee_departments + departments.
const userCols = `
	u.id, u.first_name, u.last_name, u.hotel_id, u.employee_id, u.profile_picture,
	u.role, u.department, u.timezone, u.phone_number, u.primary_email,
	u.created_at, u.updated_at,
	COALESCE(array_agg(d.name ORDER BY d.name) FILTER (WHERE d.name IS NOT NULL), '{}') AS departments
`

// userGroupBy is the GROUP BY clause matching userCols (excluding the aggregated departments).
const userGroupBy = `
	u.id, u.first_name, u.last_name, u.hotel_id, u.employee_id, u.profile_picture,
	u.role, u.department, u.timezone, u.phone_number, u.primary_email,
	u.created_at, u.updated_at
`

func scanUser(row pgx.Row) (*models.User, error) {
	var user models.User
	err := row.Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.HotelID, &user.EmployeeID,
		&user.ProfilePicture, &user.Role, &user.Department, &user.Timezone,
		&user.PhoneNumber, &user.PrimaryEmail, &user.CreatedAt, &user.UpdatedAt,
		&user.Departments,
	)
	return &user, err
}

func (r *UsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT `+userCols+`
		FROM users u
		LEFT JOIN employee_departments ed ON u.id = ed.employee_id
		LEFT JOIN departments d ON ed.department_id = d.id
		WHERE u.id = $1
		GROUP BY `+userGroupBy,
		id,
	)

	user, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	return user, nil
}

func (r *UsersRepository) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	createdUser := &models.User{
		CreateUser: *user,
	}

	err := r.db.QueryRow(ctx, `
		INSERT INTO public.users (
			id, first_name, last_name, hotel_id, employee_id, profile_picture, role, department, timezone, phone_number, primary_email
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'UTC'), $10, $11
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
		user.PhoneNumber,
		user.PrimaryEmail,
	).Scan(&createdUser.ID, &createdUser.CreatedAt, &createdUser.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return createdUser, nil
}

func (r *UsersRepository) UpsertUser(ctx context.Context, user *models.ClerkUser, hotelID string) (*models.User, error) {
	createdUser := &models.User{}

	err := r.db.QueryRow(ctx, `
		INSERT INTO public.users (
			id, first_name, last_name, hotel_id, profile_picture
		) VALUES (
			$1, $2, $3, $4, $5
		)
		ON CONFLICT (id) DO UPDATE SET
			first_name      = EXCLUDED.first_name,
			last_name       = EXCLUDED.last_name,
			profile_picture = COALESCE(EXCLUDED.profile_picture, users.profile_picture),
			hotel_id        = EXCLUDED.hotel_id
		RETURNING id, created_at, updated_at
	`,
		user.ID,
		user.FirstName,
		user.LastName,
		hotelID,
		user.ImageUrl,
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

func (r *UsersRepository) UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		WITH updated AS (
			UPDATE users
			SET phone_number = COALESCE($2, phone_number), updated_at = NOW()
			WHERE id = $1
			RETURNING id, first_name, last_name, hotel_id, employee_id, profile_picture,
			          role, department, timezone, phone_number, primary_email, created_at, updated_at
		)
		SELECT `+userCols+`
		FROM updated u
		LEFT JOIN employee_departments ed ON u.id = ed.employee_id
		LEFT JOIN departments d ON ed.department_id = d.id
		GROUP BY `+userGroupBy,
		id, update.PhoneNumber,
	)

	user, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	return user, nil
}

func (r *UsersRepository) GetUsersByHotel(ctx context.Context, hotelID, cursor string, limit int) ([]*models.User, string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT `+userCols+`
		FROM users u
		LEFT JOIN employee_departments ed ON u.id = ed.employee_id
		LEFT JOIN departments d ON ed.department_id = d.id
		WHERE u.hotel_id = $1
		  AND ($2 = '' OR u.id > $2)
		GROUP BY `+userGroupBy+`
		ORDER BY u.id
		LIMIT $3
	`, hotelID, cursor, limit+1)
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(
			&u.ID, &u.FirstName, &u.LastName, &u.HotelID, &u.EmployeeID,
			&u.ProfilePicture, &u.Role, &u.Department, &u.Timezone,
			&u.PhoneNumber, &u.PrimaryEmail, &u.CreatedAt, &u.UpdatedAt,
			&u.Departments,
		); err != nil {
			return nil, "", err
		}
		users = append(users, &u)
	}
	if err := rows.Err(); err != nil {
		return nil, "", err
	}

	if len(users) == limit+1 {
		return users[:limit], users[limit-1].ID, nil
	}
	return users, "", nil
}

func (r *UsersRepository) SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT `+userCols+`
		FROM users u
		LEFT JOIN employee_departments ed ON u.id = ed.employee_id
		LEFT JOIN departments d ON ed.department_id = d.id
		WHERE u.hotel_id = $1
		  AND ($2 = '' OR LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || LOWER($2) || '%')
		  AND ($3 = '' OR u.id > $3)
		GROUP BY `+userGroupBy+`
		ORDER BY u.id
		LIMIT $4
	`, hotelID, query, cursor, limit+1)
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(
			&u.ID, &u.FirstName, &u.LastName, &u.HotelID, &u.EmployeeID,
			&u.ProfilePicture, &u.Role, &u.Department, &u.Timezone,
			&u.PhoneNumber, &u.PrimaryEmail, &u.CreatedAt, &u.UpdatedAt,
			&u.Departments,
		); err != nil {
			return nil, "", err
		}
		users = append(users, &u)
	}
	if err := rows.Err(); err != nil {
		return nil, "", err
	}

	if len(users) == limit+1 {
		return users[:limit], users[limit-1].ID, nil
	}
	return users, "", nil
}

func (r *UsersRepository) AddEmployeeDepartment(ctx context.Context, employeeID, departmentID string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO employee_departments (employee_id, department_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, employeeID, departmentID)
	return err
}

func (r *UsersRepository) RemoveEmployeeDepartment(ctx context.Context, employeeID, departmentID string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM employee_departments
		WHERE employee_id = $1 AND department_id = $2
	`, employeeID, departmentID)
	return err
}

func (r *UsersRepository) CompleteOnboarding(ctx context.Context, id string, data *models.OnboardUser) (*models.User, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var hotelID *string

	if data.Role == "manager" {
		if data.HotelName == nil {
			return nil, errs.BadRequest("hotel_name is required for managers")
		}
		var newHotelID string
		err = tx.QueryRow(ctx, `
			INSERT INTO hotels (name) VALUES ($1) RETURNING id
		`, data.HotelName).Scan(&newHotelID)
		if err != nil {
			return nil, err
		}
		hotelID = &newHotelID
	}

	var user models.User
	err = tx.QueryRow(ctx, `
		UPDATE users
		SET
			role         = $2,
			department   = $3,
			hotel_id     = COALESCE($4, hotel_id),
			is_onboarded = TRUE,
			updated_at   = NOW()
		WHERE id = $1
		RETURNING id, first_name, last_name, hotel_id, employee_id, profile_picture, role, department, timezone, phone_number, primary_email, is_onboarded, created_at, updated_at
	`, id, data.Role, data.Department, hotelID).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.HotelID, &user.EmployeeID,
		&user.ProfilePicture, &user.Role, &user.Department, &user.Timezone,
		&user.PhoneNumber, &user.PrimaryEmail, &user.IsOnboarded, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &user, nil
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
