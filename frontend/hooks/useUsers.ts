'use client'

import { useState, useEffect } from 'react'
import { User, getUsers, createUser } from '@/lib/api'

export interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<boolean>
  refreshUsers: () => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUsers()
      
      if (response.error) {
        setError(response.error)
      } else {
        setUsers(response.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      setError(null)
      const response = await createUser(userData)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      // Refresh the users list
      await fetchUsers()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      return false
    }
  }

  const refreshUsers = async () => {
    await fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    addUser,
    refreshUsers,
  }
}
