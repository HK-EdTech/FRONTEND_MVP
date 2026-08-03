'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkle, ArrowUp, Trash2, Upload, Camera, ChevronLeft, ChevronRight, Pencil, RotateCcw } from 'lucide-react';
import { ActionButton } from '@/components/common/ActionButton';
import { Loading } from '@/components/common/Loading';
import {
  convertSubmissionsToPdfs,
  retryUpload,
  transition,
  deleteSubmission,
  addSheetsToSubmission,
  reorderSheets,
  deleteSheet,
  type UploadSubmission,
} from '@/store/slices/ScanAndMark_homeworksubmissions_slice';
import { setMarkingSchemeStatus_frontend, setMarkingSchemeId } from '@/store/slices/homeworkCriteria_OnetimeUpload_slice';
import { groupForStatus, selectGroupsWithCounts, setActiveGroup } from '@/store/slices/scanAndMark_statusGroups_slice';
import { statusColors, chipColors, errorColors } from '@/theme/statusColors';
import { api, SubmissionPdfMetadata } from '@/lib/api';
import {
  set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr,
  set_frontend_and_backend_status_of_marking_scheme_to_ocr,
} from '@/lib/scanAndMarkHelpers';
import { handleUploadFiles } from '@/common/utility/handleUploadFiles';
import { RootState, AppDispatch } from '@/store/store';

interface ScanAllDraftsButtonProps {
  homework_type: 'onetime' | 'class';
}

export function ScanAllDraftsButton({ homework_type }: ScanAllDraftsButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const onetimeCriteria = useSelector((state: RootState) => state.Homeworkcriteria_onetimeUpload);
  const submissionList = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);

  const isUploadDisabled =
    !onetimeCriteria.homeworkTitle ||
    !onetimeCriteria.selectedLevel ||
    !onetimeCriteria.selectedOneTimeSubject ||
    submissionList.length === 0;

  async function handleConfirmUpload(homework_type: 'onetime' | 'class') {
    setUploadError(null);
    // Declared out here so the outer catch can flag every in-flight submission as failed.
    // Payload type derived straight from the thunk's fulfilled action (no dispatch generic).
    let submissionPdfs_and_Metadata: ReturnType<typeof convertSubmissionsToPdfs.fulfilled>['payload'] = [];
    try {
      let submissionMetadata: SubmissionPdfMetadata[] = [];
      let criteria: Record<string, unknown> = {};

      // true only when the teacher actually picked a marking scheme file
      const hasMarkingScheme = !!onetimeCriteria.markingSchemePdf_and_metadata.file;

      switch (homework_type) {
        case 'onetime': {
          submissionPdfs_and_Metadata = await dispatch(convertSubmissionsToPdfs('onetime')).unwrap();
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

      // mark each submission (and the marking scheme) 'uploading' right before requesting signed URLs
      submissionPdfs_and_Metadata.forEach((entry) =>
        dispatch(transition({ submission_id: entry.submission_id, event: 'DONE' }))
      );
      if (hasMarkingScheme) {
        dispatch(setMarkingSchemeStatus_frontend('uploading'));
      }

      const uploadResult = await api.upload_for_signed_url({
        homework_id: crypto.randomUUID(),  // client-generated batch PK — one homework per upload
        submission_pdf_entries: submissionMetadata,
        homework_criteria: [homework_type, criteria],
      });

      // store the backend marking scheme id
      if (uploadResult.marking_scheme_upload) {
        dispatch(setMarkingSchemeId(uploadResult.marking_scheme_upload.id));
      }

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
          // marking scheme landed — set its status to 'ocr' (backend + frontend)
          await set_frontend_and_backend_status_of_marking_scheme_to_ocr(markingSchemeUpload.id, dispatch);
        } catch {
          throw new Error('Something gone wrong. Please retry upload the marking scheme');
        }
      }

      await Promise.all(
        uploadResult.submission_uploads.map(async (sub, i) => {
          try {
            await api.upload_file_to_signed_url(sub.signed_url, submissionPdfs_and_Metadata[i].file, 'application/pdf');
            // PUT landed — move this submission (and homework) to 'ocr' (backend + frontend)
            await set_frontend_and_backend_status_of_homework_and_hwsubmission_to_ocr(
              sub.id,
              submissionPdfs_and_Metadata[i].submission_id,
              dispatch,
            );
          } catch {
            // isolate the failure — flag this submission upload_failed (err='upload', stays 'uploading')
            dispatch(transition({ submission_id: submissionPdfs_and_Metadata[i].submission_id, event: 'FAIL' }));
          }
        })
      );
    } catch (err) {
      // failed before/around signed-URL issuance — flag every in-flight submission as upload_failed
      // (FAIL is a no-op for submissions still in prepare_upload, so this only hits 'uploading' ones)
      submissionPdfs_and_Metadata.forEach((entry) =>
        dispatch(transition({ submission_id: entry.submission_id, event: 'FAIL' }))
      );
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
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
      <ActionButton
        onClick={() => setShowConfirmDialog(true)}
        disabled={isUploadDisabled}
        icon={<Sparkle className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />}
      >
        Scan all drafts
      </ActionButton>
    </>
  );
}

