import type { CSSProperties } from 'react';

/**
 * Status group colors — TS wrapper over the CSS variables in globals.css.
 *
 * The actual color VALUES live in globals.css (`:root { --status-draft: … }`), so they can be used
 * in plain CSS too. Here each entry just points at the matching CSS variable, giving TS/JSX a
 * type-safe, loopable object. Change a color once in globals.css → updates everywhere.
 */
export const statusColors = {
  draft: 'var(--status-draft)',
  checkScan: 'var(--status-check-scan)',
  markAi: 'var(--status-mark-ai)',
  completed: 'var(--status-completed)',
  disabled: 'var(--status-disabled)',
} as const;

export type StatusGroupKey = keyof typeof statusColors;

/** Triage-chip colors, named by role/state (values live in globals.css). */
export const chipColors = {
  bg: 'var(--chip-bg)',
  allAccent: 'var(--chip-all-accent)',
  inactiveText: 'var(--chip-inactive-text)',
  inactiveBorder: 'var(--chip-inactive-border)',
  onColorText: 'var(--chip-oncolor-text)',
} as const;

/** Primary action button style (deep-blue gradient; values live in globals.css). */
export const actionPrimaryStyle: CSSProperties = {
  background: 'var(--action-primary-gradient)',
  boxShadow: 'var(--action-primary-shadow)',
};

/** Failure palette — the only red, reserved for failed states (values live in globals.css). */
export const errorColors = {
  base: 'var(--error)',
  tintBorder: 'var(--error-tint-border)',
  tintFill: 'var(--error-tint-fill)',
  text: 'var(--error-text)',
  textMuted: 'var(--error-text-muted)',
  veil: 'var(--error-veil)',
} as const;
