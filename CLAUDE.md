# SelfServe

## Patterns
## Project Structure

```
clients/
  web/src/
    routes/        # File-based routing (TanStack Router)
    components/    # Feature-organized React components (ui/, home/, requests/, rooms/, profile/)
    hooks/         # Custom React hooks
    lib/           # Utilities (cn helper, etc.)
    tests/         # Test files
  shared/src/
    api/           # HTTP client and config
    types/         # Shared API types
  mobile/          # React Native app (mirrors web structure)
backend/
  cmd/             # Entry points
  config/          # Config loading
  internal/
    handler/       # HTTP handlers (Fiber)
    repository/    # Database access (pgx)
    models/        # Domain models with validation tags
    service/       # Business logic and app initialization
```

## Frontend Patterns

### File Naming

- Components: PascalCase (`Button.tsx`, `HomeHeader.tsx`)
- Hooks: kebab-case with `use-` prefix (`use-dropdown.ts`)
- Utilities: camelCase (`utils.ts`)
- Routes: kebab-case with `.` segments (`_protected/rooms.index.tsx`)
- Layout routes: underscore prefix (`__root.tsx`, `_protected.tsx`)

### Component Structure

Functional components only. Props typed with `type` or `interface`. Single named export per file.

```tsx
type ButtonVariant = "primary" | "secondary";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-bg-container text-text-default hover:bg-bg-selected",
};

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
}
```

### Routing (TanStack Router)

File-based routing. Route components exported as `Route` const. Dynamic segments use `$` prefix.

```tsx
export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function HomePage() {
  // implementation
}
```

Protected routes use the `_protected` layout route. Dynamic routes: `guests.$guestId.tsx`.

### Styling (Tailwind CSS)

Utility-first with no custom CSS components. Use `cn()` for conditional/merged classes.

```tsx
import { cn } from "@/lib/utils";

// Variant map pattern
const variantStyles: Record<Variant, string> = { ... };

// Merge classes
<div className={cn("base-class", isActive && "active-class", className)} />
```

**Custom theme tokens** (use these instead of raw colors):
- Text: `text-text-default`, `text-text-subtle`, `text-text-secondary`
- Background: `bg-bg-primary`, `bg-bg-container`, `bg-bg-selected`, `bg-bg-disabled`
- Stroke: `stroke-default`, `stroke-subtle`, `stroke-disabled`
- Brand: `bg-primary`, `hover:bg-primary-hover`
- Status: success, warning, danger, info variants

### Imports

Use path aliases — never relative imports that traverse directories.

```ts
import { Button } from "@/components/ui/Button";
import { request } from "@shared/api/client";
import type { User } from "@shared/types/api.types";
```

Named exports only. Default exports are only acceptable in generated code.

### Data Fetching (TanStack Query)

QueryClient defaults: `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`.

Query key convention: `["resource", id]`.

```ts
const { data } = useQuery({
  queryKey: ["rooms", hotelId],
  queryFn: () => getRooms(hotelId),
});
```

### Mutations (TanStack Query)

```ts
const { mutate } = useMutation({
  mutationFn: (value: string) => request({ url: `/resource/${id}`, method: "PUT", data: { field: value } }),
  onSuccess: (result) => { /* handle success */ },
  onError: (error) => { /* handle error */ },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["resource", id] });
  },
});
```

### Optimistic Updates (TanStack Query)

Use this pattern for mutations that should update the UI immediately before the server responds.

```ts
const { mutate } = useMutation({
  mutationFn: (value: string) =>
    request({ url: `/resource/${id}`, method: "PUT", data: { field: value } }),
  onMutate: async (value) => {
    // Cancel any in-flight refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: ["resource", id] });
    // Snapshot previous value for rollback
    const previous = queryClient.getQueryData<ResourceType>(["resource", id]);
    // Optimistically update the cache
    queryClient.setQueryData<ResourceType>(["resource", id], (old) => ({
      ...old,
      field: value,
    }));
    return { previous };
  },
  onError: (_err, _vars, context) => {
    // Roll back to snapshot on failure
    queryClient.setQueryData(["resource", id], context?.previous);
  },
  onSettled: () => {
    // Always resync with server after mutation
    queryClient.invalidateQueries({ queryKey: ["resource", id] });
  },
});
```
<<<<<<< HEAD
=======

### Custom Hooks

Follow `use*` naming. Generic hooks accept type parameters.

```ts
export const useDropdown = <T>({ selected, onChangeSelectedItems }: UseDropdownOptions<T>) => {
  // implementation
};
```

### Authentication (Clerk)

Use `useUser()` for current user. Gate rendering with `<SignedIn>` / `<SignedOut>`. Protected pages live under the `_protected` layout route which handles redirect to login.

```tsx
const { user } = useUser();
```

Token is injected into all API requests automatically via the shared `HttpClient` — no manual token handling needed in components.

### API Client

Centralized in `@shared/api/client`. Typed generic methods: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`. Config is set once at app startup via `setConfig()`.

```ts
import { request } from "@shared/api/client";

