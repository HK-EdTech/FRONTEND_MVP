import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ClassHomeworkSubmissionResponse } from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface HomeworkSubmissionsState {
  rowsByKey: Record<string, ClassHomeworkSubmissionResponse[]>;
  statusByKey: Record<string, RequestStatus>;
  errorByKey: Record<string, string | null>;
}

const initialState: HomeworkSubmissionsState = {
  rowsByKey: {},
  statusByKey: {},
  errorByKey: {},
};

const buildKey = (classId: string, homeworkId: string) => `${classId}:${homeworkId}`;

export const fetchHomeworkSubmissions = createAsyncThunk<
  ClassHomeworkSubmissionResponse[],
  { classId: string; homeworkId: string },
  { rejectValue: string }
>('homeworkSubmissions/fetch', async ({ classId, homeworkId }, { rejectWithValue }) => {
  try {
    return await api.getClassHomeworkSubmissions(classId, homeworkId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load homework submissions');
  }
});

const homeworkSubmissionsSlice = createSlice({
  name: 'homeworkSubmissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeworkSubmissions.pending, (state, action) => {
        const key = buildKey(action.meta.arg.classId, action.meta.arg.homeworkId);
        state.statusByKey[key] = 'loading';
        state.errorByKey[key] = null;
      })
      .addCase(fetchHomeworkSubmissions.fulfilled, (state, action) => {
        const key = buildKey(action.meta.arg.classId, action.meta.arg.homeworkId);
        state.statusByKey[key] = 'succeeded';
        state.rowsByKey[key] = action.payload;
        state.errorByKey[key] = null;
      })
      .addCase(fetchHomeworkSubmissions.rejected, (state, action) => {
        const key = buildKey(action.meta.arg.classId, action.meta.arg.homeworkId);
        state.statusByKey[key] = 'failed';
        state.errorByKey[key] = action.payload || 'Failed to load homework submissions';
      });
  },
});

export default homeworkSubmissionsSlice.reducer;
