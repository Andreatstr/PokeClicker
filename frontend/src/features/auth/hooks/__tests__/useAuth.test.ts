import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { useAuth } from '../useAuth'
import { AuthContext } from '@features/auth'
import { createMockUser } from '../../../../test/factories'

describe('useAuth hook', () => {
  it('should return auth context when used within AuthProvider', () => {
    const mockUser = createMockUser()
    const mockContext = {
      user: mockUser,
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      isAuthenticated: true,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(AuthContext.Provider, { value: mockContext }, children)
    }

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toEqual(mockContext)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should return auth context with null user', () => {
    const mockContext = {
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      isAuthenticated: false,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(AuthContext.Provider, { value: mockContext }, children)
    }

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toEqual(mockContext)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')

    consoleSpy.mockRestore()
  })

  it('should provide all required context properties', () => {
    const mockUser = createMockUser()
    const mockLogin = vi.fn()
    const mockLogout = vi.fn()
    const mockUpdateUser = vi.fn()

    const mockContext = {
      user: mockUser,
      token: 'mock-token',
      login: mockLogin,
      logout: mockLogout,
      updateUser: mockUpdateUser,
      isAuthenticated: true,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(AuthContext.Provider, { value: mockContext }, children)
    }

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('token')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('updateUser')
    expect(result.current).toHaveProperty('isAuthenticated')

    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(typeof result.current.updateUser).toBe('function')
    expect(typeof result.current.isAuthenticated).toBe('boolean')
  })
})