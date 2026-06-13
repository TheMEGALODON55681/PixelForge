export type Status = 'idle' | 'forging' | 'ready' | 'error';
export type Framework = 'html' | 'jsx';
export type DeviceWidth = 'desktop' | 'tablet' | 'mobile';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  framework: Framework;
  byteCount: number;
  code: string;
  /** Downscaled JPEG data URL (~200px max) — survives localStorage serialization across reloads. */
  thumbnail: string;
}

export interface ShortcutItem {
  keys: string[];
  action: string;
}
