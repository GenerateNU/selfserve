import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { setAuthProvider } from '@shared'

// Configure mock auth provider for tests before hooks are called
setAuthProvider({
  getToken: async () => 'mock-token',
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
