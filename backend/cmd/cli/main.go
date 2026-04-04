package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/repository"
	"github.com/generate/selfserve/internal/service/clerk"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/sethvargo/go-envconfig"
)

// command is a runnable CLI subcommand.
type command struct {
	description string
	run         func(ctx context.Context, cfg config.Config, args []string) error
}

// commands is the registry of all available CLI subcommands.
// To add a new command: add an entry here and implement its run func below.
//
//	"my-new-command": {
//		description: "What this command does",
//		run:         runMyNewCommand,
//	},
var commands = map[string]command{
	"sync-users": {
		description: "Sync users from Clerk into the database",
		run:         runSyncUsers,
	},
	"reindex-guests": {
		description: "Fetch all guests from the database and reindex them in OpenSearch",
		run:         runReindexGuests,
	},
}

func main() {
	flag.Usage = printUsage
	flag.Parse()

	args := flag.Args()
	if len(args) == 0 {
		printUsage()
		os.Exit(1)
	}

	name := args[0]
	cmd, ok := commands[name]
	if !ok {
		fmt.Fprintf(os.Stderr, "unknown command: %q\n\n", name)
		printUsage()
		os.Exit(1)
	}

	ctx := context.Background()
	var cfg config.Config
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.Fatal("failed to process config:", err)
	}

	if err := cmd.run(ctx, cfg, args[1:]); err != nil {
		log.Fatalf("%s: %v", name, err)
	}
}

func printUsage() {
	fmt.Fprintf(os.Stderr, "Usage: cli <command> [args]\n\nAvailable commands:\n")
	for name, cmd := range commands {
		fmt.Fprintf(os.Stderr, "  %-20s %s\n", name, cmd.description)
	}
	fmt.Fprintln(os.Stderr)
}

// =============================================================================
// Command implementations
// =============================================================================

func runSyncUsers(ctx context.Context, cfg config.Config, _ []string) error {
	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}
	defer repo.Close()

	usersRepo := repository.NewUsersRepository(repo.DB)

	users, err := clerk.FetchUsersFromClerk(cfg.BaseURL+"/users", cfg.SecretKey)
	if err != nil {
		return err
	}

	transformed, err := clerk.ValidateAndReformatUserData(users)
	if err != nil {
		return err
	}

	if err := usersRepo.BulkInsertUsers(ctx, transformed); err != nil {
		return fmt.Errorf("failed to insert users: %w", err)
	}

	fmt.Println("sync-users completed successfully")
	return nil
}
