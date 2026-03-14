
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

export interface MarkingSchemeResponse {
  id: string;
  doc_path: string | null;
}

export interface HomeworkResponse {
  id: string;
  title: string | null;
  subject: string | null;
  class_id: string | null;
  due_date: string | null;
  full_score: number | null;
  marking_scheme_id: string | null;
  marking_scheme: MarkingSchemeResponse | null;
  created_at: string;
}

export interface TeacherHomeworkResponse {
  id: string;
  title: string | null;
  subject: string | null;
  class_id: string | null;
  class_name: string | null;
  due_date: string | null;
  full_score: number | null;
  assigned_classes: number;
  assigned_class_ids: string[];
  assigned_students: number;
  created_at: string;
}

export interface CreateTeacherHomeworkRequest {
  title: string;
  subject?: string;
  due_date?: string;
  full_score?: number;
  class_ids: string[];
}

export interface AssignHomeworkClassesRequest {
  class_ids: string[];
}

export interface ClassResponse {
  id: string;
  name: string;
  subject: string;
  target_level: string | null;
  teacher_id: string;
  organization_id: string | null;
  created_at: string;
}

export interface ClassWithHomeworkResponse extends ClassResponse {
  homework: HomeworkResponse[];
}

export interface ClassroomDetailResponse {
  id: string;
  name: string;
  subject: string;
  target_level: string | null;
  organization_id: string | null;
  organization_name: string | null;
  teacher_id: string;
  teacher_name: string;
  num_students: number;
  created_at: string;
}

export interface ClassroomHomeworkResponse {
  id: string;
  title: string | null;
  subject: string | null;
  class_id: string | null;
  due_date: string | null;
  assigned_students: number;
  created_at: string;
}

export interface CreateClassHomeworkRequest {
  title: string;
  subject?: string;
  due_date?: string;
  full_score?: number;
}

export interface ClassroomStudentResponse {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  class_level: string | null;
  status: string;
  enrolled_at: string;
}

export interface ClassStudentCandidateResponse {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  class_level: string | null;
}

export interface AddClassStudentRequest {
  student_id?: string;
  username?: string;
  full_name?: string;
}

export interface AddClassStudentsRequest {
  student_ids: string[];
}

export interface ClassroomTeacherResponse {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface CreateClassRequest {
  name: string;
  subject: string;
  target_level?: string;
  organization_id?: string;
}

export interface ClassManagementHomeworkItem {
  id: string;
  title: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ClassManagementSubject {
  id: string;
  subjectName: string;
  homework: ClassManagementHomeworkItem[];
}

export interface ClassManagementGroup {
  className: string;
  subjects: ClassManagementSubject[];
}

export type ClassManagementResponse = ClassManagementGroup[];

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

  /**
   * Get teacher's classes with homework (single call for scan & upload)
   */
  async getClassesSubjectHomework(): Promise<ClassWithHomeworkResponse[]> {
    return apiRequest<ClassWithHomeworkResponse[]>('/scan-and-mark/classes_subject_homework', {
      method: 'GET',
    });
  },

  /**
   * Get homework created by authenticated teacher
   */
  async getMyTeacherHomework(): Promise<TeacherHomeworkResponse[]> {
    return apiRequest<TeacherHomeworkResponse[]>('/homework/me/teacher', {
      method: 'GET',
    });
  },

  /**
   * Create homework for authenticated teacher and assign to classes
   */
  async createTeacherHomework(data: CreateTeacherHomeworkRequest): Promise<TeacherHomeworkResponse> {
    return apiRequest<TeacherHomeworkResponse>('/homework/me/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Re-assign homework to classes (multi-select)
   */
  async assignHomeworkToClasses(
    homeworkId: string,
    data: AssignHomeworkClassesRequest
  ): Promise<TeacherHomeworkResponse> {
    return apiRequest<TeacherHomeworkResponse>(`/homework/${homeworkId}/classes`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all classes
   */
  async getAllClasses(): Promise<ClassResponse[]> {
    return apiRequest<ClassResponse[]>('/class', {
      method: 'GET',
    });
  },

  /**
   * Get classes taught by authenticated teacher
   */
  async getMyTeacherClasses(): Promise<ClassResponse[]> {
    return apiRequest<ClassResponse[]>('/class/me/teacher', {
      method: 'GET',
    });
  },

  /**
   * Get grouped class management data for authenticated teacher
   */
  async getMyTeacherClassManagement(): Promise<ClassManagementResponse> {
    return apiRequest<ClassManagementResponse>('/class/me/teacher/management', {
      method: 'GET',
    });
  },

  /**
   * Get classes enrolled by authenticated student
   */
  async getMyStudentClasses(): Promise<ClassResponse[]> {
    return apiRequest<ClassResponse[]>('/class/me/student', {
      method: 'GET',
    });
  },

  /**
   * Get classroom details by id
   */
  async getClassById(classId: string): Promise<ClassroomDetailResponse> {
    return apiRequest<ClassroomDetailResponse>(`/class/${classId}`, {
      method: 'GET',
    });
  },

  /**
   * Get homework list under a classroom
   */
  async getClassHomework(classId: string): Promise<ClassroomHomeworkResponse[]> {
    return apiRequest<ClassroomHomeworkResponse[]>(`/class/${classId}/homework`, {
      method: 'GET',
    });
  },

  /**
   * Create homework under a classroom
   */
  async createClassHomework(classId: string, data: CreateClassHomeworkRequest): Promise<ClassroomHomeworkResponse> {
    return apiRequest<ClassroomHomeworkResponse>(`/class/${classId}/homework`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get students under a classroom
   */
  async getClassStudents(classId: string): Promise<ClassroomStudentResponse[]> {
    return apiRequest<ClassroomStudentResponse[]>(`/class/${classId}/students`, {
      method: 'GET',
    });
  },

  /**
   * Get available student candidates in teacher organization for a classroom
   */
  async getClassStudentCandidates(classId: string): Promise<ClassStudentCandidateResponse[]> {
    return apiRequest<ClassStudentCandidateResponse[]>(`/class/${classId}/students/candidates`, {
      method: 'GET',
    });
  },

  /**
   * Enroll a student into a classroom
   */
  async addClassStudent(classId: string, data: AddClassStudentRequest): Promise<ClassroomStudentResponse> {
    return apiRequest<ClassroomStudentResponse[]>(`/class/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((items) => items[0]);
  },

  /**
   * Enroll multiple students into a classroom
   */
  async addClassStudents(classId: string, data: AddClassStudentsRequest): Promise<ClassroomStudentResponse[]> {
    return apiRequest<ClassroomStudentResponse[]>(`/class/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get teachers under a classroom
   */
  async getClassTeachers(classId: string): Promise<ClassroomTeacherResponse[]> {
    return apiRequest<ClassroomTeacherResponse[]>(`/class/${classId}/teachers`, {
      method: 'GET',
    });
  },

  /**
   * Create class record
   */
  async createClass(data: CreateClassRequest): Promise<ClassResponse> {
    return apiRequest<ClassResponse>('/class', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
