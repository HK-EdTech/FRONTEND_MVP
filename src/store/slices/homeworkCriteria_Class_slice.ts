import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MarkingSchemePdfEntry = {
  file: File | null;
  file_name: string;
  file_size: number;
  content_type: string;
  checksum: string;
};

const initialState = {
  className: '',
  subject: '',
  DbHomeworkId: null as string | null,
  markingSchemePdf_and_metadata: {
    file: null as File | null,
    file_name: '',
    file_size: 0,
    content_type: '',
    checksum: '',
  },
};

const homeworkCriteria_Class_slice = createSlice({
  name: 'Homeworkcrieria_class',
  initialState,
  reducers: {
    setClassName(state, action: PayloadAction<string>) {
      state.className = action.payload;
      state.subject = '';
      state.DbHomeworkId = null;
    },
    setSubject(state, action: PayloadAction<string>) {
      state.subject = action.payload;
      state.DbHomeworkId = null;
    },
    setDbHomeworkId(state, action: PayloadAction<string | null>) {
      state.DbHomeworkId = action.payload;
    },
    setMarkingSchemePdf_and_metadata(state, action: PayloadAction<MarkingSchemePdfEntry>) {
      state.markingSchemePdf_and_metadata = action.payload;
    },
    clearMarkingSchemePdf_and_metadata(state) {
      state.markingSchemePdf_and_metadata = { file: null, file_name: '', file_size: 0, content_type: '', checksum: '' };
    },
    resetAll() {
      return initialState;
    },
  },
});

export const {
  setClassName,
  setSubject,
  setDbHomeworkId,
  setMarkingSchemePdf_and_metadata,
  clearMarkingSchemePdf_and_metadata,
  resetAll,
} = homeworkCriteria_Class_slice.actions;

export default homeworkCriteria_Class_slice.reducer;
