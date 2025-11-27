import { LayoutGrid, Users, FileText, Receipt, MoreHorizontal } from 'lucide-react';
import type { Settings as SettingsType, User as UserType } from '../types';
import { getEnabledActivities } from '../config/activities';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  settings: SettingsType;
  currentUser: UserType | null;
}

export default function BottomNav({ currentView, onViewChange, settings, currentUser }: BottomNavProps) {
  const enabledActivities = getEnabledActivities(settings.activities || []);
  const firstActivityView = enabledActivities.length > 0 ? `bookings-${enabledActivities[0].id}` : '';

  // Check if current view is any booking view
  const isBookingsActive = currentView.startsWith('bookings-');
  const isSettingsActive = currentView.startsWith('settings-');

  const navItems = [
    {
      id: 'tables',
      icon: LayoutGrid,
      label: 'Tables',
      isActive: isBookingsActive,
      onClick: () => onViewChange(firstActivityView),
    },
    {
      id: 'customers',
      icon: Users,
      label: 'Customers',
      isActive: currentView === 'customers',
      onClick: () => onViewChange('customers'),
    },
    {
      id: 'bills-history',
      icon: FileText,
      label: 'Bills',
      isActive: currentView === 'bills-history',
      onClick: () => onViewChange('bills-history'),
    },
    {
      id: 'expenses',
      icon: Receipt,
      label: 'Expenses',
      isActive: currentView === 'expenses',
      onClick: () => onViewChange('expenses'),
    },
    {
      id: 'more',
      icon: MoreHorizontal,
      label: 'More',
      isActive: isSettingsActive,
      onClick: () => onViewChange('settings-app'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                item.isActive
                  ? 'text-slate-900'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${item.isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] ${item.isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
