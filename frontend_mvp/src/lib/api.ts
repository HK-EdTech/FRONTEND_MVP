import { supabase } from './supabase';

// Backend API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set in .env.local');
}

// Types matching backend Pydantic models
export interface SignupRequest {
  user_id: string;
  first_name: string;
  surname: string;
  username: string;
  role_name: 'student' | 'teacher' | 'private_tutor';
  class_level?: string | null;
  organization_id?: string | null;
}

export interface ProfileResponse {
  id: string;
  first_name: string;
  surname: string;
  full_name: string | null;
  username: string;
  role_name: string | null;
  class_level: string | null;
  organization_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  surname?: string;
  username?: string;
  class_level?: string;
  avatar_url?: string;
}

// API Error Class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public response?: any
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

// Get JWT token from Supabase session
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new ApiError(401, 'No authentication token available');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: response.statusText
    }));
    throw new ApiError(
      response.status,
      errorData.detail || 'API request failed',
      errorData
    );
  }

  return response.json();
}

// API Methods
export const api = {
  /**
   * Create user profile after Supabase signup
   */
  async signup(data: SignupRequest): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>('/profile/me', {
      method: 'GET',
    });
  },

  /**
   * Update current user's profile
   */
  async updateMyProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