const data = await request<ResponseType>({ url: "/endpoint", method: "GET" });
```

### Form Handling

Controlled inputs with `value` / `onChange`. Submit via `useMutation`. No form libraries — use plain React state.

### TypeScript

- `strict: true` always
- Prefer `type` over `interface` (use `interface` only for extensible contracts)
- Use type-only imports: `import type { Foo } from "..."`
- Generic types with descriptive names (`<T>`, `<TItem>`, `<TData>`)

---

## Backend Patterns (Go)

### Layered Architecture

1. **Handler** — HTTP input/output, validation, delegates to repository
2. **Repository** — Database queries, returns domain models and sentinel errors
3. **Models** — Structs with JSON and validation tags
4. **Service** — App initialization and wiring
5. **Config** — Environment variable loading

### Dependency Injection

Handlers receive repository interfaces, not concrete types. Enables mock-based testing.

```go
type UsersRepository interface {
  GetUserByID(ctx context.Context, id string) (models.User, error)
}

type UsersHandler struct {
  repo UsersRepository
}

func NewUsersHandler(repo UsersRepository) *UsersHandler {
  return &UsersHandler{repo: repo}
}
```

### Error Handling

Sentinel errors at the repository layer:

```go
var ErrNotFoundInDB = errors.New("not found in db")
var ErrAlreadyExistsInDB = errors.New("already exists in db")
```

Map to HTTP errors in handlers:

```go
if errors.Is(err, errs.ErrNotFoundInDB) {
  return errs.NotFound("User", "id", id)
}
```

Available HTTP error constructors in `errs` package:
- `BadRequest(msg string) HTTPError`
- `NotFound(title, withKey string, withValue any) HTTPError`
- `InvalidRequestData(errors map[string]string) HTTPError`
- `InternalServerError() HTTPError`

### Validation (Go)

Struct tags with `go-playground/validator`. Custom validators: `notblank`, `timezone`, `uuid`.

```go
type CreateUser struct {
  ID        string  `json:"id"        validate:"notblank"`
  FirstName string  `json:"first_name" validate:"notblank"`
  Timezone  *string `json:"timezone,omitempty" validate:"omitempty,timezone"`
}
```

Parse and validate in one step using `httpx.BindAndValidate`.

### API Documentation

All handler functions must have Swagger annotations:

```go
// GetUserByID godoc
// @Summary      Get user by ID
// @Description  Retrieves a user by their unique app ID
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id  path      string  true  "User ID"
// @Success      200   {object}  models.User
// @Failure      404   {object}  errs.HTTPError
// @Router       /users/{id} [get]
```

### Testing (Go)

Table-driven tests with `t.Parallel()`. Mock interfaces for repositories.

```go
func TestUsersHandler_GetUserByID(t *testing.T) {
  t.Parallel()

  t.Run("returns 200 with user", func(t *testing.T) {
    t.Parallel()
    // arrange
    mockRepo := &mockUsersRepository{...}
    handler := NewUsersHandler(mockRepo)
    // act + assert
  })
}
```

### Configuration (Go)

Environment variables loaded via `sethvargo/go-envconfig` into structs with `env` tags. Grouped by domain with prefixes.

```go
type Config struct {
  Application `env:",prefix=APP_"`
  DB          `env:",prefix=DB_"`
  Clerk       `env:",prefix=CLERK_"`
  LLM         `env:",prefix=LLM_"`
}
```

### Logging

Use `slog` package for structured logging. No `fmt.Println` in production paths.

### CLI Commands (`backend/cmd/cli`)

Commands are registered in `main.go` and implemented in per-topic files (e.g. `guests.go`).

**Registering a command:**
```go
// main.go
var commands = map[string]command{
  "reindex-guests": {
    description: "Fetch all guests from the database and reindex them in OpenSearch",
    run:         runReindexGuests,
  },
}
```

**Backfill/reindex pattern** — paginated DB read via `iter.Seq2`, batched writes to the sink:

```go
// repository: paginated generator using cursor pagination
func (r *GuestsRepository) AllGuestDocuments(ctx context.Context) iter.Seq2[*models.GuestDocument, error] {
  return func(yield func(*models.GuestDocument, error) bool) {
    var cursorName, cursorID string
    for {
      // fetch page using (cursorName, cursorID) as cursor
      // yield each doc; return on last page or if yield returns false
    }
  }
}

// cli: accumulate into batches, flush when full
batch := make([]*models.GuestDocument, 0, batchSize)
for doc, err := range repo.AllGuestDocuments(ctx) {
  if err != nil { return err }
  batch = append(batch, doc)
  if len(batch) == batchSize {
    if err := sink.BulkIndex(ctx, batch); err != nil { return err }
    batch = batch[:0]
  }
}
if len(batch) > 0 {
  if err := sink.BulkIndex(ctx, batch); err != nil { return err }
}
```

- DB is read in pages, sink is written in batches — neither loaded fully into memory
- `iter.Seq2` is used so the caller drives iteration with a plain `for range`
- No semaphore needed unless batches are indexed concurrently

---

## Testing (Frontend)

- Vitest as test runner
- Testing Library for component tests
- jsdom environment
- Test files in `tests/` directory or colocated with `*.test.ts` suffix
>>>>>>> origin
