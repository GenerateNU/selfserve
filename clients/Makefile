.PHONY: install install-shared install-mobile install-web dev-web dev-mobile

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

# Start development servers
dev-web:
	@cd web && npm run dev

dev-mobile:
	@cd mobile && npx expo start
