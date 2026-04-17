.PHONY: install install-shared install-mobile install-web dev-web dev-mobile format format-mobile format-web lint lint-web lint-mobile lint-fix lint-fix-web lint-fix-mobile sync-api typecheck typecheck-web typecheck-mobile

# Install dependencies in shared, mobile, and web
install: install-shared install-mobile install-web
	@echo "✓ All client dependencies installed"

install-shared:
	@echo "Installing shared..."
	@cd shared && npm install

install-mobile:
	@echo "Installing mobile..."
	@cd mobile && npm install --legacy-peer-deps

install-web:
	@echo "Installing web..."
	@cd web && npm install

# Format code
format: format-mobile format-web

format-mobile:
	@echo "Formatting mobile..."
	@cd mobile && npm run format

format-web:
	@echo "Formatting web..."
	@cd web && npm run format

# Start development servers
dev-web:
	@cd web && npm run dev

dev-mobile:
	@cd mobile && npm run start

generate:
	@cd shared && npm run generate:api

sync-api:
	@cd ../backend && make swagger
	@cd shared && npm run generate:api

typecheck: typecheck-web typecheck-mobile

typecheck-web:
	@echo "Type checking web..."
	@cd web && npx tsc --noEmit

typecheck-mobile:
	@echo "Type checking mobile..."
	@cd mobile && npx tsc --noEmit