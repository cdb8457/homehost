import { createSupabaseClient } from './supabase-client'

class HttpClient {
  private baseURL: string
  private supabase = createSupabaseClient()

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001') {
    this.baseURL = baseURL
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
    }
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    const headers = await this.getAuthHeaders()
    
    let url = `${this.baseURL}${endpoint}`
    
    // Add query parameters if provided
    if (options?.params) {
      const searchParams = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const httpClient = new HttpClient()