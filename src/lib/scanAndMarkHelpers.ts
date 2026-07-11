import { api } from './api';
import { setStatus_frontend } from '@/store/slices/ScanAndMark_homeworksubmissions_slice';
import { setMarkingSchemeStatus_frontend } from '@/store/slices/homeworkCriteria_OnetimeUpload_slice';
import type { AppDispatch } from '@/store/store';

/**
 * Move a submission (and its homework) to the 'ocr' phase.
 *
 * Backend: confirms the submission upload, which sets the submission and its homework
 * status to 'ocr'.
 * Frontend: sets the local submission's status_frontend to 'ocr' (found by its client id).
 */
export async function set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr(
  submissionId: string,
  clientId: string,
  dispatch: AppDispatch,
): Promise<void> {
  // backend — move this submission (and its homework) to 'ocr'
  await api.confirm_submission_upload(submissionId);

  // frontend — mark this submission 'ocr' locally
  dispatch(setStatus_frontend({ id: clientId, status: 'ocr' }));
}

/**
 * Move the marking scheme to the 'ocr' phase.
 *
 * Backend: confirms the marking scheme upload (sets its status to 'ocr').
 * Frontend: sets the marking scheme's status_frontend to 'ocr'.
 */
export async function set_frontend_and_backend_status_of_marking_scheme_to_ocr(
  markingSchemeId: string,
  dispatch: AppDispatch,
): Promise<void> {
  // backend — move this marking scheme to 'ocr'
  await api.confirm_marking_scheme_upload(markingSchemeId);

  // frontend — mark the marking scheme 'ocr' locally
  dispatch(setMarkingSchemeStatus_frontend('ocr'));
}
