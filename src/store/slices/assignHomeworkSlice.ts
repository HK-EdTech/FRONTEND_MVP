import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  api,
  AssignHomeworkClassesRequest,
  ClassResponse,
  CreateClassRequest,
  CreateTeacherHomeworkRequest,
  TeacherHomeworkResponse,
} from '@/lib/api';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AssignHomeworkState {
  classes: ClassResponse[];
  classesStatus: RequestStatus;
  classesError: string | null;
  homework: TeacherHomeworkResponse[];
  homeworkStatus: RequestStatus;
  homeworkError: string | null;
  createClassStatus: RequestStatus;
  createClassError: string | null;
  createHomeworkStatus: RequestStatus;
  createHomeworkError: string | null;
  assignHomeworkStatus: RequestStatus;
  assignHomeworkError: string | null;
}

const initialState: AssignHomeworkState = {
  classes: [],
  classesStatus: 'idle',
  classesError: null,
  homework: [],
  homeworkStatus: 'idle',
  homeworkError: null,
  createClassStatus: 'idle',
  createClassError: null,
  createHomeworkStatus: 'idle',
  createHomeworkError: null,
  assignHomeworkStatus: 'idle',
  assignHomeworkError: null,
};

export const fetchTeacherClasses = createAsyncThunk<
  ClassResponse[],
  void,
  { rejectValue: string }
>('assignHomework/fetchClasses', async (_, { rejectWithValue }) => {
  try {
    return await api.getMyTeacherClasses();
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load classes');
  }
});

export const fetchTeacherHomework = createAsyncThunk<
  TeacherHomeworkResponse[],
  void,
  { rejectValue: string }
>('assignHomework/fetchHomework', async (_, { rejectWithValue }) => {
  try {
    return await api.getMyTeacherHomework();
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to load homework');
  }
});

export const createClass = createAsyncThunk<
  ClassResponse,
  CreateClassRequest,
  { rejectValue: string }
>('assignHomework/createClass', async (payload, { rejectWithValue }) => {
  try {
    return await api.createClass(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to create class');
  }
});

export const createTeacherHomework = createAsyncThunk<
  TeacherHomeworkResponse,
  CreateTeacherHomeworkRequest,
  { rejectValue: string }
>('assignHomework/createHomework', async (payload, { rejectWithValue }) => {
  try {
    return await api.createTeacherHomework(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to create homework');
  }
});

export const assignHomeworkToClasses = createAsyncThunk<
  TeacherHomeworkResponse,
  { homeworkId: string; data: AssignHomeworkClassesRequest },
  { rejectValue: string }
>('assignHomework/assignHomework', async ({ homeworkId, data }, { rejectWithValue }) => {
  try {
    return await api.assignHomeworkToClasses(homeworkId, data);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to save homework assignment');
  }
});

const assignHomeworkSlice = createSlice({
  name: 'assignHomework',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherClasses.pending, (state) => {
        state.classesStatus = 'loading';
        state.classesError = null;
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.classesStatus = 'succeeded';
        state.classes = action.payload;
        state.classesError = null;
      })
      .addCase(fetchTeacherClasses.rejected, (state, action) => {
        state.classesStatus = 'failed';
        state.classes = [];
        state.classesError = action.payload || 'Failed to load classes';
      })
      .addCase(fetchTeacherHomework.pending, (state) => {
        state.homeworkStatus = 'loading';
        state.homeworkError = null;
      })
      .addCase(fetchTeacherHomework.fulfilled, (state, action) => {
        state.homeworkStatus = 'succeeded';
        state.homework = action.payload;
        state.homeworkError = null;
      })
      .addCase(fetchTeacherHomework.rejected, (state, action) => {
        state.homeworkStatus = 'failed';
        state.homework = [];
        state.homeworkError = action.payload || 'Failed to load homework';
      })
      .addCase(createClass.pending, (state) => {
        state.createClassStatus = 'loading';
        state.createClassError = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.createClassStatus = 'succeeded';
        state.classes = [action.payload, ...state.classes];
        state.createClassError = null;
      })
      .addCase(createClass.rejected, (state, action) => {
        state.createClassStatus = 'failed';
        state.createClassError = action.payload || 'Failed to create class';
      })
      .addCase(createTeacherHomework.pending, (state) => {
        state.createHomeworkStatus = 'loading';
        state.createHomeworkError = null;
      })
      .addCase(createTeacherHomework.fulfilled, (state, action) => {
        const existingIndex = state.homework.findIndex((item) => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.homework[existingIndex] = action.payload;
        } else {
          state.homework = [action.payload, ...state.homework];
        }
        state.createHomeworkStatus = 'succeeded';
        state.createHomeworkError = null;
      })
      .addCase(createTeacherHomework.rejected, (state, action) => {
        state.createHomeworkStatus = 'failed';
        state.createHomeworkError = action.payload || 'Failed to create homework';
      })
      .addCase(assignHomeworkToClasses.pending, (state) => {
        state.assignHomeworkStatus = 'loading';
        state.assignHomeworkError = null;
      })
      .addCase(assignHomeworkToClasses.fulfilled, (state, action) => {
        const existingIndex = state.homework.findIndex((item) => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.homework[existingIndex] = action.payload;
        } else {
          state.homework = [action.payload, ...state.homework];
        }
        state.assignHomeworkStatus = 'succeeded';
        state.assignHomeworkError = null;
      })
      .addCase(assignHomeworkToClasses.rejected, (state, action) => {
        state.assignHomeworkStatus = 'failed';
        state.assignHomeworkError = action.payload || 'Failed to save homework assignment';
      });
  },
});

export default assignHomeworkSlice.reducer;
