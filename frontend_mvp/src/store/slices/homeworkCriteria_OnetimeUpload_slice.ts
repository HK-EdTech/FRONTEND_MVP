import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HomeworkPdfEntry = {
  file: File;
  file_name: string;
  file_size: number;
  content_type: string;
  checksum: string;
  student_name: string;
};

export type MarkingSchemePdfEntry = {
  file: File | null;
  file_name: string;
  file_size: number;
  content_type: string;
  checksum: string;
};

const initialState = {
  selectedLevel: '',
  selectedOneTimeSubject: '',
  homeworkTitle: '',
  markingSchemePdf_and_metadata: {
    file: null as File | null,
    file_name: '',
    file_size: 0,
    content_type: '',
    checksum: '',
  },
  homeworkPdfs_and_metadata: [] as HomeworkPdfEntry[],
};

const homeworkCriteria_OnetimeUpload_slice = createSlice({
  name: 'Homeworkcriteria_onetimeUpload',
  initialState,
  reducers: {
    setHomeworkTitle(state, action: PayloadAction<string>) {
      state.homeworkTitle = action.payload;
    },
    setSelectedLevel(state, action: PayloadAction<string>) {
      state.selectedLevel = action.payload;
    },
    setSelectedOneTimeSubject(state, action: PayloadAction<string>) {
      state.selectedOneTimeSubject = action.payload;
    },
    setMarkingSchemePdf_and_metadata(state, action: PayloadAction<MarkingSchemePdfEntry>) {
      state.markingSchemePdf_and_metadata = action.payload;
    },
    clearMarkingSchemePdf_and_metadata(state) {
      state.markingSchemePdf_and_metadata = { file: null, file_name: '', file_size: 0, content_type: '', checksum: '' };
    },
    setHomeworkPdfs_and_metadata(state, action: PayloadAction<HomeworkPdfEntry[]>) {
      state.homeworkPdfs_and_metadata = action.payload;
    },
    resetAll() {
      return initialState;
    },
  },
});

export const {
  setHomeworkTitle,
  setSelectedLevel,
  setSelectedOneTimeSubject,
  setMarkingSchemePdf_and_metadata,
  clearMarkingSchemePdf_and_metadata,
  setHomeworkPdfs_and_metadata,
  resetAll,
} = homeworkCriteria_OnetimeUpload_slice.actions;

export default homeworkCriteria_OnetimeUpload_slice.reducer;
