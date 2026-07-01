import { api } from './api';

/**
 * Move a submission (and its homework) to the 'ocr' phase.
 *
 * Backend: confirms the submission upload, which sets the submission and its homework
 * status to 'ocr'.
 * Frontend: business logic for the frontend status update to be added later.
 */
export async function set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr(
  submissionId: string,
): Promise<void> {
  // backend — move this submission (and its homework) to 'ocr'
  await api.confirm_submission_upload(submissionId);

  // TODO: frontend status update business logic here
}
