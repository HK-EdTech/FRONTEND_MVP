import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  api,
  ClassStudentCandidateResponse,
  ClassroomStudentResponse,
} from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ClassStudentsState {
  studentsByClassId: Record<string, ClassroomStudentResponse[]>;
  statusByClassId: Record<string, RequestStatus>;
  errorByClassId: Record<string, string | null>;
  candidatesByClassId: Record<string, ClassStudentCandidateResponse[]>;
  candidateStatusByClassId: Record<string, RequestStatus>;
  candidateErrorByClassId: Record<string, string | null>;
  addStatusByClassId: Record<string, RequestStatus>;
  addErrorByClassId: Record<string, string | null>;
}

const initialState: ClassStudentsState = {
  studentsByClassId: {},
  statusByClassId: {},
  errorByClassId: {},
  candidatesByClassId: {},
  candidateStatusByClassId: {},
  candidateErrorByClassId: {},
  addStatusByClassId: {},
  addErrorByClassId: {},
};

export const fetchClassStudents = createAsyncThunk<
  ClassroomStudentResponse[],
  string,
  { rejectValue: string }
>('classStudents/fetch', async (classId, { rejectWithValue }) => {
  try {
    return await api.getClassStudents(classId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load students');
  }
});

export const fetchCandidateStudents = createAsyncThunk<
  ClassStudentCandidateResponse[],
  string,
  { rejectValue: string }
>('classStudents/fetchCandidates', async (classId, { rejectWithValue }) => {
  try {
    return await api.getClassStudentCandidates(classId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load available students');
  }
});

export const addClassStudents = createAsyncThunk<
  ClassroomStudentResponse[],
  { classId: string; studentIds: string[] },
  { rejectValue: string }
>('classStudents/add', async ({ classId, studentIds }, { rejectWithValue }) => {
  try {
    return await api.addClassStudents(classId, { student_ids: studentIds });
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to add students');
  }
});

const classStudentsSlice = createSlice({
  name: 'classStudents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassStudents.pending, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'loading';
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassStudents.fulfilled, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'succeeded';
        state.studentsByClassId[classId] = action.payload;
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassStudents.rejected, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'failed';
        state.errorByClassId[classId] = action.payload || 'Failed to load students';
      })
      .addCase(fetchCandidateStudents.pending, (state, action) => {
        const classId = action.meta.arg;
        state.candidateStatusByClassId[classId] = 'loading';
        state.candidateErrorByClassId[classId] = null;
      })
      .addCase(fetchCandidateStudents.fulfilled, (state, action) => {
        const classId = action.meta.arg;
        state.candidateStatusByClassId[classId] = 'succeeded';
        state.candidatesByClassId[classId] = action.payload;
        state.candidateErrorByClassId[classId] = null;
      })
      .addCase(fetchCandidateStudents.rejected, (state, action) => {
        const classId = action.meta.arg;
        state.candidateStatusByClassId[classId] = 'failed';
        state.candidateErrorByClassId[classId] = action.payload || 'Failed to load available students';
      })
      .addCase(addClassStudents.pending, (state, action) => {
        const classId = action.meta.arg.classId;
        state.addStatusByClassId[classId] = 'loading';
        state.addErrorByClassId[classId] = null;
      })
      .addCase(addClassStudents.fulfilled, (state, action) => {
        const classId = action.meta.arg.classId;
        const existing = state.studentsByClassId[classId] || [];
        const existingIds = new Set(existing.map((student) => student.id));
        const nextItems = action.payload.filter((student) => !existingIds.has(student.id));
        state.studentsByClassId[classId] = [...nextItems, ...existing];
        state.addStatusByClassId[classId] = 'succeeded';
        state.addErrorByClassId[classId] = null;
      })
      .addCase(addClassStudents.rejected, (state, action) => {
        const classId = action.meta.arg.classId;
        state.addStatusByClassId[classId] = 'failed';
        state.addErrorByClassId[classId] = action.payload || 'Failed to add students';
      });
  },
});

export default classStudentsSlice.reducer;
