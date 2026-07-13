import { configureStore } from '@reduxjs/toolkit';
import Homeworkcriteria_onetimeUploadReducer from './slices/homeworkCriteria_OnetimeUpload_slice';
import HomeworkCriteria_classReducer from './slices/homeworkCriteria_Class_slice';
import ScanAndMark_homeworksubmissionsReducer from './slices/ScanAndMark_homeworksubmissions_slice';
import scanAndMark_statusGroupsReducer from './slices/scanAndMark_statusGroups_slice';
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
    ScanAndMark_homeworksubmissions: ScanAndMark_homeworksubmissionsReducer,
    scanAndMark_statusGroups: scanAndMark_statusGroupsReducer,
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
          'ScanAndMark_homeworksubmissions.submissionList',
          'Homeworkcriteria_onetimeUpload.markingSchemePdf_and_metadata',
          'Homeworkcrieria_class.markingSchemePdf_and_metadata',
        ],
        ignoredActions: [
          'ScanAndMark_homeworksubmissions/addSubmission',
          'ScanAndMark_homeworksubmissions/addSheetsToSubmission',
          'ScanAndMark_homeworksubmissions/reorderSheets',
          'Homeworkcriteria_onetimeUpload/setMarkingSchemePdf_and_metadata',
          'Homeworkcrieria_class/setMarkingSchemePdf_and_metadata',
          'ScanAndMark_homeworksubmissions/convertSubmissionsToPdfs/fulfilled',
          'ScanAndMark_homeworksubmissions/convertSubmissionsToPdfs/pending',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
