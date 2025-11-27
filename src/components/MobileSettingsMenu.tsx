import { ChevronRight, User, UtensilsCrossed, BarChart3, Shield, Activity, Database, Sliders, ArrowLeft, LogOut } from 'lucide-react';
import type { User as UserType } from '../types';

interface MobileSettingsMenuProps {
  currentUser: UserType | null;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  onBack: () => void;
}

export default function MobileSettingsMenu({ currentUser, currentView, onViewChange, onLogout, onBack }: MobileSettingsMenuProps) {
  const isEmployee = currentUser?.role === 'employee';
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'superadmin';

  const menuItems = [
    { id: 'settings-users', icon: User, label: 'Users', description: 'Manage users', show: !isEmployee },
    { id: 'settings-fnb', icon: UtensilsCrossed, label: 'F&B Menu', description: 'Food & beverages', show: true },
    { id: 'settings-analytics', icon: BarChart3, label: 'Analytics', description: 'Reports & insights', show: true },
    { id: 'settings-permissions', icon: Shield, label: 'Permissions', description: 'Role access control', show: isOwnerOrAdmin },
    { id: 'settings-activities', icon: Activity, label: 'Activities', description: 'Manage activities', show: isOwnerOrAdmin },
    { id: 'settings-backup', icon: Database, label: 'Backup & Sync', description: 'Data management', show: isOwnerOrAdmin },
    { id: 'settings-app', icon: Sliders, label: 'App Settings', description: 'Club preferences', show: true },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-base font-semibold text-gray-900">Settings</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-3">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-slate-50' : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <span className="text-[10px] text-gray-400 truncate">{item.description}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-200 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Log Out</span>
        </button>

        {/* User Info */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400">
            Logged in as <span className="font-medium text-gray-600">{currentUser?.name}</span> • <span className="capitalize">{currentUser?.role}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
