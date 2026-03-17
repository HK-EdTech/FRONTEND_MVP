import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ClassManagementResponse } from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ClassManagementState {
  groups: ClassManagementResponse;
  status: RequestStatus;
  error: string | null;
}

const initialState: ClassManagementState = {
  groups: [],
  status: 'idle',
  error: null,
};

export const fetchClassManagement = createAsyncThunk<
  ClassManagementResponse,
  void,
  { rejectValue: string }
>('classManagement/fetch', async (_, { rejectWithValue }) => {
  try {
    return await api.getMyTeacherClassManagement();
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load class management data.');
  }
});

const classManagementSlice = createSlice({
  name: 'classManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassManagement.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClassManagement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
        state.error = null;
      })
      .addCase(fetchClassManagement.rejected, (state, action) => {
        state.status = 'failed';
        state.groups = [];
        state.error = action.payload || 'Failed to load class management data.';
      });
  },
});

export default classManagementSlice.reducer;
