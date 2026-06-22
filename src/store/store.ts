import { configureStore } from '@reduxjs/toolkit';
import Homeworkcriteria_onetimeUploadReducer from './slices/homeworkCriteria_OnetimeUpload_slice';
import HomeworkCriteria_classReducer from './slices/homeworkCriteria_Class_slice';
import uploadHomework_ScanAndMarkReducer from './slices/uploadHomework_ScanAndMark_slice';
import classManagementReducer from './slices/classManagementSlice';
import classDetailReducer from './slices/classDetailSlice';
import classHomeworkReducer from './slices/classHomeworkSlice';
import classStudentsReducer from './slices/classStudentsSlice';
import classTeachersReducer from './slices/classTeachersSlice';
import homeworkSubmissionsReducer from './slices/homeworkSubmissionsSlice';
import assignHomeworkReducer from './slices/assignHomeworkSlice';

export const store = configureStore({
  reducer: {
    Homeworkcriteria_onetimeUpload: Homeworkcriteria_onetimeUploadReducer,
    Homeworkcrieria_class: HomeworkCriteria_classReducer,
    uploadHomework_ScanAndMark: uploadHomework_ScanAndMarkReducer,
    classManagement: classManagementReducer,
    classDetail: classDetailReducer,
    classHomework: classHomeworkReducer,
    classStudents: classStudentsReducer,
    classTeachers: classTeachersReducer,
    homeworkSubmissions: homeworkSubmissionsReducer,
    assignHomework: assignHomeworkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          'uploadHomework_ScanAndMark.homeworkList',
          'Homeworkcriteria_onetimeUpload.markingSchemePdf_and_metadata',
          'Homeworkcrieria_class.markingSchemePdf_and_metadata',
          'Homeworkcriteria_onetimeUpload.homeworkPdfs_and_metadata',
          'Homeworkcrieria_class.homeworkPdfs_and_metadata',
        ],
        ignoredActions: [
          'uploadHomework_ScanAndMark/addHomework',
          'uploadHomework_ScanAndMark/addSheetsToHomework',
          'uploadHomework_ScanAndMark/reorderSheets',
          'Homeworkcriteria_onetimeUpload/setMarkingSchemePdf_and_metadata',
          'Homeworkcrieria_class/setMarkingSchemePdf_and_metadata',
          'uploadHomework_ScanAndMark/convertHomeworkToPdfs/fulfilled',
          'uploadHomework_ScanAndMark/convertHomeworkToPdfs/pending',
          'Homeworkcriteria_onetimeUpload/setHomeworkPdfs_and_metadata',
          'Homeworkcrieria_class/setHomeworkPdfs_and_metadata',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
