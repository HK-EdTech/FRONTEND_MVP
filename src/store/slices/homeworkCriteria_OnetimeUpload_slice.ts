import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    status_frontend: '',
    marking_scheme_id: null as string | null,
  },
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
      state.markingSchemePdf_and_metadata = {
        ...action.payload,
        status_frontend: 'prepare_upload',
        marking_scheme_id: null,
      };
      console.log(`marking scheme ${action.payload.file_name} added and status is prepare_upload`);
    },
    clearMarkingSchemePdf_and_metadata(state) {
      state.markingSchemePdf_and_metadata = { file: null, file_name: '', file_size: 0, content_type: '', checksum: '', status_frontend: '', marking_scheme_id: null };
    },
    setMarkingSchemeStatus_frontend(state, action: PayloadAction<string>) {
      state.markingSchemePdf_and_metadata.status_frontend = action.payload;
      console.log(`marking scheme status is ${action.payload}`);
    },
    setMarkingSchemeId(state, action: PayloadAction<string>) {
      state.markingSchemePdf_and_metadata.marking_scheme_id = action.payload;
      console.log(`marking scheme marking_scheme_id is ${action.payload}`);
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
  setMarkingSchemeStatus_frontend,
  setMarkingSchemeId,
  resetAll,
} = homeworkCriteria_OnetimeUpload_slice.actions;

export default homeworkCriteria_OnetimeUpload_slice.reducer;
