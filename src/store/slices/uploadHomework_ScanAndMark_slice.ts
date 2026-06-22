import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { imagesToPdf } from '@/common/utility/imagesToPdf';
import { computeSha256 } from '@/common/utility/computeChecksum';

export type UploadHomework = {
  id: string;
  studentName: string;
  sheets: { id: string; file: File; thumbnail: string }[];
  createdAt: string;
};

const initialState = {
  homeworkList: [] as UploadHomework[],
};

const uploadHomework_ScanAndMark_slice = createSlice({
  name: 'uploadHomework_ScanAndMark',
  initialState,
  reducers: {
    addHomework(state, action: PayloadAction<{
      id: string;
      studentName: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      state.homeworkList.push({
        ...action.payload,
        createdAt: new Date().toISOString(),
      });
    },
    addSheetsToHomework(state, action: PayloadAction<{
      homeworkId: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const hw = state.homeworkList.find(h => h.id === action.payload.homeworkId);
      if (hw) {
        hw.sheets.push(...action.payload.sheets);
      }
    },
    reorderSheets(state, action: PayloadAction<{
      homeworkId: string;
      sheets: { id: string; file: File; thumbnail: string }[];
    }>) {
      const hw = state.homeworkList.find(h => h.id === action.payload.homeworkId);
      if (hw) {
        hw.sheets = action.payload.sheets;
      }
    },
    deleteHomework(state, action: PayloadAction<string>) {
      state.homeworkList = state.homeworkList.filter(h => h.id !== action.payload);
    },
    deleteSheet(state, action: PayloadAction<{ homeworkId: string; sheetId: string }>) {
      const hw = state.homeworkList.find(h => h.id === action.payload.homeworkId);
      if (hw) {
        hw.sheets = hw.sheets.filter(s => s.id !== action.payload.sheetId);
      }
    },
    setStudentName(state, action: PayloadAction<{ homeworkId: string; studentName: string }>) {
      const hw = state.homeworkList.find(h => h.id === action.payload.homeworkId);
      if (hw) {
        hw.studentName = action.payload.studentName;
      }
    },
    resetAll() {
      return initialState;
    },
  },
});

export const convertHomeworkToPdfs = createAsyncThunk(
  'uploadHomework_ScanAndMark/convertHomeworkToPdfs',
  async (homework_type: 'onetime' | 'class', { getState, dispatch }) => {
    const state = getState() as { uploadHomework_ScanAndMark: { homeworkList: UploadHomework[] } };
    const homeworkList = state.uploadHomework_ScanAndMark.homeworkList;
    // CPU-bound work — Promise.all gives no speed benefit here (single-threaded).
    // For large batches (100+ pages), consider Web Worker pool for true parallelism.
    const pdfs = await Promise.all(
      homeworkList.map(async (hw, i) => {
        const name = hw.studentName || `Student ${i + 1}`;
        const pdfFile = await imagesToPdf(hw.sheets.map(s => s.file), `${name}.pdf`);
        const checksum = await computeSha256(pdfFile);
        return { file: pdfFile, file_name: pdfFile.name, file_size: pdfFile.size, content_type: 'application/pdf', checksum, student_name: name };
      })
    );
    if (homework_type === 'onetime') {
      const { setHomeworkPdfs_and_metadata } = await import('./homeworkCriteria_OnetimeUpload_slice');
      dispatch(setHomeworkPdfs_and_metadata(pdfs));
    } else {
      const { setHomeworkPdfs_and_metadata } = await import('./homeworkCriteria_Class_slice');
      dispatch(setHomeworkPdfs_and_metadata(pdfs));
    }
    return pdfs;
  }
);

export const {
  addHomework,
  addSheetsToHomework,
  reorderSheets,
  deleteHomework,
  deleteSheet,
  setStudentName,
  resetAll,
} = uploadHomework_ScanAndMark_slice.actions;

export default uploadHomework_ScanAndMark_slice.reducer;
