import { supabase, getCachedToken } from './supabase';

// Backend API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set in .env.local');
}

// Types matching backend Pydantic models
export interface ProfileResponse {
  id: string;
  first_name: string;
  surname: string;
  full_name: string | null;
  username: string;
  role_name: string | null;
  default_route: string | null;
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

export interface ClassResponse {
  id: string;
  name: string;
  subject: string;
  target_level: string | null;
  organization_id: string | null;
  created_at: string;
}

export interface TeacherProfileResponse {
  id: string;
  bio: string | null;
  classes: ClassResponse[];
  created_at: string;
  updated_at: string;
}

// Module permission system types
export interface ModuleWithPermissions {
  module_code: string;
  module_eng_name: string;
  module_chi_name: string;
  seq_no: number;
  route: string;
  description: string | null;
  descriptive_message: string | null;
  parent_module_code: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface ProfileWithModulesResponse {
  profile: ProfileResponse;
  modules: ModuleWithPermissions[];
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

// Get JWT token — uses cached token from onAuthStateChange listener,
// falls back to getSession() only on first load before listener fires
async function getAuthToken(): Promise<string | null> {
  const cached = getCachedToken();
  if (cached) return cached;

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
   * Get current user's profile
   * @param includeModules - If true, returns profile + accessible modules in single response
   */
  async getMyProfile(includeModules = false): Promise<ProfileResponse | ProfileWithModulesResponse> {
    const endpoint = includeModules ? '/profile/me?include=modules' : '/profile/me';
    return apiRequest<ProfileResponse | ProfileWithModulesResponse>(endpoint, {
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

  /**
   * Get current teacher's profile with classes
   */
  async getMyTeacherProfile(): Promise<TeacherProfileResponse> {
    return apiRequest<TeacherProfileResponse>('/profile/me/teacher', {
      method: 'GET',
    });
  },
};
