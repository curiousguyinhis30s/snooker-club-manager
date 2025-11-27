import { useState } from 'react';
import { Save, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { Settings, Activity } from '../types';
import AddActivityDialog from '../components/AddActivityDialog';
import { getEnabledActivities } from '../config/activities';

interface TableManagementProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function TableManagement({ settings, onSave }: TableManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(settings.activities || []);

  const enabledActivities = getEnabledActivities(activities);

  const handleAddActivity = (newActivity: Activity) => {
    const updated = [...activities, newActivity];
    setActivities(updated);
    onSave({ ...settings, activities: updated });
    // Force table regeneration
    localStorage.removeItem('snooker_tables');
  };

  const handleToggleActivity = (activityId: string) => {
    const updated = activities.map(a =>
      a.id === activityId ? { ...a, enabled: !a.enabled } : a
    );
    setActivities(updated);
    onSave({ ...settings, activities: updated });
    // Force table regeneration
    localStorage.removeItem('snooker_tables');
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity? All related tables will be removed.')) {
      return;
    }
    const updated = activities.filter(a => a.id !== activityId);
    setActivities(updated);
    onSave({ ...settings, activities: updated });
    // Force table regeneration
    localStorage.removeItem('snooker_tables');
  };

  const handleUpdateActivity = (activityId: string, field: keyof Activity, value: any) => {
    const updated = activities.map(a =>
      a.id === activityId ? { ...a, [field]: value } : a
    );
    setActivities(updated);
    onSave({ ...settings, activities: updated });
    // Force table regeneration if station count changed
    if (field === 'stationCount') {
      localStorage.removeItem('snooker_tables');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Activities & Rates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your activities and their hourly rates. {enabledActivities.length} active activities.
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
              activity.enabled
                ? 'border-gray-200'
                : 'border-gray-100 opacity-60'
            }`}
          >
            <div className={`bg-gradient-to-r ${activity.gradient} text-white p-4 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{activity.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{activity.name}</div>
                    <div className="text-sm opacity-90">
                      {activity.stationCount} {activity.stationType}{activity.stationCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActivity(activity.id)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={activity.enabled ? 'Disable' : 'Enable'}
                >
                  {activity.enabled ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hourly Rate (SAR)
                </label>
                <input
                  type="number"
                  value={activity.defaultRate}
                  onChange={(e) => handleUpdateActivity(activity.id, 'defaultRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  disabled={!activity.enabled}
                />
              </div>

              {/* Station Count */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Number of {activity.stationType}s
                </label>
                <input
                  type="number"
                  value={activity.stationCount}
                  onChange={(e) => handleUpdateActivity(activity.id, 'stationCount', parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  disabled={!activity.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {activity.enabled ? 'Changes will regenerate tables' : 'Enable to edit'}
                </p>
              </div>

              {/* Delete Button (for custom activities only) */}
              {activity.order > 10 && (
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Activity</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first activity to get started managing your venue
          </p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Activity</span>
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Enable/disable activities using the toggle switch</li>
          <li>Adjust rates and station counts anytime</li>
          <li>Changing station count will regenerate tables automatically</li>
          <li>You can add unlimited custom activities</li>
        </ul>
      </div>

      {/* Add Activity Dialog */}
      {showAddDialog && (
        <AddActivityDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddActivity}
          existingActivities={activities}
        />
      )}
    </div>
  );
}
