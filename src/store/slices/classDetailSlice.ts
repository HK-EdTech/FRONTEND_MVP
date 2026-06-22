import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ClassroomDetailResponse } from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ClassDetailState {
  entities: Record<string, ClassroomDetailResponse>;
  statusById: Record<string, RequestStatus>;
  errorById: Record<string, string | null>;
}

const initialState: ClassDetailState = {
  entities: {},
  statusById: {},
  errorById: {},
};

export const fetchClassDetail = createAsyncThunk<
  ClassroomDetailResponse,
  string,
  { rejectValue: string }
>('classDetail/fetch', async (classId, { rejectWithValue }) => {
  try {
    return await api.getClassById(classId);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load classroom details');
  }
});

const classDetailSlice = createSlice({
  name: 'classDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassDetail.pending, (state, action) => {
        const classId = action.meta.arg;
        state.statusById[classId] = 'loading';
        state.errorById[classId] = null;
      })
      .addCase(fetchClassDetail.fulfilled, (state, action) => {
        const classId = action.meta.arg;
        state.entities[classId] = action.payload;
        state.statusById[classId] = 'succeeded';
        state.errorById[classId] = null;
      })
      .addCase(fetchClassDetail.rejected, (state, action) => {
        const classId = action.meta.arg;
        state.statusById[classId] = 'failed';
        state.errorById[classId] = action.payload || 'Failed to load classroom details';
      });
  },
});

export default classDetailSlice.reducer;
