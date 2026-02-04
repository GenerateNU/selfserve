import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import React from 'react'

// Ensure React is available globally
global.React = React

// Cleanup after each test
afterEach(() => {
  cleanup()
})
