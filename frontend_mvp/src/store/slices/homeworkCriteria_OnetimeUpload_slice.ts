import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  selectedLevel: '',
  selectedOneTimeSubject: '',
  markingSchemeFile: null as File | null,
  markingSchemeFileName: '',
  markingSchemeFilePath: '',
};

const homeworkCriteria_OnetimeUpload_slice = createSlice({
  name: 'Homeworkcriteria_onetimeUpload',
  initialState,
  reducers: {
    setSelectedLevel(state, action: PayloadAction<string>) {
      state.selectedLevel = action.payload;
    },
    setSelectedOneTimeSubject(state, action: PayloadAction<string>) {
      state.selectedOneTimeSubject = action.payload;
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
      state.markingSchemeFilePath = action.payload;
    },
    resetAll() {
      return initialState;
    },
  },
});

export const {
  setSelectedLevel,
  setSelectedOneTimeSubject,
  setMarkingScheme,
  clearMarkingScheme,
  setMarkingSchemeDocPath,
  resetAll,
} = homeworkCriteria_OnetimeUpload_slice.actions;

export default homeworkCriteria_OnetimeUpload_slice.reducer;
