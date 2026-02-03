import { describe, it, expect } from 'vitest'
import type { User, Request, Hotel, Guest, CreateUser, MakeRequest } from '@shared'

describe('Generated Types Integration', () => {
  describe('Type Structure Validation', () => {
    it('should have correct User type structure', () => {
      const user: User = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        employee_id: 'EMP-001',
        role: 'admin',
        department: 'Engineering',
        timezone: 'UTC',
        profile_picture: 'https://example.com/pic.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(user.id).toBe('123')
      expect(user.first_name).toBe('John')
      expect(user.role).toBe('admin')
    })

    it('should have correct Request type structure', () => {
      const request: Request = {
        id: '456',
        hotel_id: 'hotel-123',
        name: 'Room Cleaning',
        request_type: 'recurring',
        status: 'pending',
        priority: 'high',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(request.id).toBe('456')
      expect(request.name).toBe('Room Cleaning')
      expect(request.status).toBe('pending')
    })

    it('should have correct Hotel type structure', () => {
      const hotel: Hotel = {
        id: 'hotel-789',
        name: 'Grand Hotel',
        floors: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(hotel.id).toBe('hotel-789')
      expect(hotel.name).toBe('Grand Hotel')
      expect(hotel.floors).toBe(10)
    })

    it('should have correct Guest type structure', () => {
      const guest: Guest = {
        id: 'guest-101',
        first_name: 'Alice',
        last_name: 'Smith',
        profile_picture: 'https://example.com/alice.jpg',
        timezone: 'America/New_York',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(guest.id).toBe('guest-101')
      expect(guest.first_name).toBe('Alice')
    })
  })

  describe('Create/Input Types', () => {
    it('should have correct CreateUser type structure', () => {
      const createUser: CreateUser = {
        first_name: 'Bob',
        last_name: 'Johnson',
        employee_id: 'EMP-002',
        role: 'manager',
        department: 'Sales',
        timezone: 'America/Los_Angeles',
        profile_picture: 'https://example.com/bob.jpg',
      }

      expect(createUser.first_name).toBe('Bob')
      expect(createUser.role).toBe('manager')
    })

    it('should have correct MakeRequest type structure', () => {
      const makeRequest: MakeRequest = {
        hotel_id: 'hotel-123',
        name: 'Maintenance Request',
        request_type: 'one-time',
        status: 'pending',
        priority: 'medium',
      }

      expect(makeRequest.hotel_id).toBe('hotel-123')
      expect(makeRequest.name).toBe('Maintenance Request')
    })
  })

  describe('Optional Fields', () => {
    it('should allow optional fields to be undefined', () => {
      const user: User = {
        id: '123',
      }

      expect(user.id).toBe('123')
      expect(user.first_name).toBeUndefined()
      expect(user.department).toBeUndefined()
    })

    it('should allow optional fields in create types', () => {
      const createUser: CreateUser = {
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      }

      expect(createUser.first_name).toBe('Test')
      expect(createUser.department).toBeUndefined()
    })
  })

  describe('Type Compatibility', () => {
    it('should be compatible with existing code patterns', () => {
      // This tests that the generated types work with common patterns
      const users: User[] = [
        { id: '1', first_name: 'Alice' },
        { id: '2', first_name: 'Bob' },
      ]

      const userNames = users.map(u => u.first_name)
      expect(userNames).toEqual(['Alice', 'Bob'])
    })

    it('should work with type guards', () => {
      const data: User | Request = { id: '123', first_name: 'Test' }

      const isUser = (obj: User | Request): obj is User => {
        return 'first_name' in obj
      }

      expect(isUser(data)).toBe(true)
    })
  })
})
