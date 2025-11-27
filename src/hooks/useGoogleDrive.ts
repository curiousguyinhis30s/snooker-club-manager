import { useState, useEffect, useCallback } from 'react';
import { googleDriveService } from '../lib/googleDrive';

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

export function useGoogleDrive() {
  const [state, setState] = useState<GoogleDriveState>(googleDriveService.getState());
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!state.isInitialized) {
      googleDriveService.initialize();
    }
  }, [state.isInitialized]);

  // Load backups when signed in
  useEffect(() => {
    if (state.isSignedIn) {
      loadBackups();
    } else {
      setBackups([]);
    }
  }, [state.isSignedIn]);

  const signIn = useCallback(() => {
    googleDriveService.signIn();
  }, []);

  const signOut = useCallback(() => {
    googleDriveService.signOut();
    setBackups([]);
  }, []);

  const loadBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const files = await googleDriveService.listBackups();
      setBackups(files);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadBackup = useCallback(async (data: object, fileName: string) => {
    setIsLoading(true);
    try {
      const success = await googleDriveService.uploadBackup(data, fileName);
      if (success) {
        await loadBackups();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [loadBackups]);

  const downloadBackup = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      const data = await googleDriveService.downloadBackup(fileId);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      const success = await googleDriveService.deleteBackup(fileId);
      if (success) {
        await loadBackups();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [loadBackups]);

  return {
    ...state,
    isLoading,
    backups,
    signIn,
    signOut,
    uploadBackup,
    downloadBackup,
    deleteBackup,
    refreshBackups: loadBackups,
  };
}
