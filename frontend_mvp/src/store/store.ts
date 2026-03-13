import { configureStore } from '@reduxjs/toolkit';
import Homeworkcriteria_onetimeUploadReducer from './slices/homeworkCriteria_OnetimeUpload_slice';
import HomeworkCriteria_classReducer from './slices/homeworkCriteria_Class_slice';
import uploadHomework_ScanAndMarkReducer from './slices/uploadHomework_ScanAndMark_slice';

export const store = configureStore({
  reducer: {
    Homeworkcriteria_onetimeUpload: Homeworkcriteria_onetimeUploadReducer,
    Homeworkcrieria_class: HomeworkCriteria_classReducer,
    uploadHomework_ScanAndMark: uploadHomework_ScanAndMarkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          'uploadHomework_ScanAndMark.homeworkList',
          'Homeworkcriteria_onetimeUpload.markingSchemeFile',
          'Homeworkcrieria_class.markingSchemeFile',
        ],
        ignoredActions: [
          'uploadHomework_ScanAndMark/addHomework',
          'uploadHomework_ScanAndMark/addSheetsToHomework',
          'uploadHomework_ScanAndMark/reorderSheets',
          'Homeworkcriteria_onetimeUpload/setMarkingScheme',
          'Homeworkcrieria_class/setMarkingScheme',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
