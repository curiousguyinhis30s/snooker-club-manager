import { useState } from 'react';
import { Gamepad2, UtensilsCrossed, Settings2, Database, BarChart3, DollarSign, Shield, Users } from 'lucide-react';
import AppSettings from './AppSettings';
import FnBManagement from './FnBManagement';
import TableManagement from './TableManagement';
import BackupSync from './BackupSync';
import AdminDashboard from './AdminDashboard';
import Finance from './Finance';
import RolePermissions from './RolePermissions';
import CustomerManagement from './CustomerManagement';
import type { Settings as SettingsType, Table } from '../types';

interface SettingsHubProps {
  settings: SettingsType;
  tables: Table[];
  onClose: () => void;
  onSaveSettings: (settings: SettingsType) => void;
  onSaveMenuItems: (menuItems: SettingsType['menuItems']) => void;
  onSaveBundles: (bundles: SettingsType['bundles']) => void;
}

type SettingsSection = 'tables' | 'fnb' | 'finance' | 'analytics' | 'customers' | 'backup' | 'permissions' | 'app';

export default function SettingsHub({
  settings,
  tables,
  onClose,
  onSaveSettings,
  onSaveMenuItems,
  onSaveBundles
}: SettingsHubProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('tables');

  const sections = [
    { id: 'tables' as const, icon: Gamepad2, label: 'Activities & Rates', description: 'Tables configuration' },
    { id: 'fnb' as const, icon: UtensilsCrossed, label: 'F&B Menu', description: 'Food & beverages' },
    { id: 'finance' as const, icon: DollarSign, label: 'Finance', description: 'Sales & day closure' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics', description: 'Reports & insights' },
    { id: 'customers' as const, icon: Users, label: 'Customers', description: 'Customer management' },
    { id: 'permissions' as const, icon: Shield, label: 'Role Permissions', description: 'Access control' },
    { id: 'backup' as const, icon: Database, label: 'Backup & Sync', description: 'Data management' },
    { id: 'app' as const, icon: Settings2, label: 'App Settings', description: 'Club preferences' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'tables':
        return <TableManagement settings={settings} onSave={onSaveSettings} />;
      case 'fnb':
        return (
          <FnBManagement
            menuItems={settings.menuItems}
            bundles={settings.bundles}
            onSaveMenuItems={onSaveMenuItems}
            onSaveBundles={onSaveBundles}
          />
        );
      case 'finance':
        return <Finance userRole={settings.userRole} />;
      case 'analytics':
        return <AdminDashboard tables={tables} currency={settings.currency} />;
      case 'customers':
        return <CustomerManagement settings={settings} onUpdateSettings={onSaveSettings} />;
      case 'permissions':
        return <RolePermissions settings={settings} onSave={onSaveSettings} />;
      case 'backup':
        return <BackupSync settings={settings} />;
      case 'app':
        return <AppSettings settings={settings} onSave={onSaveSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sub-Menu Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            ← Back to Bookings
          </button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Configure your system</p>
        </div>

        {/* Sub-Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 border border-slate-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-700' : 'text-gray-400'}`} />
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-medium text-xs ${isActive ? 'text-slate-900' : 'text-gray-700'}`}>
                    {section.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-slate-600' : 'text-gray-500'} truncate`}>
                    {section.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
