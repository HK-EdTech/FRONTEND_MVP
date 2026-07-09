import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { imagesToPdf } from '@/common/utility/imagesToPdf';
import { computeSha256 } from '@/common/utility/computeChecksum';

export type UploadSubmission = {
  id: string;
  studentName: string;
  sheets: { id: string; file: File; thumbnail: string }[];
  createdAt: string;
};

const initialState = {
  submissionList: [] as UploadSubmission[],
};

const ScanAndMark_homeworksubmissions_slice = createSlice({
  name: 'ScanAndMark_homeworksubmissions',
  initialState,
  reducers: {
    addSubmission(state, action: PayloadAction<{
      id: string;
      studentName: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      state.submissionList.push({
        ...action.payload,
        createdAt: new Date().toISOString(),
      });
    },
    addSheetsToSubmission(state, action: PayloadAction<{
      id: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const s = state.submissionList.find(x => x.id === action.payload.id);
      if (s) {
        s.sheets.push(...action.payload.sheets);
      }
    },
    reorderSheets(state, action: PayloadAction<{
      id: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const s = state.submissionList.find(x => x.id === action.payload.id);
      if (s) {
        s.sheets = action.payload.sheets;
      }
    },
    deleteSubmission(state, action: PayloadAction<string>) {
      state.submissionList = state.submissionList.filter(x => x.id !== action.payload);
    },
    deleteSheet(state, action: PayloadAction<{ id: string; sheetId: string }>) {
      const s = state.submissionList.find(x => x.id === action.payload.id);
      if (s) {
        s.sheets = s.sheets.filter(sheet => sheet.id !== action.payload.sheetId);
      }
    },
    setStudentName(state, action: PayloadAction<{ id: string; studentName: string }>) {
      const s = state.submissionList.find(x => x.id === action.payload.id);
      if (s) {
        s.studentName = action.payload.studentName;
      }
    },
    resetAll() {
      return initialState;
    },
  },
});

export const convertSubmissionsToPdfs = createAsyncThunk(
  'ScanAndMark_homeworksubmissions/convertSubmissionsToPdfs',
  async (homework_type: 'onetime' | 'class', { getState }) => {
    const state = getState() as { ScanAndMark_homeworksubmissions: { submissionList: UploadSubmission[] } };
    const submissionList = state.ScanAndMark_homeworksubmissions.submissionList;
    // CPU-bound work — Promise.all gives no speed benefit here (single-threaded).
    // For large batches (100+ pages), consider Web Worker pool for true parallelism.
    // PDFs are returned only (not stored in Redux): the criteria slice never read them,
    // and keeping the File objects in state kept a second copy of every PDF alive.
    const pdfs = await Promise.all(
      submissionList.map(async (s, i) => {
        const name = s.studentName || `Student ${i + 1}`;
        const pdfFile = await imagesToPdf(s.sheets.map(sheet => sheet.file), `${name}.pdf`);
        const checksum = await computeSha256(pdfFile);
        return { file: pdfFile, file_name: pdfFile.name, file_size: pdfFile.size, content_type: 'application/pdf', checksum, student_name: name };
      })
    );
    return pdfs;
  }
);

export const {
  addSubmission,
  addSheetsToSubmission,
  reorderSheets,
  deleteSubmission,
  deleteSheet,
  setStudentName,
  resetAll,
} = ScanAndMark_homeworksubmissions_slice.actions;

export default ScanAndMark_homeworksubmissions_slice.reducer;
