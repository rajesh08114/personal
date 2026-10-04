import type { BirthdayConfig } from '@/types/birthday';
import { normalizeConfig } from './normalizeConfig';

/**
 * A backup is one self-contained JSON file. Photos and music are embedded as
 * data URLs, so the file alone is enough to rebuild the whole experience —
 * recipient, sender, messages, template, theme, photos, photo framing,
 * memories, dates and music settings.
 */
export const BACKUP_FORMAT = 'birthday-studio-backup';
export const BACKUP_VERSION = 1;

export interface BirthdayBackup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  /** The share id this birthday had when it was exported (lets an import keep the same link). */
  shareId?: string;
  config: BirthdayConfig;
}

export function createBackup(config: BirthdayConfig, shareId?: string): BirthdayBackup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), shareId, config };
}

export function backupFileName(config: BirthdayConfig): string {
  const who = (config.birthdayPerson.trim() || 'birthday').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${who || 'birthday'}-experience.json`;
}

export function downloadBackup(config: BirthdayConfig, shareId?: string): void {
  const blob = new Blob([JSON.stringify(createBackup(config, shareId))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName(config);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class BackupError extends Error {}

/** Accepts a backup file (current format) or a bare config (older exports). */
export function parseBackup(text: string): { config: BirthdayConfig; shareId?: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('That file isn’t a birthday backup (it couldn’t be read as JSON).');
  }
  if (!data || typeof data !== 'object') throw new BackupError('That file isn’t a birthday backup.');
  const obj = data as Record<string, unknown>;
  if (obj.format === BACKUP_FORMAT) {
    if (typeof obj.version === 'number' && obj.version > BACKUP_VERSION) {
      throw new BackupError('This backup was made with a newer version of the studio.');
    }
    return { config: normalizeConfig(obj.config), shareId: typeof obj.shareId === 'string' ? obj.shareId : undefined };
  }
  if ('birthdayPerson' in obj || 'messages' in obj || 'templateId' in obj) return { config: normalizeConfig(obj) };
  throw new BackupError('That file isn’t a birthday backup.');
}

export async function readBackupFile(file: File): Promise<{ config: BirthdayConfig; shareId?: string }> {
  if (file.size > 80 * 1024 * 1024) throw new BackupError('That file is too large to be a birthday backup.');
  return parseBackup(await file.text());
}
