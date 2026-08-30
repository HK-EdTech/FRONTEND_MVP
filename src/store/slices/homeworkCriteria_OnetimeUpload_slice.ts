import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MarkingSchemePdfEntry = {
  file: File | null;
  file_name: string;
  file_size: number;
  content_type: string;
  checksum: string;
};

type MarkingSchemePatch = { status_frontend?: string; err?: 'uploading' | null };
export const FLOW_MARKING_SCHEME_STATUSES: Record<string, Record<string, MarkingSchemePatch>> = {
  prepare_upload: { DONE: { status_frontend: 'uploading' } },
  uploading:      { DONE: { status_frontend: 'ocr' }, FAIL: { err: 'uploading' } },
};

const initialState = {
  homework_id: null as string | null,   // client-generated PK for this draft homework; stable across
                                         // retries (generated once, reused), cleared by resetAll
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
    err: null as 'uploading' | null,
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
    setMarkingSchemePdf_and_metadata: {
      reducer(state, action: PayloadAction<MarkingSchemePdfEntry & { marking_scheme_id: string }>) {
        state.markingSchemePdf_and_metadata = {
          ...action.payload,
          status_frontend: 'prepare_upload',
          err: null,
        };
        console.log(`marking scheme ${action.payload.file_name} added and status is prepare_upload`);
      },
      prepare(entry: MarkingSchemePdfEntry) {
        return { payload: { ...entry, marking_scheme_id: crypto.randomUUID() } };
      },
    },
    clearMarkingSchemePdf_and_metadata(state) {
      state.markingSchemePdf_and_metadata = { file: null, file_name: '', file_size: 0, content_type: '', checksum: '', status_frontend: '', marking_scheme_id: null, err: null };
    },
    setMarkingSchemeStatus_frontend(state, action: PayloadAction<string>) {
      state.markingSchemePdf_and_metadata.status_frontend = action.payload;
      console.log(`marking scheme status is ${action.payload}`);
    },
    setHomeworkId(state, action: PayloadAction<string>) {
      state.homework_id = action.payload;
      console.log(`homework_id is ${action.payload}`);
    },
    // A marking scheme carrying an err cannot move forward — it must be cleared (retry) first.
    transitionMarkingScheme(state, action: PayloadAction<{ event: string }>) {
      const ms = state.markingSchemePdf_and_metadata;
      if (action.payload.event === 'DONE' && ms.err !== null) {
        console.log(`marking scheme DONE blocked at ${ms.status_frontend}: err is ${ms.err}`);
        return;
      }
      const patch = FLOW_MARKING_SCHEME_STATUSES[ms.status_frontend]?.[action.payload.event];
      if (patch) {
        Object.assign(ms, patch);
        console.log(`marking scheme --${action.payload.event}--> ${JSON.stringify(patch)}`);
      }
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
  setHomeworkId,
  transitionMarkingScheme,
  resetAll,
} = homeworkCriteria_OnetimeUpload_slice.actions;

export default homeworkCriteria_OnetimeUpload_slice.reducer;
