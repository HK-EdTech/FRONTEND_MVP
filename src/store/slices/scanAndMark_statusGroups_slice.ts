import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { statusColors } from '@/theme/statusColors';
import type { RootState } from '@/store/store';

export type StatusGroup = {
  key: string;
  label: string;
  color: string;              // a 'var(--status-…)' string (resolves via globals.css)
  subStatuses: string[];      // submission status_frontend values that fall under this group
};

// The coarse workflow groups. Only `draft` has sub-statuses today; the rest are future.
const groups: StatusGroup[] = [
  { key: 'draft',      label: 'Draft',        color: statusColors.draft,     subStatuses: ['prepare_upload', 'uploading', 'ocr'] },
  { key: 'check_scan', label: 'Check scan',   color: statusColors.checkScan, subStatuses: [] },
  { key: 'mark_ai',    label: 'Mark with AI', color: statusColors.markAi,    subStatuses: [] },
  { key: 'completed',  label: 'Completed',    color: statusColors.completed, subStatuses: [] },
];

const initialState = {
  groups,
  activeGroup: null as string | null,   // selected filter (null = show all)
};

const scanAndMark_statusGroups_slice = createSlice({
  name: 'scanAndMark_statusGroups',
  initialState,
  reducers: {
    setActiveGroup(state, action: PayloadAction<string | null>) {
      state.activeGroup = action.payload;
    },
  },
});

/**
 * Get the full group (key/label/color/subStatuses) a status_frontend belongs to, or null.
 * Serves both purposes: filtering (read `.key`) and card styling (read `.color` / `.label`).
 */
export function groupForStatus(status: string): StatusGroup | null {
  return groups.find(g => g.subStatuses.includes(status)) ?? null;
}

/**
 * Selector — reads BOTH slices and returns each group with a live `count` of the submissions
 * whose status_frontend falls under it. Recomputes automatically whenever submissions change.
 */
export const selectGroupsWithCounts = (state: RootState) =>
  state.scanAndMark_statusGroups.groups.map((g) => ({
    ...g,
    count: state.ScanAndMark_homeworksubmissions.submissionList.filter((sub) =>
      g.subStatuses.includes(sub.status_frontend),
    ).length,
  }));

export const { setActiveGroup } = scanAndMark_statusGroups_slice.actions;
export default scanAndMark_statusGroups_slice.reducer;