// Failure copy keyed by status group (only Draft implemented). Drives the failed chip + overlay text.
// `meta` is optional — omitted here because an upload failure isn't necessarily a network error.
const ERR_COPY: Record<string, { label: string; meta?: string }> = {
  draft: { label: 'Upload failed' },
};

// Poker Card Stacking Preview Component
export const StackedSheetsPreview = ({
  submission,
  isMobile,
}: {
  submission: { submission_id: string; sheets: { id: string; file: File; thumbnail: string }[]; status_frontend: string; err: 'upload' | 'ocr' | 'scan' | 'marking' | null };
  isMobile?: boolean;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sheets } = submission;

  // The status group drives the card's color + chip; the sub-state drives the animation.
  const group = groupForStatus(submission.status_frontend);
  const groupColor = group ? group.color : statusColors.disabled;
  const cardShadow = `0 4px 14px color-mix(in srgb, ${groupColor} 22%, transparent)`;

  // Failure is an attribute (err), orthogonal to status → the card stays in its group but shows a red
  // failed treatment (scattered sheets + warning overlay + red chip). No per-card retry (batch only).
  const failed = submission.err !== null;
  const errCopy = group ? ERR_COPY[group.key] : undefined;

  // Per-group chip icon (only Draft has one for now, per the design).
  const GroupIcon = group?.key === 'draft' ? Pencil : null;

  // Status chip — like animationOverlay, a single condition picks the whole chip: a red '!' failure chip
  // when failed, otherwise the normal group-colored chip. (Shared class extracted to avoid repeating it.)
  const chipClass = 'absolute top-1.5 left-1.5 z-30 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold shadow-sm';
  const statusChip = !group ? null : failed ? (
    <div className={chipClass} style={{ background: errorColors.base, color: chipColors.onColorText }}>
      <span className="text-[13px] leading-none font-extrabold">!</span>
      {errCopy?.label ?? 'Failed'}
    </div>
  ) : (
    <div className={chipClass} style={{ background: groupColor, color: chipColors.onColorText }}>
      {GroupIcon && <GroupIcon className="w-3 h-3" strokeWidth={2.5} />}
      {group.label}
    </div>
  );

  // The group color is the only dynamic bit — pass it to the CSS overlays via a custom property.
  const groupColorVar = { '--sub-group-color': groupColor } as React.CSSProperties;

  // The card overlay as ONE case tree: failed first (err set), otherwise the normal sub-state overlays
  // (uploading, ocr, and future successful states); null when there's nothing to show.
  const overlay = failed ? (
    // failed: frosted red veil + '!' badge + label + a per-card Retry button (same thunk as Retry all)
    <div className="submission-failed-overlay">
      <div className="submission-failed-badge">!</div>
      {errCopy && (
        <div className="submission-failed-text">
          <div className="submission-failed-label">{errCopy.label}</div>
          {errCopy.meta && <div className="submission-failed-meta">{errCopy.meta}</div>}
        </div>
      )}
      <button
        className="submission-failed-retry"
        onClick={(e) => { e.stopPropagation(); dispatch(retryUpload([submission.submission_id])); }}
      >
        <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
        Retry
      </button>
    </div>
  ) : submission.status_frontend === 'uploading' ? (
    // uploading: frosted veil + a spinning ring with an arrow rising through it
    <div className="submission-upload-overlay" style={groupColorVar}>
      <div className="submission-upload-spinner">
        <span className="submission-upload-ring" />
        <ArrowUp className="submission-upload-arrow" strokeWidth={2.75} />
      </div>
    </div>
  ) : submission.status_frontend === 'ocr' ? (
    // ocr: a vertical band sweeps across the card left → right
    <div className="submission-scan-overlay" style={groupColorVar}>
      <div className="submission-scan-band" />
    </div>
  ) : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this homework?')) {
      dispatch(deleteSubmission(submission.submission_id));
    }
  };

  // Generic per-status action handler — branches on status_frontend (real logic wired later).
  const handleCardAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: dispatch the action for submission.status_frontend (e.g. start upload/scan).
  };

  // The action button shown on the card, per status. Extend this as future statuses get actions
  // (e.g. 'ocr' → "Review", 'completed' → "View result"). null = no button for this status.
  const cardAction: { label: string; onClick: (e: React.MouseEvent) => void } | null =
    submission.status_frontend === 'prepare_upload'
      ? { label: 'Scan', onClick: handleCardAction }
      : null;

  // One render path for any sheet count: show up to 3 sheets as an offset stack
  // (front sheet on top, up to two peeking behind at the top-left).
  const stackSheets = sheets.slice(0, 3);

  return (
    <div className="relative w-full h-full">
      {stackSheets.map((sheet, i) => {
        const offset = i * 4; // px each layer sits behind the front: 0, 4, 8
        const isFront = i === 0;
        return (
          <div
            key={sheet.id}
            className={`absolute rounded-lg overflow-hidden border-2 transition-colors ${isFront ? '' : 'shadow'} ${failed && i === 2 ? 'submission-sheet-scatter-back' : failed && i === 1 ? 'submission-sheet-scatter-mid' : ''}`}
            style={{
              top: `-${offset}px`,
              left: `-${offset}px`,
              width: `calc(100% - ${offset}px)`,
              height: `calc(100% - ${offset}px)`,
              zIndex: stackSheets.length - 1 - i, // front sheet sits on top
              borderColor: groupColor,
              boxShadow: isFront ? cardShadow : undefined,
            }}
          >
            <img
              src={sheet.thumbnail}
              alt="Homework Sheet"
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}

      {/* extra red-tinted sheet fanned off the other side — only when failed */}
      {failed && <div className="submission-failed-sheet" />}

      {/* Status chip, then the single overlay (failed / uploading / ocr / …) */}
      {statusChip}
      {overlay}

      {/* Sheet count badge — top-right, follows the submission's status-group color */}
      <div
        className="absolute top-1.5 right-1.5 z-10 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold"
        style={{ background: groupColor }}
      >
        {sheets.length}
      </div>

      {/* Delete — only while prepare_upload; deleting isn't allowed once the upload has started */}
      {submission.status_frontend === 'prepare_upload' && (
        <button
          onClick={handleDelete}
          className="absolute top-10 right-1.5 z-30 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md transition-all"
          aria-label="Delete homework"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      )}

      {/* Bottom shadow + per-status action button — suppressed while failed */}
      {cardAction && !failed && (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-2/5 z-10 pointer-events-none rounded-b-lg"
            style={{ background: 'linear-gradient(to top, rgba(74,72,96,0.55), rgba(74,72,96,0.1) 55%, transparent)' }}
          />
          <button
            onClick={cardAction.onClick}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-5 py-1.5 bg-white rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105"
            style={{ color: groupColor }}
          >
            {cardAction.label}
          </button>
        </>
      )}
    </div>
  );
};

// Submission Dialog Component
interface SubmissionDialogProps {
  isOpen: boolean;
  submission: UploadSubmission | undefined;
  onClose: () => void;
  isMobile: boolean;
}

export const SubmissionDialog = ({
  isOpen,
  submission,
  onClose,
  isMobile,
}: SubmissionDialogProps) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !submission) return null;

  const moveSheet = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= submission.sheets.length) return;

    const newSheets = [...submission.sheets];
    const [movedSheet] = newSheets.splice(fromIndex, 1);
    newSheets.splice(toIndex, 0, movedSheet);
    dispatch(reorderSheets({ submission_id: submission.submission_id, sheets: newSheets }));
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (submission.sheets.length === 1) {
      dispatch(deleteSubmission(submission.submission_id));
      onClose();
      return;
    }
    dispatch(deleteSheet({ submission_id: submission.submission_id, sheetId }));
  };

  const handleAddSheets = async (files: File[]) => {
    setIsProcessing(true);
    const sheets = await handleUploadFiles(files);
    setIsProcessing(false);
    if (sheets.length === 0) return;
    dispatch(addSheetsToSubmission({ submission_id: submission.submission_id, sheets }));
  };

  return (
    <>
    <Loading isProcessing={isProcessing} />
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto more-opaque-glass-style"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Uploaded Homework
          </DialogTitle>
        </DialogHeader>

        {/* Sheets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {submission.sheets.map((sheet, index) => (
            <motion.div
              key={sheet.id}
              layoutId={sheet.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-300 hover:border-purple-400 transition-colors group"
            >
              <img
                src={sheet.thumbnail}
                alt="Homework Sheet"
                className="w-full h-full object-cover"
              />

              {/* Sheet number watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold opacity-60" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                  {index + 1}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSheet(sheet.id);
                }}
                className={`absolute bottom-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-all z-20
                  ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'}`}
                aria-label="Delete sheet"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Left Arrow - Only show if not first sheet */}
              {index > 0 && (
                <button
                  onClick={() => moveSheet(index, index - 1)}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-20
                    ${isMobile ? 'opacity-50' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'}`}
                  aria-label="Move left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Right Arrow - Only show if not last sheet */}
              {index < submission.sheets.length - 1 && (
                <button
                  onClick={() => moveSheet(index, index + 1)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-20
                    ${isMobile ? 'opacity-50' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'}`}
                  aria-label="Move right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </motion.div>
          ))}

          {/* Add More Sheets Box */}
          <div
            className="rounded-xl p-2 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors aspect-[3/4]"
            style={{ background: 'rgba(139, 92, 246, 0.05)' }}
          >
            {isMobile ? (
              // Mobile: Two boxes stacked vertically
              <div className="flex flex-col gap-2 h-full">
                {/* Upload Box */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleAddSheets(Array.from(files));
                    };
                    input.click();
                  }}
                  className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
                >
                  <Upload className="w-8 h-8 text-purple-500 mb-1" />
                  <p className="text-xs text-gray-700 font-medium">Tap to upload</p>
                  <p className="text-xs text-gray-700 font-medium">more homework sheets</p>
                </button>

                {/* Scan Box */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleAddSheets(Array.from(files));
                    };
                    input.click();
                  }}
                  className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
                >
                  <Camera className="w-8 h-8 text-purple-500 mb-1" />
                  <p className="text-xs text-gray-700 font-medium">Tap to scan</p>
                </button>
              </div>
            ) : (
              // Desktop: Single upload box
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleAddSheets(Array.from(files));
                  };
                  input.click();
                }}
                className="w-full h-full flex flex-col items-center justify-center bg-black/10 rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                <Upload className="w-12 h-12 text-purple-500 mb-2" />
                <p className="text-sm text-gray-700 font-medium">Click to upload</p>
                <p className="text-xs text-gray-700 font-medium">more homework sheets</p>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

