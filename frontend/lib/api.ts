// API client for communicating with the backend server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface User {
  id?: string
  name: string
  email: string
  created_at?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users')
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()

// Export individual functions for convenience
export const getUsers = () => apiClient.getUsers()
export const createUser = (user: Omit<User, 'id' | 'created_at'>) => apiClient.createUser(user)
export const healthCheck = () => apiClient.healthCheck()
