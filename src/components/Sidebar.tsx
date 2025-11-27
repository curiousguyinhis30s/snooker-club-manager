import { useState, useEffect } from 'react';
import { Calendar, Users, Settings, UtensilsCrossed, BarChart3, Database, Sliders, LogOut, User, Shield, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Activity, Receipt, FileText } from 'lucide-react';
import { getEnabledActivities } from '../config/activities';
import { useSidebar } from '../hooks/useSidebar';
import type { Settings as SettingsType, User as UserType } from '../types';
import SnookerBallIcon from './icons/SnookerBallIcon';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  clubName: string;
  settings: SettingsType;
  currentUser: UserType | null;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, clubName, settings, currentUser, onLogout }: SidebarProps) {
  const enabledActivities = getEnabledActivities(settings.activities || []);
  const isEmployee = currentUser?.role === 'employee';
  const { isCollapsed, bookingsExpanded, settingsExpanded, toggleSidebar, toggleBookings, toggleSettings } = useSidebar();

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-56';

  const NavButton = ({
    active,
    onClick,
    icon: Icon,
    emoji,
    label,
    subLabel,
    collapsed,
  }: {
    active?: boolean;
    onClick: () => void;
    icon?: any;
    emoji?: string;
    label: string;
    subLabel?: string;
    collapsed?: boolean;
  }) => {
    const baseClasses = "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150";
    const activeClasses = "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-sm";
    const inactiveClasses = "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80";

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${collapsed ? 'justify-center px-0' : ''}`}
        title={collapsed ? label : undefined}
      >
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        {emoji && <span className="text-base flex-shrink-0">{emoji}</span>}
        {!collapsed && (
          <span className="truncate">{label}</span>
        )}
      </button>
    );
  };

  return (
    <div className={`relative h-screen bg-gray-50 border-r border-gray-200 ${sidebarWidth} flex flex-col transition-all duration-200`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>

      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
            <SnookerBallIcon className="w-full h-full" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{clubName}</h1>
              <p className="text-[11px] text-gray-500">Club Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Bookings Section */}
        <div className="space-y-0.5">
          <button
            onClick={isCollapsed ? undefined : toggleBookings}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wider">Bookings</span>
                {bookingsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </>
            )}
          </button>

          {(!isCollapsed && bookingsExpanded) && enabledActivities.map((activity) => (
            <NavButton
              key={activity.id}
              active={currentView === `bookings-${activity.id}`}
              onClick={() => onViewChange(`bookings-${activity.id}`)}
              emoji={activity.icon}
              label={activity.name}
            />
          ))}

          {isCollapsed && enabledActivities.slice(0, 3).map((activity) => (
            <NavButton
              key={activity.id}
              active={currentView === `bookings-${activity.id}`}
              onClick={() => onViewChange(`bookings-${activity.id}`)}
              emoji={activity.icon}
              label={activity.name}
              collapsed
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        {/* Main Navigation */}
        <NavButton
          active={currentView === 'customers'}
          onClick={() => onViewChange('customers')}
          icon={Users}
          label="Customers"
          collapsed={isCollapsed}
        />

        <NavButton
          active={currentView === 'expenses'}
          onClick={() => onViewChange('expenses')}
          icon={Receipt}
          label="Expenses"
          collapsed={isCollapsed}
        />

        <NavButton
          active={currentView === 'bills-history'}
          onClick={() => onViewChange('bills-history')}
          icon={FileText}
          label="Bills History"
          collapsed={isCollapsed}
        />

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        {/* Settings Section */}
        <div className="space-y-0.5">
          <button
            onClick={isCollapsed ? undefined : toggleSettings}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wider">Settings</span>
                {settingsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </>
            )}
          </button>

          {(!isCollapsed && settingsExpanded) && (
            <div className="space-y-0.5">
              {!isEmployee && (
                <NavButton
                  active={currentView === 'settings-users'}
                  onClick={() => onViewChange('settings-users')}
                  icon={User}
                  label="Users"
                />
              )}
              <NavButton
                active={currentView === 'settings-fnb'}
                onClick={() => onViewChange('settings-fnb')}
                icon={UtensilsCrossed}
                label="F&B Menu"
              />
              <NavButton
                active={currentView === 'settings-analytics'}
                onClick={() => onViewChange('settings-analytics')}
                icon={BarChart3}
                label="Analytics"
              />
              {!isEmployee && (
                <>
                  <NavButton
                    active={currentView === 'settings-permissions'}
                    onClick={() => onViewChange('settings-permissions')}
                    icon={Shield}
                    label="Permissions"
                  />
                  <NavButton
                    active={currentView === 'settings-activities'}
                    onClick={() => onViewChange('settings-activities')}
                    icon={Activity}
                    label="Activities"
                  />
                  <NavButton
                    active={currentView === 'settings-backup'}
                    onClick={() => onViewChange('settings-backup')}
                    icon={Database}
                    label="Backup"
                  />
                </>
              )}
              <NavButton
                active={currentView === 'settings-app'}
                onClick={() => onViewChange('settings-app')}
                icon={Sliders}
                label="App Settings"
              />
            </div>
          )}

          {isCollapsed && (
            <NavButton
              active={currentView.startsWith('settings-')}
              onClick={() => onViewChange('settings-app')}
              icon={Sliders}
              label="Settings"
              collapsed
            />
          )}
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg text-[13px] font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <User className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