/**
 * Status-group triage bar: an "All" chip + one chip per group (with live counts) that filter the
 * grid. Reads only slice state. The "Scan all drafts" action sits at the right end and shows only
 * while the Draft group is the active filter.
 */
export const TriageBar = () => {
  const dispatch = useDispatch();
  const submissionList = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);
  const groupsWithCounts = useSelector(selectGroupsWithCounts);
  const activeGroup = useSelector((state: RootState) => state.scanAndMark_statusGroups.activeGroup);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* All chip */}
      {(() => {
        const empty = submissionList.length === 0;
        const active = activeGroup === null;
        return (
          <button
            disabled={empty}
            onClick={() => dispatch(setActiveGroup(null))}
            style={{
              background: chipColors.bg,
              color: empty ? statusColors.disabled : active ? chipColors.allAccent : chipColors.inactiveText,
              borderColor: active ? chipColors.allAccent : empty ? statusColors.disabled : chipColors.inactiveBorder,
              boxShadow: active ? `0 1px 6px color-mix(in srgb, ${chipColors.allAccent} 30%, transparent)` : 'none',
              opacity: empty ? 0.55 : 1,
              cursor: empty ? 'not-allowed' : 'pointer',
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[11px] border text-xs font-semibold transition-all"
          >
            <span>All</span>
            <span
              style={{ background: empty ? statusColors.disabled : chipColors.allAccent, color: chipColors.onColorText }}
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold"
            >
              {submissionList.length}
            </span>
          </button>
        );
      })()}
      {groupsWithCounts.map((g) => {
        const empty = g.count === 0;
        const active = activeGroup === g.key;
        const dotColor = empty ? statusColors.disabled : g.color;
        return (
          <button
            key={g.key}
            disabled={empty}
            onClick={() => dispatch(setActiveGroup(active ? null : g.key))}
            style={{
              background: chipColors.bg,
              color: empty ? statusColors.disabled : active ? g.color : chipColors.inactiveText,
              borderColor: active ? g.color : empty ? statusColors.disabled : chipColors.inactiveBorder,
              boxShadow: active ? `0 1px 6px color-mix(in srgb, ${g.color} 30%, transparent)` : 'none',
              opacity: empty ? 0.55 : 1,
              cursor: empty ? 'not-allowed' : 'pointer',
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[11px] border text-xs font-semibold transition-all"
          >
            <span style={{ background: dotColor }} className="w-2 h-2 rounded-full" />
            <span>{g.label}</span>
            <span
              style={{ background: dotColor, color: chipColors.onColorText }}
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold"
            >
              {g.count}
            </span>
            {g.failedCount > 0 && <span className="chip-failed-pill">{g.failedCount} failed</span>}
          </button>
        );
      })}

      {/* Right end (Draft filter only): Retry all failed + Scan all drafts */}
      {activeGroup === 'draft' && (
        <div className="ml-auto flex items-center gap-2">
          <RetryAllFailedButton />
          <ScanAllDraftsButton homework_type="onetime" />
        </div>
      )}
    </div>
  );
};

// Batch "Retry all failed" button — retries every failed submission (and the marking scheme) in one
// reconcile call. Self-manages: reads failures from the store and renders nothing when there are none.
export function RetryAllFailedButton() {
  const dispatch = useDispatch<AppDispatch>();
  const submissionList = useSelector((state: RootState) => state.ScanAndMark_homeworksubmissions.submissionList);
  const failedIds = submissionList.filter((s) => s.err !== null).map((s) => s.submission_id);

  if (failedIds.length === 0) return null;

  return (
    <ActionButton
      onClick={() => dispatch(retryUpload(failedIds))}
      icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} />}
      style={{ background: errorColors.base, boxShadow: `0 6px 16px color-mix(in srgb, ${errorColors.base} 24%, transparent)` }}
    >
      Retry all failed
      <span
        className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-extrabold"
        style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
      >
        {failedIds.length}
      </span>
    </ActionButton>
  );
}
