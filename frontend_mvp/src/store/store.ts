import { configureStore } from '@reduxjs/toolkit';
import Homeworkcriteria_onetimeUploadReducer from './slices/homeworkCriteria_OnetimeUpload_slice';
import HomeworkCriteria_classReducer from './slices/homeworkCriteria_Class_slice';

export const store = configureStore({
  reducer: {
    Homeworkcriteria_onetimeUpload: Homeworkcriteria_onetimeUploadReducer,
    Homeworkcrieria_class: HomeworkCriteria_classReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
