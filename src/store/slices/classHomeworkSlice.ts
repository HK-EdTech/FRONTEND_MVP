import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  api,
  ClassroomHomeworkResponse,
  CreateClassHomeworkRequest,
} from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ClassHomeworkState {
  itemsByClassId: Record<string, ClassroomHomeworkResponse[]>;
  statusByClassId: Record<string, RequestStatus>;
  errorByClassId: Record<string, string | null>;
  createStatusByClassId: Record<string, RequestStatus>;
  createErrorByClassId: Record<string, string | null>;
}

const initialState: ClassHomeworkState = {
  itemsByClassId: {},
  statusByClassId: {},
  errorByClassId: {},
  createStatusByClassId: {},
  createErrorByClassId: {},
};

export const fetchClassHomework = createAsyncThunk<
  ClassroomHomeworkResponse[],
  string,
  { rejectValue: string }
>('classHomework/fetch', async (classId, { rejectWithValue }) => {
  try {
    return await api.getClassHomework(classId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load class homework');
  }
});

export const createClassHomework = createAsyncThunk<
  ClassroomHomeworkResponse,
  { classId: string; data: CreateClassHomeworkRequest },
  { rejectValue: string }
>('classHomework/create', async ({ classId, data }, { rejectWithValue }) => {
  try {
    return await api.createClassHomework(classId, data);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to create homework');
  }
});

const classHomeworkSlice = createSlice({
  name: 'classHomework',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassHomework.pending, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'loading';
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassHomework.fulfilled, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'succeeded';
        state.itemsByClassId[classId] = action.payload;
        state.errorByClassId[classId] = null;
      })
      .addCase(fetchClassHomework.rejected, (state, action) => {
        const classId = action.meta.arg;
        state.statusByClassId[classId] = 'failed';
        state.errorByClassId[classId] = action.payload || 'Failed to load class homework';
      })
      .addCase(createClassHomework.pending, (state, action) => {
        const classId = action.meta.arg.classId;
        state.createStatusByClassId[classId] = 'loading';
        state.createErrorByClassId[classId] = null;
      })
      .addCase(createClassHomework.fulfilled, (state, action) => {
        const classId = action.meta.arg.classId;
        const existing = state.itemsByClassId[classId] || [];
        state.itemsByClassId[classId] = [action.payload, ...existing];
        state.createStatusByClassId[classId] = 'succeeded';
        state.createErrorByClassId[classId] = null;
      })
      .addCase(createClassHomework.rejected, (state, action) => {
        const classId = action.meta.arg.classId;
        state.createStatusByClassId[classId] = 'failed';
        state.createErrorByClassId[classId] = action.payload || 'Failed to create homework';
      });
  },
});

export default classHomeworkSlice.reducer;
