'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { glassStyle } from '@/components/Scan_and_mark/Scan_and_upload/ScanHomework_component';
import { convertHomeworkToPdfs } from '@/store/slices/uploadHomework_ScanAndMark_slice';
import { api, HomeworkPdfMetadata } from '@/lib/api';
import { set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr } from '@/lib/scanAndMarkHelpers';
import { RootState, AppDispatch } from '@/store/store';

interface UploadButtonProps {
  homework_type: 'onetime' | 'class';
  onProcessingChange: (isProcessing: boolean) => void;
}

export function UploadButton({ homework_type, onProcessingChange }: UploadButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const onetimeCriteria = useSelector((state: RootState) => state.Homeworkcriteria_onetimeUpload);
  const homeworkList = useSelector((state: RootState) => state.uploadHomework_ScanAndMark.homeworkList);

  const isUploadDisabled =
    !onetimeCriteria.homeworkTitle ||
    !onetimeCriteria.selectedLevel ||
    !onetimeCriteria.selectedOneTimeSubject ||
    homeworkList.length === 0;

  async function handleConfirmUpload(homework_type: 'onetime' | 'class') {
    setUploadError(null);
    onProcessingChange(true);
    try {
      let submissionMetadata: HomeworkPdfMetadata[] = [];
      let criteria: Record<string, unknown> = {};
      let submissionPdfs_and_Metadata: Awaited<ReturnType<typeof dispatch<ReturnType<typeof convertHomeworkToPdfs>>>>['payload'] = [];

      // true only when the teacher actually picked a marking scheme file
      const hasMarkingScheme = !!onetimeCriteria.markingSchemePdf_and_metadata.file;

      switch (homework_type) {
        case 'onetime': {
          submissionPdfs_and_Metadata = await dispatch(convertHomeworkToPdfs('onetime')).unwrap();
          submissionMetadata = submissionPdfs_and_Metadata.map(({ file: _file, ...meta }) => meta);
          const ms = onetimeCriteria.markingSchemePdf_and_metadata;
          criteria = {
            homeworkTitle: onetimeCriteria.homeworkTitle,
            selectedLevel: onetimeCriteria.selectedLevel,
            selectedOneTimeSubject: onetimeCriteria.selectedOneTimeSubject,
            markingScheme: hasMarkingScheme
              ? {
                  file_name: ms.file_name,
                  file_size: ms.file_size,
                  content_type: ms.content_type,
                  checksum: ms.checksum,
                }
              : { file_name: '', file_size: 0, content_type: '', checksum: '' },
          };
          break;
        }
        case 'class':
          // TODO: implement class upload flow
          break;
      }

      const uploadResult = await api.upload_for_signed_url({
        homework_pdf_entries: submissionMetadata,
        homework_criteria: [homework_type, criteria],
      });

      // Marking scheme is optional — only upload when the teacher provided one.
      // If it fails, throw to abort the whole upload (the submissions below won't run).
      const markingSchemeUpload = uploadResult.marking_scheme_upload;
      if (hasMarkingScheme && markingSchemeUpload) {
        try {
          await api.upload_file_to_signed_url(
            markingSchemeUpload.signed_url,
            onetimeCriteria.markingSchemePdf_and_metadata.file!,
            onetimeCriteria.markingSchemePdf_and_metadata.content_type,
          );
          // marking scheme landed — set its status to 'ocr'
          await api.confirm_marking_scheme_upload(markingSchemeUpload.id);
        } catch {
          throw new Error('Something gone wrong. Please retry upload the marking scheme');
        }
      }

      await Promise.all(
        uploadResult.submission_uploads.map(async (sub, i) => {
          try {
            await api.upload_file_to_signed_url(sub.signed_url, submissionPdfs_and_Metadata[i].file, 'application/pdf');
            // PUT landed — move this submission (and homework) to 'ocr'
            await set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr(sub.id);
          } catch {
            // isolate the failure — this submission's status stays 'uploading'
          }
        })
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      onProcessingChange(false);
    }
  }

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Upload</AlertDialogTitle>
            <AlertDialogDescription>
              After uploading, you cannot add new homework sheets for a student&apos;s homework. Do you confirm?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmUpload(homework_type)}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {uploadError && (
        <p className="mt-3 text-sm text-red-500 text-right">{uploadError}</p>
      )}
      <button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isUploadDisabled}
        className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={glassStyle}
      >
        Upload
      </button>
    </>
  );
}
