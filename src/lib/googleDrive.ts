/**
 * Google Drive Integration Service
 *
 * This service provides backup functionality using Google Drive API.
 * It uses Google Identity Services for OAuth2 authentication.
 */

// Google Drive API configuration
// NOTE: Replace with your own Client ID from Google Cloud Console
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Backup folder name in Google Drive
const BACKUP_FOLDER_NAME = 'SnookerClubBackups';

interface GoogleDriveState {
  isSignedIn: boolean;
  isInitialized: boolean;
  userEmail: string | null;
  lastSyncTime: string | null;
  error: string | null;
}

interface BackupFile {
  id: string;
  name: string;
  createdTime: string;
  size: string;
}

type StateChangeCallback = (state: GoogleDriveState) => void;

class GoogleDriveService {
  private state: GoogleDriveState = {
    isSignedIn: false,
    isInitialized: false,
    userEmail: null,
    lastSyncTime: null,
    error: null,
  };

  private stateListeners: StateChangeCallback[] = [];
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private accessToken: string | null = null;
  private backupFolderId: string | null = null;

  constructor() {
    this.loadState();
  }

  private loadState() {
    const saved = localStorage.getItem('google_drive_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.state.lastSyncTime = parsed.lastSyncTime;
      this.state.userEmail = parsed.userEmail;
    }

    // Check for saved access token
    const token = localStorage.getItem('google_drive_token');
    if (token) {
      const tokenData = JSON.parse(token);
      // Check if token is still valid (tokens expire after 1 hour)
      if (tokenData.expiresAt > Date.now()) {
        this.accessToken = tokenData.token;
        this.state.isSignedIn = true;
      } else {
        localStorage.removeItem('google_drive_token');
      }
    }
  }

  private saveState() {
    localStorage.setItem('google_drive_state', JSON.stringify({
      lastSyncTime: this.state.lastSyncTime,
      userEmail: this.state.userEmail,
    }));
  }

  private notifyListeners() {
    this.stateListeners.forEach(cb => cb({ ...this.state }));
  }

  subscribe(callback: StateChangeCallback): () => void {
    this.stateListeners.push(callback);
    callback({ ...this.state });
    return () => {
      this.stateListeners = this.stateListeners.filter(cb => cb !== callback);
    };
  }

  getState(): GoogleDriveState {
    return { ...this.state };
  }

  async initialize(): Promise<boolean> {
    if (!CLIENT_ID) {
      this.state.error = 'Google API not configured. Add VITE_GOOGLE_CLIENT_ID to your environment.';
      this.state.isInitialized = false;
      this.notifyListeners();
      return false;
    }

    try {
      // Load the Google Identity Services library
      await this.loadGoogleScript('https://accounts.google.com/gsi/client');

      // Load the Google API client
      await this.loadGoogleScript('https://apis.google.com/js/api.js');

      // Initialize the Google API client
      await new Promise<void>((resolve, reject) => {
        gapi.load('client', {
          callback: resolve,
          onerror: reject,
        });
      });

      // Initialize the client with API key
      if (API_KEY) {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
      }

      // Initialize the token client
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            this.handleAuthSuccess(response.access_token);
          }
        },
        error_callback: (error) => {
          this.state.error = error.message || 'Authentication failed';
          this.notifyListeners();
        },
      });

      this.state.isInitialized = true;
      this.state.error = null;
      this.notifyListeners();
      return true;
    } catch (error) {
      this.state.error = `Failed to initialize: ${error}`;
      this.state.isInitialized = false;
      this.notifyListeners();
      return false;
    }
  }

  private loadGoogleScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (src.includes('gsi') && window.google?.accounts) {
        resolve();
        return;
      }
      if (src.includes('api.js') && window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  private handleAuthSuccess(token: string) {
    this.accessToken = token;
    this.state.isSignedIn = true;
    this.state.error = null;

    // Save token with expiry (1 hour)
    localStorage.setItem('google_drive_token', JSON.stringify({
      token,
      expiresAt: Date.now() + 3600 * 1000,
    }));

    // Get user info
    this.getUserInfo();
    this.notifyListeners();
  }

  private async getUserInfo() {
    if (!this.accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.state.userEmail = data.email;
        this.saveState();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }

  signIn(): void {
    if (!this.tokenClient) {
      this.state.error = 'Google API not initialized';
      this.notifyListeners();
      return;
    }

    // Request access token
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  signOut(): void {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Token revoked');
      });
    }

    this.accessToken = null;
    this.backupFolderId = null;
    this.state.isSignedIn = false;
    this.state.userEmail = null;

    localStorage.removeItem('google_drive_token');
    this.saveState();
    this.notifyListeners();
  }

  private async getOrCreateBackupFolder(): Promise<string | null> {
    if (this.backupFolderId) return this.backupFolderId;
    if (!this.accessToken) return null;

    try {
      // Search for existing folder
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (searchResponse.ok) {
        const data = await searchResponse.json();
        if (data.files && data.files.length > 0) {
          this.backupFolderId = data.files[0].id;
          return this.backupFolderId;
        }
      }

      // Create new folder
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: BACKUP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });

      if (createResponse.ok) {
        const folder = await createResponse.json();
        this.backupFolderId = folder.id;
        return this.backupFolderId;
      }

      return null;
    } catch (error) {
      console.error('Failed to get/create backup folder:', error);
      return null;
    }
  }

  async uploadBackup(backupData: object, fileName: string): Promise<boolean> {
    if (!this.accessToken) {
      this.state.error = 'Not signed in';
      this.notifyListeners();
      return false;
    }

    try {
      const folderId = await this.getOrCreateBackupFolder();
      if (!folderId) {
        throw new Error('Could not create backup folder');
      }

      const fileContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });

      // Create metadata
      const metadata = {
        name: fileName,
        parents: [folderId],
      };

      // Use multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (response.ok) {
        this.state.lastSyncTime = new Date().toISOString();
        this.state.error = null;
        this.saveState();
        this.notifyListeners();
        return true;
      }

      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    } catch (error) {
      this.state.error = `Upload failed: ${error}`;
      this.notifyListeners();
      return false;
    }
  }

  async listBackups(): Promise<BackupFile[]> {
    if (!this.accessToken) {
      return [];
    }

    try {
      const folderId = await this.getOrCreateBackupFolder();
      if (!folderId) {
        return [];
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.files || [];
      }

      return [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  async downloadBackup(fileId: string): Promise<object | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return null;
    } catch (error) {
      console.error('Failed to download backup:', error);
      return null;
    }
  }

  async deleteBackup(fileId: string): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }
}

// Singleton instance
export const googleDriveService = new GoogleDriveService();

// Type declarations for Google APIs
declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}
