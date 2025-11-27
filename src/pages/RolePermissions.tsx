import { useState } from 'react';
import { Shield, Save, RefreshCw } from 'lucide-react';
import type { Settings, UserRole, RolePermissions as RolePermsType } from '../types';
import { store } from '../lib/store';
import { useToast } from '../contexts/ToastContext';

interface RolePermissionsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermsType> = {
  superadmin: {
    canResumeSession: true, canApplyDiscount: true, canCloseDayAccounts: true,
    canManageActivities: true, canManageUsers: true, canViewFinance: true,
    canManageFnB: true, canViewAnalytics: true, canManageSettings: true, canDeleteSessions: true,
  },
  owner: {
    canResumeSession: true, canApplyDiscount: true, canCloseDayAccounts: true,
    canManageActivities: true, canManageUsers: true, canViewFinance: true,
    canManageFnB: true, canViewAnalytics: true, canManageSettings: true, canDeleteSessions: true,
  },
  employee: {
    canResumeSession: false, canApplyDiscount: false, canCloseDayAccounts: false,
    canManageActivities: false, canManageUsers: false, canViewFinance: false,
    canManageFnB: false, canViewAnalytics: false, canManageSettings: false, canDeleteSessions: false,
  },
};

const PERMISSIONS: Array<{ key: keyof RolePermsType; label: string }> = [
  { key: 'canResumeSession', label: 'Resume Sessions' },
  { key: 'canApplyDiscount', label: 'Apply Discounts' },
  { key: 'canCloseDayAccounts', label: 'Close Day' },
  { key: 'canManageActivities', label: 'Manage Activities' },
  { key: 'canManageUsers', label: 'Manage Users' },
  { key: 'canViewFinance', label: 'View Finance' },
  { key: 'canManageFnB', label: 'Manage F&B' },
  { key: 'canViewAnalytics', label: 'View Analytics' },
  { key: 'canManageSettings', label: 'Settings' },
  { key: 'canDeleteSessions', label: 'Delete Sessions' },
];

export default function RolePermissions({ settings, onSave }: RolePermissionsProps) {
  const { showToast } = useToast();
  const [permissions, setPermissions] = useState<Record<UserRole, RolePermsType>>(
    settings.rolePermissions || DEFAULT_PERMISSIONS
  );

  const handleToggle = (role: UserRole, permission: keyof RolePermsType) => {
    if (role === 'superadmin') return;
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [permission]: !prev[role][permission] },
    }));
  };

  const handleSave = () => {
    const updatedSettings = { ...settings, rolePermissions: permissions };
    store.saveSettings(updatedSettings);
    onSave(updatedSettings);
    showToast('Permissions saved', 'success');
  };

  const handleReset = () => {
    if (confirm('Reset all permissions to defaults?')) {
      setPermissions(DEFAULT_PERMISSIONS);
    }
  };

  const roles: UserRole[] = ['employee', 'owner', 'superadmin'];

  return (
    <div className="h-full bg-gray-50 p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-800" />
          <div>
            <h1 className="text-base font-bold text-gray-900">Role Permissions</h1>
            <p className="text-[10px] text-gray-500">Configure access for each role</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleReset} className="px-2 py-1 text-[10px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
          <button onClick={handleSave} className="px-2.5 py-1 text-[10px] bg-slate-800 text-white rounded hover:bg-slate-900 flex items-center gap-1">
            <Save className="w-3 h-3" /> Save
          </button>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-600">Permission</th>
              {roles.map(role => (
                <th key={role} className="text-center py-2 px-2 font-medium text-gray-600 capitalize w-24">
                  {role === 'superadmin' ? 'Admin' : role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(({ key, label }, i) => (
              <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="py-1.5 px-3 text-gray-700">{label}</td>
                {roles.map(role => {
                  const isEnabled = permissions[role][key];
                  const isLocked = role === 'superadmin';
                  return (
                    <td key={role} className="text-center py-1.5 px-2">
                      <button
                        onClick={() => handleToggle(role, key)}
                        disabled={isLocked}
                        className={`w-7 h-4 rounded-full relative transition-colors ${
                          isEnabled ? 'bg-slate-500' : 'bg-gray-300'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
                          isEnabled ? 'left-3.5' : 'left-0.5'
                        }`} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin permissions are locked
        </span>
        <div className="flex gap-4">
          {roles.map(role => (
            <span key={role}>
              <span className="capitalize">{role === 'superadmin' ? 'Admin' : role}:</span>{' '}
              <span className="font-medium text-gray-700">
                {Object.values(permissions[role]).filter(Boolean).length}/10
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
