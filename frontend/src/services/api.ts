/**
 * API client for Plex Toolbox backend
 */
import axios, { AxiosInstance } from 'axios';
import {
  PlexServerConfig,
  PlexLibrary,
  PlexMediaItem,
  LibraryStats,
  ScanHistoryResponse,
  DashboardStats,
  RecentItemsResponse,
  ServerStatus,
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Plex connection
  async connectToPlex(config: PlexServerConfig) {
    const response = await this.client.post<{ success: boolean; server_name?: string; version?: string; platform?: string; error?: string }>(
      '/plex/test-connection',
      config
    );
    return response.data;
  }

  async savePlexConfig(config: PlexServerConfig) {
    const response = await this.client.post('/plex/config', config);
    return response.data;
  }

  async getPlexConfig() {
    const response = await this.client.get('/plex/config');
    return response.data;
  }

  async getServerInfo() {
    const response = await this.client.get('/plex/server-info');
    return response.data;
  }

  // Library management
  async getLibraries(): Promise<PlexLibrary[]> {
    const response = await this.client.get<{ libraries: PlexLibrary[] }>('/plex/libraries');
    return response.data.libraries;
  }

  async getLibraryDetails(libraryKey: string): Promise<PlexLibrary> {
    const response = await this.client.get<PlexLibrary>(`/library/libraries/${libraryKey}`);
    return response.data;
  }

  async getLibraryContent(
    libraryKey: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ items: PlexMediaItem[]; total: number; has_more: boolean }> {
    const response = await this.client.get(`/library/libraries/${libraryKey}/content`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getLibraryStats(libraryKey: string): Promise<LibraryStats> {
    const response = await this.client.get<LibraryStats>(
      `/library/libraries/${libraryKey}/stats`
    );
    return response.data;
  }

  async scanLibrary(libraryKey: string): Promise<{ status: string; message: string }> {
    const response = await this.client.post(`/plex/libraries/${libraryKey}/scan`);
    return response.data;
  }

  // Scan history
  async getScanHistory(libraryKey?: string, limit: number = 50): Promise<ScanHistoryResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (libraryKey) {
      params.append('library_key', libraryKey);
    }
    
    const response = await this.client.get<ScanHistoryResponse>(
      `/scan/scan-history?${params.toString()}`
    );
    return response.data;
  }

  async deleteScanHistory(scanId: number): Promise<{ status: string; message: string }> {
    const response = await this.client.delete(`/scan/scan-history/${scanId}`);
    return response.data;
  }

  async scanLibraryWithHistory(libraryKey: string): Promise<{ 
    status: string; 
    message: string;
    scan_id: number;
    started_at: string;
    completed_at?: string;
  }> {
    const response = await this.client.post(`/scan/libraries/${libraryKey}/scan`);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  async getRecentItems(): Promise<RecentItemsResponse> {
    const response = await this.client.get<RecentItemsResponse>('/dashboard/recent');
    return response.data;
  }

  async getServerStatus(): Promise<ServerStatus> {
    const response = await this.client.get<ServerStatus>('/dashboard/server-status');
    return response.data;
  }
}

export const apiClient = new ApiClient();
