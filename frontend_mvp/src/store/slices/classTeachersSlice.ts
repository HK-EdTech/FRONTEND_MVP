import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ClassroomTeacherResponse } from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ClassTeachersState {
  teachersByClassId: Record<string, ClassroomTeacherResponse[]>;
  statusByClassId: Record<string, RequestStatus>;
  errorByClassId: Record<string, string | null>;
}

const initialState: ClassTeachersState = {
  teachersByClassId: {},
  statusByClassId: {},
  errorByClassId: {},
};

export const fetchClassTeachers = createAsyncThunk<
  ClassroomTeacherResponse[],
  string,
  { rejectValue: string }
>('classTeachers/fetch', async (classId, { rejectWithValue }) => {
  try {
    return await api.getClassTeachers(classId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load teachers');
  }
});

const classTeachersSlice = createSlice({
  name: 'classTeachers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassTeachers.pending, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'loading';
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassTeachers.fulfilled, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'succeeded';
        state.teachersByClassId[classId] = action.payload;
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassTeachers.rejected, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'failed';
        state.errorByClassId[classId] = action.payload || 'Failed to load teachers';
      });
  },
});

export default classTeachersSlice.reducer;
