import {
  ClassroomDetailResponse,
  ClassroomHomeworkResponse,
  ClassroomStudentResponse,
  ClassroomTeacherResponse,
} from '@/lib/api';

export const getMockClassroomDetail = (classId: string): ClassroomDetailResponse => ({
  id: classId,
  name: classId === 'demo-sec4-science' ? 'Sec 4 Science' : `Class ${classId.slice(0, 6).toUpperCase()}`,
  subject: 'Science',
  target_level: 'Secondary 4',
  organization_id: 'mock-org-1',
  organization_name: 'HK Learning Academy',
  teacher_id: 'mock-teacher-1',
  teacher_name: 'Ms. Wong',
  num_students: 28,
  created_at: '2026-02-01T00:00:00.000Z',
});

export const mockHomeworkItems: ClassroomHomeworkResponse[] = [
  {
    id: 'hw-1',
    title: 'Math Exercise 2',
    subject: 'Mathematics',
    class_id: 'mock-class-1',
    due_date: '2026-02-28T00:00:00.000Z',
    assigned_students: 28,
    created_at: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'hw-2',
    title: 'English Essay 1',
    subject: 'English',
    class_id: 'mock-class-1',
    due_date: '2026-03-02T00:00:00.000Z',
    assigned_students: 26,
    created_at: '2026-02-16T00:00:00.000Z',
  },
  {
    id: 'hw-3',
    title: 'Chem Lab Worksheet',
    subject: 'Chemistry',
    class_id: 'mock-class-1',
    due_date: '2026-03-05T00:00:00.000Z',
    assigned_students: 30,
    created_at: '2026-02-17T00:00:00.000Z',
  },
  {
    id: 'hw-4',
    title: 'History Source Analysis',
    subject: 'History',
    class_id: 'mock-class-1',
    due_date: '2026-03-06T00:00:00.000Z',
    assigned_students: 27,
    created_at: '2026-02-18T00:00:00.000Z',
  },
  {
    id: 'hw-5',
    title: 'Sec 4 Science Quiz',
    subject: 'Science',
    class_id: 'mock-class-1',
    due_date: '2026-03-10T00:00:00.000Z',
    assigned_students: 29,
    created_at: '2026-02-19T00:00:00.000Z',
  },
];

export const mockStudents: ClassroomStudentResponse[] = [
  { id: 'stu-1', full_name: 'Chan Ka Ming', username: 'kaming', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-10T00:00:00.000Z' },
  { id: 'stu-2', full_name: 'Lee Wing Yan', username: 'wingyan', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-11T00:00:00.000Z' },
  { id: 'stu-3', full_name: 'Ho Tsz Ching', username: 'tszching', avatar_url: null, class_level: 'F.4', status: 'inactive', enrolled_at: '2026-01-12T00:00:00.000Z' },
  { id: 'stu-4', full_name: 'Ng Chi Ho', username: 'chiho', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-13T00:00:00.000Z' },
  { id: 'stu-5', full_name: 'Wong Tsz Hei', username: 'tszhei', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-14T00:00:00.000Z' },
  { id: 'stu-6', full_name: 'Lau Ka Chun', username: 'kachun', avatar_url: null, class_level: 'F.4', status: 'pending', enrolled_at: '2026-01-15T00:00:00.000Z' },
  { id: 'stu-7', full_name: 'Cheung Hoi Lam', username: 'hoilam', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-16T00:00:00.000Z' },
  { id: 'stu-8', full_name: 'Yip Pui Yu', username: 'puiyu', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-17T00:00:00.000Z' },
  { id: 'stu-9', full_name: 'Leung Chun Kit', username: 'chunkit', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-18T00:00:00.000Z' },
  { id: 'stu-10', full_name: 'Kwok Ho Yin', username: 'hoyin', avatar_url: null, class_level: 'F.4', status: 'inactive', enrolled_at: '2026-01-19T00:00:00.000Z' },
  { id: 'stu-11', full_name: 'Tam Sze Wa', username: 'szewa', avatar_url: null, class_level: 'F.4', status: 'active', enrolled_at: '2026-01-20T00:00:00.000Z' },
  { id: 'stu-12', full_name: 'Fung Ka Lok', username: 'kalok', avatar_url: null, class_level: 'F.4', status: 'pending', enrolled_at: '2026-01-21T00:00:00.000Z' },
];

export const mockTeachers: ClassroomTeacherResponse[] = [
  {
    id: 'teacher-1',
    full_name: 'Ms. Wong',
    username: 'mswong',
    avatar_url: null,
    bio: 'Class teacher',
  },
  {
    id: 'teacher-2',
    full_name: 'Mr. Chan',
    username: 'mrchan',
    avatar_url: null,
    bio: 'Teaching assistant',
  },
];
