import { LogOut, User } from 'lucide-react';
import type { User as UserType } from '../types';
import SnookerBallIcon from './icons/SnookerBallIcon';

interface MobileHeaderProps {
  clubName: string;
  currentUser: UserType | null;
  onLogout: () => void;
}

export default function MobileHeader({ clubName, currentUser, onLogout }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Club Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
            <SnookerBallIcon className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">{clubName}</h1>
            <p className="text-[10px] text-gray-500 capitalize">{currentUser?.role || 'User'}</p>
          </div>
        </div>

        {/* User & Logout */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
