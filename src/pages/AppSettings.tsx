import { useState } from 'react';
import { Save, Building2, Globe, Activity as ActivityIcon, Eye, Lock, Settings2 } from 'lucide-react';
import type { Settings, Activity, UserRole } from '../types';

interface AppSettingsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  userRole: UserRole;
}

export default function AppSettings({ settings, onSave, userRole }: AppSettingsProps) {
  const isEmployee = userRole === 'employee';
  const [clubName, setClubName] = useState(settings.clubName);
  const [numberOfTables, setNumberOfTables] = useState(settings.numberOfTables);
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [currency, setCurrency] = useState(settings.currency);
  const [activities, setActivities] = useState<Activity[]>(settings.activities || []);
  const [isSaving, setIsSaving] = useState(false);

  const [clubPhone, setClubPhone] = useState(settings.clubPhone || '');
  const [clubEmail, setClubEmail] = useState(settings.clubEmail || '');
  const [clubAddress, setClubAddress] = useState(settings.clubAddress || '');
  const [taxId, setTaxId] = useState(settings.taxId || '');

  const toggleActivity = (activityId: string) => {
    if (isEmployee) return;
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const updateActivityRate = (activityId: string, newRate: number) => {
    if (isEmployee) return;
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, defaultRate: newRate } : a
    ));
  };

  const updateActivityStations = (activityId: string, newCount: number) => {
    if (isEmployee) return;
    setActivities(activities.map(a =>
      a.id === activityId ? { ...a, stationCount: newCount } : a
    ));
  };

  const totalStations = activities.filter(a => a.enabled).reduce((sum, a) => sum + a.stationCount, 0);
  const enabledCount = activities.filter(a => a.enabled).length;

  const handleSave = () => {
    setIsSaving(true);
    const updatedSettings = {
      ...settings,
      clubName,
      numberOfTables,
      hourlyRate,
      currency,
      activities,
      clubPhone,
      clubEmail,
      clubAddress,
      taxId,
      _version: 2,
    };

    onSave(updatedSettings);
    localStorage.removeItem('snooker_tables');

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="h-full bg-gray-50/50 p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">App Settings</h1>
            <p className="text-[10px] text-gray-400">Configure your club</p>
          </div>
        </div>
        {!isEmployee && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              isSaving
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* View-only Banner */}
      {isEmployee && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs text-amber-700">View-only mode. Contact owner for changes.</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto space-y-3">
        {/* Club Information */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-gray-800">Club Information</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-6 md:col-span-3">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Club Name</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all ${isEmployee ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  placeholder="Your club name"
                />
              </div>
              <div className="col-span-3 md:col-span-1">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                <input
                  type="tel"
                  value={clubPhone}
                  onChange={(e) => setClubPhone(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all ${isEmployee ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  placeholder="Phone"
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                <input
                  type="email"
                  value={clubEmail}
                  onChange={(e) => setClubEmail(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all ${isEmployee ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  placeholder="contact@club.com"
                />
              </div>
              <div className="col-span-4 md:col-span-4">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Address</label>
                <input
                  type="text"
                  value={clubAddress}
                  onChange={(e) => setClubAddress(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all ${isEmployee ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  placeholder="Street, City, Country"
                />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Tax ID</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all ${isEmployee ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  placeholder="VAT/Tax number"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-gray-800">Activities</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span>{enabledCount} active</span>
              <span className="text-gray-300">|</span>
              <span>{totalStations} stations</span>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`group relative p-3 rounded-lg border transition-all ${
                    activity.enabled
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-gray-100 bg-gray-50/50 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{activity.icon}</span>
                    {activity.enabled && (
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-gray-800 mb-2 truncate">{activity.name}</h4>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-0.5">Stations</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={activity.stationCount}
                        onChange={(e) => updateActivityStations(activity.id, parseInt(e.target.value) || 1)}
                        disabled={isEmployee}
                        className={`w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-slate-400 ${isEmployee ? 'bg-gray-100' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 mb-0.5">{currency}/hr</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={activity.defaultRate}
                        onChange={(e) => updateActivityRate(activity.id, parseFloat(e.target.value) || 1)}
                        disabled={isEmployee}
                        className={`w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-slate-400 ${isEmployee ? 'bg-gray-100' : 'bg-white'}`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActivity(activity.id)}
                    disabled={isEmployee}
                    className={`w-full py-1.5 rounded-md text-[10px] font-medium transition-all ${
                      isEmployee
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : activity.enabled
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    {activity.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Currency & Summary */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-gray-800">Currency & Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={isEmployee}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 ${isEmployee ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="SAR">🇸🇦 Saudi Riyal (SAR)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="GBP">🇬🇧 British Pound (GBP)</option>
                  <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                  <option value="INR">🇮🇳 Indian Rupee (INR)</option>
                </select>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Total Stations</p>
                <p className="text-lg font-semibold text-slate-700">{totalStations}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Activities</p>
                <p className="text-lg font-semibold text-slate-700">{enabledCount}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 text-center border border-indigo-200">
                <p className="text-[10px] text-indigo-600 mb-0.5">Status</p>
                <p className="text-sm font-semibold text-indigo-700">✓ Ready</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
