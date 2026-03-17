import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
