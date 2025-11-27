import { Download, Upload, Database, HardDrive, Calendar, Clock, CheckCircle, AlertCircle, Cloud, CloudOff, RefreshCw, Trash2, LogOut } from 'lucide-react';
import type { Settings } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirmation } from '../components/ui/ConfirmationModal';
import { useState, useEffect } from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

interface BackupSyncProps {
  settings: Settings;
}

interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  lastBackup?: string;
}

export default function BackupSync({ settings }: BackupSyncProps) {
  const { showToast } = useToast();
  const { showConfirmation, ConfirmationModalComponent } = useConfirmation();
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [dataSize, setDataSize] = useState<number>(0);
  const [autoBackupSettings, setAutoBackupSettings] = useState<AutoBackupSettings>({
    enabled: false,
    frequency: 'manual',
  });

  const {
    isSignedIn: isGoogleConnected,
    isInitialized: isGoogleInitialized,
    isLoading: isGoogleLoading,
    userEmail: googleEmail,
    lastSyncTime: googleLastSync,
    error: googleError,
    backups: googleBackups,
    signIn: connectGoogle,
    signOut: disconnectGoogle,
    uploadBackup: uploadToGoogle,
    downloadBackup: downloadFromGoogle,
    deleteBackup: deleteFromGoogle,
    refreshBackups: refreshGoogleBackups,
  } = useGoogleDrive();

  useEffect(() => {
    calculateDataSize();
    loadAutoBackupSettings();
    loadLastBackupDate();
  }, []);

  useEffect(() => {
    if (!autoBackupSettings.enabled || autoBackupSettings.frequency === 'manual') return;

    const interval = autoBackupSettings.frequency === 'daily'
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const checkAndBackup = () => {
      const lastBackup = autoBackupSettings.lastBackup ? new Date(autoBackupSettings.lastBackup).getTime() : 0;
      if (Date.now() - lastBackup >= interval) handleExportData();
    };

    checkAndBackup();
    const intervalId = setInterval(checkAndBackup, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [autoBackupSettings.enabled, autoBackupSettings.frequency, autoBackupSettings.lastBackup]);

  const calculateDataSize = () => {
    let totalSize = 0;
    ['snooker_settings', 'snooker_tables', 'auth_users', 'snooker_sales_transactions', 'snooker_day_closures', 'snooker_emergency_pin', 'expenses', 'snooker_reservations', 'snooker_loyalty_config'].forEach(key => {
      const item = localStorage.getItem(key);
      if (item) totalSize += new Blob([item]).size;
    });
    setDataSize(totalSize);
  };

  const loadAutoBackupSettings = () => {
    const saved = localStorage.getItem('auto_backup_settings');
    if (saved) setAutoBackupSettings(JSON.parse(saved));
  };

  const loadLastBackupDate = () => {
    const saved = localStorage.getItem('last_backup_date');
    if (saved) setLastBackupDate(saved);
  };

  const saveAutoBackupSettings = (newSettings: AutoBackupSettings) => {
    setAutoBackupSettings(newSettings);
    localStorage.setItem('auto_backup_settings', JSON.stringify(newSettings));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleExportData = () => {
    try {
      const fullBackup = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        metadata: { clubName: settings.clubName, dataSize },
        data: {
          settings: localStorage.getItem('snooker_settings'),
          tables: localStorage.getItem('snooker_tables'),
          users: localStorage.getItem('auth_users'),
          salesTransactions: localStorage.getItem('snooker_sales_transactions'),
          dayClosures: localStorage.getItem('snooker_day_closures'),
          expenses: localStorage.getItem('expenses'),
          emergencyPin: localStorage.getItem('snooker_emergency_pin'),
          reservations: localStorage.getItem('snooker_reservations'),
          loyaltyConfig: localStorage.getItem('snooker_loyalty_config'),
        }
      };

      const dataStr = JSON.stringify(fullBackup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();

      const backupDate = new Date().toISOString();
      setLastBackupDate(backupDate);
      localStorage.setItem('last_backup_date', backupDate);

      if (autoBackupSettings.enabled) {
        saveAutoBackupSettings({ ...autoBackupSettings, lastBackup: backupDate });
      }

      showToast('Backup exported', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    }
  };

  const handleGoogleBackup = async () => {
    if (!isGoogleConnected) {
      showToast('Connect Google Drive first', 'warning');
      return;
    }

    try {
      const fullBackup = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        metadata: { clubName: settings.clubName, dataSize },
        data: {
          settings: localStorage.getItem('snooker_settings'),
          tables: localStorage.getItem('snooker_tables'),
          users: localStorage.getItem('auth_users'),
          salesTransactions: localStorage.getItem('snooker_sales_transactions'),
          dayClosures: localStorage.getItem('snooker_day_closures'),
          expenses: localStorage.getItem('expenses'),
          emergencyPin: localStorage.getItem('snooker_emergency_pin'),
          reservations: localStorage.getItem('snooker_reservations'),
          loyaltyConfig: localStorage.getItem('snooker_loyalty_config'),
        }
      };

      const fileName = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      const success = await uploadToGoogle(fullBackup, fileName);

      if (success) {
        showToast('Uploaded to Google Drive', 'success');
        setLastBackupDate(new Date().toISOString());
        localStorage.setItem('last_backup_date', new Date().toISOString());
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (error) {
      showToast('Upload error', 'error');
    }
  };

  const handleGoogleRestore = async (fileId: string, fileName: string) => {
    showConfirmation(
      { title: 'Restore Backup', message: `Restore from "${fileName}"? Current data will be replaced.`, confirmText: 'Restore', cancelText: 'Cancel', variant: 'warning', confirmButtonVariant: 'primary' },
      async () => {
        try {
          const backup = await downloadFromGoogle(fileId);
          if (!backup) { showToast('Download failed', 'error'); return; }

          const data = (backup as any).data;
          if (data) {
            if (data.settings) localStorage.setItem('snooker_settings', data.settings);
            if (data.tables) localStorage.setItem('snooker_tables', data.tables);
            if (data.users) localStorage.setItem('auth_users', data.users);
            if (data.salesTransactions) localStorage.setItem('snooker_sales_transactions', data.salesTransactions);
            if (data.dayClosures) localStorage.setItem('snooker_day_closures', data.dayClosures);
            if (data.expenses) localStorage.setItem('expenses', data.expenses);
            if (data.emergencyPin) localStorage.setItem('snooker_emergency_pin', data.emergencyPin);
            if (data.reservations) localStorage.setItem('snooker_reservations', data.reservations);
            if (data.loyaltyConfig) localStorage.setItem('snooker_loyalty_config', data.loyaltyConfig);
            showToast('Restored! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            showToast('Invalid backup', 'error');
          }
        } catch (error) {
          showToast('Restore error', 'error');
        }
      }
    );
  };

  const handleGoogleDelete = async (fileId: string, fileName: string) => {
    showConfirmation(
      { title: 'Delete Backup', message: `Delete "${fileName}"?`, confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' },
      async () => {
        const success = await deleteFromGoogle(fileId);
        showToast(success ? 'Deleted' : 'Delete failed', success ? 'success' : 'error');
      }
    );
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        const isNewFormat = backup.version === '2.0';

        showConfirmation(
          { title: 'Import Backup', message: 'Replace all current data?', confirmText: 'Import', cancelText: 'Cancel', variant: 'warning', confirmButtonVariant: 'primary' },
          () => {
            try {
              if (isNewFormat) {
                const data = backup.data;
                if (data.settings) localStorage.setItem('snooker_settings', data.settings);
                if (data.tables) localStorage.setItem('snooker_tables', data.tables);
                if (data.users) localStorage.setItem('auth_users', data.users);
                if (data.salesTransactions) localStorage.setItem('snooker_sales_transactions', data.salesTransactions);
                if (data.dayClosures) localStorage.setItem('snooker_day_closures', data.dayClosures);
                if (data.expenses) localStorage.setItem('expenses', data.expenses);
                if (data.emergencyPin) localStorage.setItem('snooker_emergency_pin', data.emergencyPin);
                if (data.reservations) localStorage.setItem('snooker_reservations', data.reservations);
                if (data.loyaltyConfig) localStorage.setItem('snooker_loyalty_config', data.loyaltyConfig);
              } else {
                // Legacy format - restore all available keys
                if (backup.settings) localStorage.setItem('snooker_settings', JSON.stringify(backup.settings));
                if (backup.tables) localStorage.setItem('snooker_tables', backup.tables);
                if (backup.users) localStorage.setItem('auth_users', backup.users);
                if (backup.salesTransactions) localStorage.setItem('snooker_sales_transactions', backup.salesTransactions);
                if (backup.dayClosures) localStorage.setItem('snooker_day_closures', backup.dayClosures);
                if (backup.expenses) localStorage.setItem('expenses', backup.expenses);
                if (backup.emergencyPin) localStorage.setItem('snooker_emergency_pin', backup.emergencyPin);
                if (backup.reservations) localStorage.setItem('snooker_reservations', backup.reservations);
                if (backup.loyaltyConfig) localStorage.setItem('snooker_loyalty_config', backup.loyaltyConfig);
              }
              showToast('Imported! Reloading...', 'success');
              setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
              showToast('Import error', 'error');
            }
          }
        );
      } catch (error) {
        showToast('Invalid file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAutoBackupToggle = (enabled: boolean) => {
    saveAutoBackupSettings({ ...autoBackupSettings, enabled, lastBackup: enabled ? autoBackupSettings.lastBackup : undefined });
    if (enabled) {
      showToast('Auto-backup enabled', 'success');
      handleExportData();
    }
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'manual') => {
    saveAutoBackupSettings({ ...autoBackupSettings, frequency });
  };

  const getDaysSinceLastBackup = (): number | null => {
    if (!lastBackupDate) return null;
    return Math.ceil(Math.abs(Date.now() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysSinceBackup = getDaysSinceLastBackup();
  const needsBackup = !lastBackupDate || (daysSinceBackup && daysSinceBackup > 7);

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <ConfirmationModalComponent />
      <div className="p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Backup & Sync</h2>
          <p className="text-xs text-gray-500">Manage your data backups</p>
        </div>

        {/* Update Instructions Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <HardDrive className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900">Before Updating the App</p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                1. Click <strong>Export</strong> to download your data backup<br />
                2. Install the new version<br />
                3. Click <strong>Import</strong> to restore your data
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        {needsBackup && (
          <div className="bg-yellow-50 border-l-2 border-yellow-400 p-2 mb-3 rounded-r text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                {!lastBackupDate ? 'No backup found' : `Last backup ${daysSinceBackup}d ago`}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <button onClick={handleExportData} className="bg-white rounded-lg border border-gray-200 p-3 text-left hover:border-slate-300 transition-colors">
            <Download className="w-4 h-4 text-slate-800 mb-1" />
            <p className="text-xs font-medium text-gray-900">Export</p>
            <p className="text-[10px] text-gray-500">Download backup</p>
          </button>

          <label className="bg-white rounded-lg border border-gray-200 p-3 text-left hover:border-slate-300 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-gray-500 mb-1" />
            <p className="text-xs font-medium text-gray-900">Import</p>
            <p className="text-[10px] text-gray-500">Restore file</p>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <Database className="w-4 h-4 text-gray-500 mb-1" />
            <p className="text-xs font-medium text-gray-900">{formatBytes(dataSize)}</p>
            <p className="text-[10px] text-gray-500">Data size</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {lastBackupDate ? <CheckCircle className="w-4 h-4 text-slate-800 mb-1" /> : <Clock className="w-4 h-4 text-gray-400 mb-1" />}
            <p className="text-xs font-medium text-gray-900">{lastBackupDate ? formatDate(lastBackupDate) : 'Never'}</p>
            <p className="text-[10px] text-gray-500">Last backup</p>
          </div>
        </div>

        {/* Auto-Backup */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-800" />
              <span className="text-xs font-medium text-gray-900">Auto-Backup</span>
            </div>
            <button
              onClick={() => handleAutoBackupToggle(!autoBackupSettings.enabled)}
              className={`relative w-8 h-4 rounded-full transition-colors ${autoBackupSettings.enabled ? 'bg-slate-900' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoBackupSettings.enabled ? 'left-4' : 'left-0.5'}`} />
            </button>
          </div>

          {autoBackupSettings.enabled && (
            <div className="flex gap-1.5 mt-2">
              {(['daily', 'weekly', 'manual'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    autoBackupSettings.frequency === freq ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Google Drive */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-slate-800" />
              <span className="text-xs font-medium text-gray-900">Google Drive</span>
            </div>
            {isGoogleConnected ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleGoogleBackup}
                  disabled={isGoogleLoading}
                  className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  {isGoogleLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Backup
                </button>
                <button onClick={disconnectGoogle} className="p-1 text-gray-400 hover:text-gray-600">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectGoogle}
                disabled={!isGoogleInitialized || isGoogleLoading}
                className="px-2.5 py-1 bg-slate-900 text-white rounded text-[10px] font-medium disabled:bg-gray-300"
              >
                Connect
              </button>
            )}
          </div>

          {isGoogleConnected && (
            <>
              <p className="text-[10px] text-gray-500 mb-2">{googleEmail}</p>
              {googleBackups.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {googleBackups.map(backup => (
                    <div key={backup.id} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-[10px]">
                      <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-700 truncate max-w-[150px]">{backup.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleGoogleRestore(backup.id, backup.name)} className="p-1 text-slate-800 hover:bg-slate-100 rounded">
                          <Download className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleGoogleDelete(backup.id, backup.name)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 text-center py-2">No backups yet</p>
              )}
            </>
          )}

          {googleError && <p className="text-[10px] text-red-500 mt-1">{googleError}</p>}
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-900 mb-2">Backup includes</p>
          <div className="flex flex-wrap gap-1.5">
            {['Settings', 'Transactions', 'Expenses', 'Customers', 'Tables', 'Menu', 'Users', 'Reservations', 'Loyalty'].map(item => (
              <span key={item} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
