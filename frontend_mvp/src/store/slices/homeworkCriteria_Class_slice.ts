import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  className: '',
  subject: '',
  DbHomeworkId: null as string | null,
  markingSchemeFile: null as File | null,
  markingSchemeFileName: '',
  markingSchemeDocPath: '',
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
    setMarkingScheme(state, action: PayloadAction<{ file: File; fileName: string }>) {
      state.markingSchemeFile = action.payload.file;
      state.markingSchemeFileName = action.payload.fileName;
    },
    clearMarkingScheme(state) {
      state.markingSchemeFile = null;
      state.markingSchemeFileName = '';
    },
    setMarkingSchemeDocPath(state, action: PayloadAction<string>) {
      state.markingSchemeDocPath = action.payload;
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
  setMarkingScheme,
  clearMarkingScheme,
  setMarkingSchemeDocPath,
  resetAll,
} = homeworkCriteria_Class_slice.actions;

export default homeworkCriteria_Class_slice.reducer;
