'use client';

import React, { useState } from 'react';
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
import { RootState, AppDispatch } from '@/store/store';

interface UploadButtonProps {
  homework_type: 'onetime' | 'class';
  setStageIndex: React.Dispatch<React.SetStateAction<number>>;
  onProcessingChange: (isProcessing: boolean) => void;
}

export function UploadButton({ homework_type, setStageIndex, onProcessingChange }: UploadButtonProps) {
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
      let homework_pdf_entries: HomeworkPdfMetadata[] = [];
      let criteria: Record<string, unknown> = {};
      let pdfs: Awaited<ReturnType<typeof dispatch<ReturnType<typeof convertHomeworkToPdfs>>>>['payload'] = [];

      switch (homework_type) {
        case 'onetime': {
          pdfs = await dispatch(convertHomeworkToPdfs('onetime')).unwrap();
          homework_pdf_entries = pdfs.map(({ file: _file, ...meta }) => meta);
          criteria = {
            homeworkTitle: onetimeCriteria.homeworkTitle,
            selectedLevel: onetimeCriteria.selectedLevel,
            selectedOneTimeSubject: onetimeCriteria.selectedOneTimeSubject,
            markingScheme: {
              file_name: onetimeCriteria.markingSchemePdf_and_metadata.file_name,
              file_size: onetimeCriteria.markingSchemePdf_and_metadata.file_size,
              content_type: onetimeCriteria.markingSchemePdf_and_metadata.content_type,
              checksum: onetimeCriteria.markingSchemePdf_and_metadata.checksum,
            },
          };
          break;
        }
        case 'class':
          // TODO: implement class upload flow
          break;
      }

      const uploadResult = await api.uploadForSignedUrl({
        homework_pdf_entries,
        homework_criteria: [homework_type, criteria],
      });

      try {
        await api.uploadFileToSignedUrl(
          uploadResult.marking_scheme_upload.signed_url,
          onetimeCriteria.markingSchemePdf_and_metadata.file!,
          onetimeCriteria.markingSchemePdf_and_metadata.content_type,
        );
      } catch {
        throw new Error(`Marking scheme ${uploadResult.marking_scheme_upload.file_name} failed to upload`);
      }

      await Promise.all(
        uploadResult.submission_uploads.map(async (sub, i) => {
          try {
            await api.uploadFileToSignedUrl(sub.signed_url, pdfs[i].file, 'application/pdf');
          } catch {
            throw new Error(`${sub.student_name}'s homework failed to upload`);
          }
        })
      );

      setStageIndex(1);
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
