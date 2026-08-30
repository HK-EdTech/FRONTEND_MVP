import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { imagesToPdf } from '@/common/utility/imagesToPdf';
import { computeSha256 } from '@/common/utility/computeChecksum';

export type ConvertedPdf = {
  file: File;
  file_name: string;
  file_size: number;
  content_type: string;
  checksum: string;
};

export type UploadSubmission = {
  submission_id: string;          // client-generated id (`submission-${uuid}`), also the backend PK
  studentName: string;
  sheets: { id: string; file: File; thumbnail: string }[];
  createdAt: string;
  status_frontend: string;        // lifecycle position: prepare_upload -> uploading -> ocr
  err: 'uploading' | null;  // orthogonal failure flag (null = healthy)
  converted_pdf?: ConvertedPdf;   // saved after conversion; the source for create-records + upload
};

/**
 * Frontend status lifecycle expressed as DATA — read this to follow the flow without memorising it.
 * Each state maps an EVENT to a partial patch applied to the submission:
 *   - success events (DONE) move `status_frontend` forward;
 *   - failure events (FAIL) set `err` and leave `status_frontend` intact — failure is orthogonal to
 *     lifecycle position (a failed upload is still a Draft).
 * Branch by adding more events per state; add a new state by adding a key.
 */
export const FLOW_FRONTEND_STATUSES: Record<string, Record<string, Partial<UploadSubmission>>> = {
  prepare_upload: { DONE: { status_frontend: 'uploading' } },
  uploading:      { DONE: { status_frontend: 'ocr' }, FAIL: { err: 'uploading' } },
};

const initialState = {
  submissionList: [] as UploadSubmission[],
};

const ScanAndMark_homeworksubmissions_slice = createSlice({
  name: 'ScanAndMark_homeworksubmissions',
  initialState,
  reducers: {
    addSubmission: {
      reducer(state, action: PayloadAction<{
        submission_id: string;
        studentName: string;
        sheets: { id: string; file: File; thumbnail: string }[];
      }>) {
        console.log(`${action.payload.submission_id} has created and status is prepare_upload`);
        state.submissionList.push({
          ...action.payload,
          createdAt: new Date().toISOString(),
          status_frontend: 'prepare_upload',
          err: null,
        });
      },
      prepare(entry: { studentName: string; sheets: { id: string; file: File; thumbnail: string }[] }) {
        return { payload: { ...entry, submission_id: crypto.randomUUID() } };
      },
    },
    addSheetsToSubmission(state, action: PayloadAction<{
      submission_id: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) {
        s.sheets.push(...action.payload.sheets);
      }
    },
    reorderSheets(state, action: PayloadAction<{
      submission_id: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) {
        s.sheets = action.payload.sheets;
      }
    },
    deleteSubmission(state, action: PayloadAction<string>) {
      state.submissionList = state.submissionList.filter(x => x.submission_id !== action.payload);
    },
    deleteSheet(state, action: PayloadAction<{ submission_id: string; sheetId: string }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) {
        s.sheets = s.sheets.filter(sheet => sheet.id !== action.payload.sheetId);
      }
    },
    setStudentName(state, action: PayloadAction<{ submission_id: string; studentName: string }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) {
        s.studentName = action.payload.studentName;
      }
    },
    setStatus_frontend(state, action: PayloadAction<{ submission_id: string; status: string }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) {
        s.status_frontend = action.payload.status;
        console.log(`${action.payload.submission_id} status is ${action.payload.status}`);
      }
    },
    // Data-driven transition: apply a FLOW_FRONTEND_STATUSES event to a submission.
    // A submission carrying an err cannot move forward — it must be cleared (retry) first.
    transition(state, action: PayloadAction<{ submission_id: string; event: string }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (!s) return;
      if (action.payload.event === 'DONE' && s.err !== null) {
        console.log(`${action.payload.submission_id} DONE blocked at ${s.status_frontend}: err is ${s.err}`);
        return;
      }
      const patch = FLOW_FRONTEND_STATUSES[s.status_frontend]?.[action.payload.event];
      if (patch) {
        Object.assign(s, patch);
        console.log(`${action.payload.submission_id} --${action.payload.event}--> ${JSON.stringify(patch)}`);
      }
    },
    setConvertedPdf(state, action: PayloadAction<{ submission_id: string; converted_pdf: ConvertedPdf }>) {
      const s = state.submissionList.find(x => x.submission_id === action.payload.submission_id);
      if (s) s.converted_pdf = action.payload.converted_pdf;
    },
    resetAll() {
      return initialState;
    },
  },
});

// Per-file (allSettled): on success the PDF is SAVED onto its submission (converted_pdf); a failed
// conversion is flagged err. submissionIds = convert just those (retry); undefined = the whole list.
export const convertSubmissionsToPdfs = createAsyncThunk(
  'ScanAndMark_homeworksubmissions/convertSubmissionsToPdfs',
  async ({ submissionIds }: { homework_type: 'onetime' | 'class'; submissionIds?: string[] }, { getState, dispatch }) => {
    const state = getState() as { ScanAndMark_homeworksubmissions: { submissionList: UploadSubmission[] } };
    const all = state.ScanAndMark_homeworksubmissions.submissionList;
    const list = submissionIds ? all.filter(s => submissionIds.includes(s.submission_id)) : all;
    const settled = await Promise.allSettled(
      list.map(async (s, i) => {
        const name = s.studentName || `Student ${i + 1}`;
        const pdfFile = await imagesToPdf(s.sheets.map(sheet => sheet.file), `${name}.pdf`);
        const checksum = await computeSha256(pdfFile);
        dispatch(setConvertedPdf({
          submission_id: s.submission_id,
          converted_pdf: { file: pdfFile, file_name: pdfFile.name, file_size: pdfFile.size, content_type: 'application/pdf', checksum },
        }));
      })
    );
    settled.forEach((r, i) => {
      if (r.status === 'rejected') dispatch(transition({ submission_id: list[i].submission_id, event: 'FAIL' }));
    });
  }
);

// Shared retry — per-card Retry passes one id, "Retry all failed" passes many. Same reconcile flow.
export const retryUpload = createAsyncThunk(
  'ScanAndMark_homeworksubmissions/retryUpload',
  async (submissionIds: string[]) => {
    // TODO(backend pass): for each id, gather the submission (+ criteria + File), call api.retryUpload
    // (the reconcile endpoint), then run the per-item result — re-PUT the file if needed, then confirm.
    // On success clear err / advance the submission.
    console.log('retryUpload (stub):', submissionIds);
  },
);

export const {
  addSubmission,
  addSheetsToSubmission,
  reorderSheets,
  deleteSubmission,
  deleteSheet,
  setStudentName,
  setStatus_frontend,
  transition,
  setConvertedPdf,
  resetAll,
} = ScanAndMark_homeworksubmissions_slice.actions;

export default ScanAndMark_homeworksubmissions_slice.reducer;
