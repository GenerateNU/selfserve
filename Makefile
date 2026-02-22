.PHONY: install-clients install-shared install-mobile install-web dev-web dev-mobile

# Install dependencies in shared, mobile, and web
install-clients: install-shared install-mobile install-web
	@echo "✓ All client dependencies installed"

install-shared:
	@echo "Installing shared..."
	@cd clients/shared && npm install

install-mobile:
	@echo "Installing mobile..."
	@cd clients/mobile && npm install --legacy-peer-deps

install-web:
	@echo "Installing web..."
	@cd clients/web && npm install

# Start development servers
dev-web:
	@cd clients/web && npm run dev

dev-mobile:
	@cd clients/mobile && npx expo start
