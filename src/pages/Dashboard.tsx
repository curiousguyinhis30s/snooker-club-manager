import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, TrendingUp, DollarSign, Clock, Receipt } from 'lucide-react';
import TableCard from '../components/TableCard';
import StartSessionModal from '../components/StartSessionModal';
import BillingModal from '../components/BillingModal';
import FoodMenuModal from '../components/FoodMenuModal';
import ExpenseModal from '../components/ExpenseModal';
import SettingsHub from './SettingsHub';
import { LoadingSkeleton, LoadingSpinner } from '../components/ui/LoadingSpinner';
import { store } from '../lib/store';
import type { Table, Session } from '../types';

export default function Dashboard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState(store.getSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [startingTable, setStartingTable] = useState<number | null>(null);
  const [billingSession, setBillingSession] = useState<{ session: Session; tableNumber: string } | null>(null);
  const [foodMenuTable, setFoodMenuTable] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    // Brief loading state for visual feedback
    setTimeout(() => {
      setTables(store.getTables());
      setIsLoading(false);
    }, 300);
  }, []);

  const handleStartSession = (tableId: number) => {
    setStartingTable(tableId);
  };

  const confirmStartSession = (name: string, phone?: string) => {
    if (startingTable) {
      const updatedTables = store.startSession(startingTable, name, phone);
      setTables(updatedTables);
    }
  };

  const handlePauseSession = (tableId: number) => {
    const updatedTables = store.pauseSession(tableId);
    setTables(updatedTables);
  };

  const handleResumeSession = (tableId: number) => {
    const updatedTables = store.resumeSession(tableId);
    setTables(updatedTables);
  };

  const handleStopSession = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.session) {
      setBillingSession({ session: table.session, tableNumber: table.number });
    }
  };

  const handleAddFood = (tableId: number) => {
    setFoodMenuTable(tableId);
  };

  const handleAddFoodItem = (menuItemId: string, quantity: number) => {
    if (foodMenuTable) {
      const updatedTables = store.addFoodItem(foodMenuTable, menuItemId, quantity);
      setTables(updatedTables);
    }
  };

  const confirmPayment = () => {
    if (billingSession) {
      const tableId = tables.find(t => t.session?.id === billingSession.session.id)?.id;
      if (tableId) {
        const { tables: updatedTables } = store.endSession(tableId);
        setTables(updatedTables);
      }
    }
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    setSettings(store.getSettings());
    setTables(store.getTables());
  };

  const handleSaveSettings = (newSettings: typeof settings) => {
    store.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveMenuItems = (menuItems: typeof settings.menuItems) => {
    const updatedSettings = { ...settings, menuItems };
    store.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleSaveBundles = (bundles: typeof settings.bundles) => {
    const updatedSettings = { ...settings, bundles };
    store.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    paused: tables.filter(t => t.status === 'paused').length,
    revenue: tables
      .filter(t => t.session)
      .reduce((sum, t) => {
        const duration = Date.now() - t.session!.startTime - t.session!.pausedDuration;
        const hours = duration / (1000 * 60 * 60);
        return sum + (hours * t.session!.hourlyRate);
      }, 0),
  };

  if (showSettings) {
    return (
      <SettingsHub
        settings={settings}
        tables={tables}
        onClose={handleCloseSettings}
        onSaveSettings={handleSaveSettings}
        onSaveMenuItems={handleSaveMenuItems}
        onSaveBundles={handleSaveBundles}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Bar - Clean & Minimal */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎱</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{settings.clubName}</h1>
                <p className="text-[10px] text-gray-400">Booking Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Stats Row - Elevated with Strategic Accents */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Available</p>
                <p className="text-2xl font-semibold text-gray-900 mt-0.5">{stats.available}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(stats.available / tables.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">In Session</p>
                <p className="text-2xl font-semibold text-gray-900 mt-0.5">{stats.occupied}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stats.occupied / tables.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Paused</p>
                <p className="text-2xl font-semibold text-gray-900 mt-0.5">{stats.paused}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.paused / tables.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Revenue</p>
                <p className="text-2xl font-semibold text-white mt-0.5">
                  {settings.currency}{stats.revenue.toFixed(0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Live earnings today</p>
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <LoadingSkeleton count={6} type="card" />
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tables Configured</h3>
            <p className="text-gray-500 mb-4">Configure tables in settings to start managing sessions</p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg transition-colors shadow-sm"
            >
              Go to Settings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onStart={handleStartSession}
                onPause={handlePauseSession}
                onResume={handleResumeSession}
                onStop={handleStopSession}
                onAddFood={handleAddFood}
                userRole={settings.userRole}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {startingTable !== null && (
        <StartSessionModal
          tableNumber={tables.find(t => t.id === startingTable)?.number || ''}
          onClose={() => setStartingTable(null)}
          onStart={confirmStartSession}
        />
      )}

      {billingSession && (
        <BillingModal
          session={billingSession.session}
          tableNumber={billingSession.tableNumber}
          onClose={() => setBillingSession(null)}
          onConfirm={confirmPayment}
        />
      )}

      {foodMenuTable !== null && (
        <FoodMenuModal
          tableNumber={tables.find(t => t.id === foodMenuTable)?.number || ''}
          menuItems={settings.menuItems}
          onClose={() => setFoodMenuTable(null)}
          onAddItem={handleAddFoodItem}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => {
            // Refresh tables if needed
            setTables(store.getTables());
          }}
        />
      )}
    </div>
  );
}
