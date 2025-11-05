/**
 * TypeScript type definitions for Plex Toolbox
 */

export interface PlexServerConfig {
  url: string;
  token: string;
}

export interface PlexServerInfo {
  name: string;
  version: string;
  platform: string;
  platform_version: string;
  machine_identifier: string;
}

export interface PlexLibrary {
  key: string;
  title: string;
  type: string;
  agent?: string;
  scanner?: string;
  language?: string;
  uuid: string;
  updated_at?: string;
  created_at?: string;
  scanned_at?: string;
  total_items: number;
}

export interface LibraryScanRequest {
  library_key: string;
  path?: string;
}

export interface LibraryScanResponse {
  status: string;
  library_key: string;
  library_name: string;
  message: string;
  started_at: string;
}

export interface PlexMediaItem {
  key: string;
  title: string;
  type: string;
  year?: number;
  rating?: number;
  summary?: string;
  thumb?: string;
  art?: string;
  duration?: number;
  added_at?: string;
  updated_at?: string;
}

export interface LibraryStats {
  library_key: string;
  library_name: string;
  library_type: string;
  total_items: number;
  total_duration_minutes: number;
  recently_added_count: number;
  last_scanned?: string;
}

export interface ScanHistory {
  id: number;
  library_key: string;
  library_name: string;
  library_type: string;
  scan_type: string;
  status: 'started' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
}

export interface ScanHistoryResponse {
  scans: ScanHistory[];
  total: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface DashboardStats {
  total_libraries: number;
  total_items: number;
  by_type: {
    movie: number;
    show: number;
    artist: number;
    photo: number;
    other: number;
  };
  last_scan: string | null;
  recent_scans: number;
}

export interface RecentItem {
  title: string;
  type: string;
  library: string;
  added_at: string | null;
  year?: number;
  rating?: number;
  thumb?: string | null;
}

export interface RecentItemsResponse {
  items: RecentItem[];
}

export interface ServerStatus {
  connected: boolean;
  server_name: string | null;
  version: string | null;
  response_time_ms: number | null;
  error?: string;
}
