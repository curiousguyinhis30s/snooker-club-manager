import { useState } from 'react';
import GameCard from '../components/GameCard';
import StartSessionModal from '../components/StartSessionModal';
import BillingModal from '../components/BillingModal';
import FoodMenuModal from '../components/FoodMenuModal';
import SnookerBallIcon from '../components/icons/SnookerBallIcon';
import type { Table, Session, MenuItem, Bundle, UserRole } from '../types';

interface TablesViewProps {
  tables: Table[];
  menuItems: MenuItem[];
  bundles: Bundle[];
  activityId?: string;
  userRole?: UserRole;
  onStartSession: (tableId: number, name: string, phone?: string) => void;
  onPauseSession: (tableId: number) => void;
  onResumeSession: (tableId: number) => void;
  onStopSession: (tableId: number) => void;
  onAddFood: (tableId: number, menuItemId: string, quantity: number) => void;
  onAddBundle: (tableId: number, bundleId: string, quantity: number) => void;
  onRemoveFood: (tableId: number, itemId: string) => void;
  onConfirmPayment: (tableId: number) => void;
}

export default function TablesView({
  tables,
  menuItems,
  bundles,
  activityId,
  userRole,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onStopSession,
  onAddFood,
  onAddBundle,
  onRemoveFood,
  onConfirmPayment
}: TablesViewProps) {
  const [startingTable, setStartingTable] = useState<number | null>(null);
  const [billingSession, setBillingSession] = useState<{ session: Session; tableNumber: string; tableId: number } | null>(null);
  const [foodMenuTable, setFoodMenuTable] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'paused'>('all');

  const handleStartSession = (tableId: number) => {
    setStartingTable(tableId);
  };

  const confirmStartSession = (name: string, phone?: string) => {
    if (startingTable) {
      onStartSession(startingTable, name, phone);
      setStartingTable(null);
    }
  };

  const handleStopSession = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.session) {
      setBillingSession({ session: table.session, tableNumber: table.number, tableId });
    }
  };

  const handleConfirmPayment = () => {
    if (billingSession) {
      onConfirmPayment(billingSession.tableId);
      setBillingSession(null);
    }
  };

  const handleAddFoodItem = (menuItemId: string, quantity: number) => {
    if (foodMenuTable) {
      onAddFood(foodMenuTable, menuItemId, quantity);
    }
  };

  const handleAddBundle = (bundleId: string, quantity: number) => {
    if (foodMenuTable) {
      onAddBundle(foodMenuTable, bundleId, quantity);
    }
  };

  // Filter by activity first, then by status
  const activityFilteredTables = activityId
    ? tables.filter(t => t.activityId === activityId)
    : tables;

  const filteredTables = filter === 'all'
    ? activityFilteredTables
    : activityFilteredTables.filter(t => t.status === filter);

  const stats = {
    all: activityFilteredTables.length,
    available: activityFilteredTables.filter(t => t.status === 'available').length,
    occupied: activityFilteredTables.filter(t => t.status === 'occupied').length,
    paused: activityFilteredTables.filter(t => t.status === 'paused').length,
  };

  const filterButtons = [
    { id: 'all', label: 'All', count: stats.all, color: 'gray' },
    { id: 'available', label: 'Available', count: stats.available, color: 'amber' },
    { id: 'occupied', label: 'Occupied', count: stats.occupied, color: 'blue' },
    { id: 'paused', label: 'Paused', count: stats.paused, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 py-3 lg:px-6 lg:py-4">
          {/* Mobile Header - Compact & Centered */}
          <div className="lg:hidden">
            {/* Stats Row - Centered */}
            <div className="flex items-center justify-center gap-8 mb-3">
              {filterButtons.slice(1).map((btn) => {
                const colorMap: Record<string, string> = {
                  amber: 'text-slate-800',
                  blue: 'text-blue-600',
                  orange: 'text-orange-600',
                  gray: 'text-gray-600',
                };

                return (
                  <div key={btn.id} className="text-center">
                    <div className={`text-2xl font-bold ${colorMap[btn.color]} transition-transform active:scale-95`}>
                      {btn.count}
                    </div>
                    <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                      {btn.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter Tabs - Centered */}
            <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Table status filters">
              {filterButtons.map((btn) => {
                const isActive = filter === btn.id;
                const colorMap: Record<string, { active: string; inactive: string }> = {
                  gray: { active: 'bg-gray-900 text-white', inactive: 'text-gray-600 bg-gray-100' },
                  amber: { active: 'bg-slate-800 text-white', inactive: 'text-slate-800 bg-slate-50' },
                  blue: { active: 'bg-blue-600 text-white', inactive: 'text-blue-700 bg-blue-50' },
                  orange: { active: 'bg-orange-500 text-white', inactive: 'text-orange-700 bg-orange-50' },
                };
                const colors = colorMap[btn.color];

                return (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id as any)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="tables-grid"
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                      isActive ? colors.active : colors.inactive
                    }`}
                  >
                    <span>{btn.label}</span>
                    <span className={`ml-1 text-[10px] font-bold ${
                      isActive ? 'opacity-70' : 'opacity-60'
                    }`}>
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-4">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your table sessions</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                {filterButtons.slice(1).map((btn) => {
                  const colorMap: Record<string, string> = {
                    amber: 'text-slate-800',
                    blue: 'text-blue-600',
                    orange: 'text-orange-600',
                    gray: 'text-gray-600',
                  };

                  return (
                    <div key={btn.id} className="text-center">
                      <div className={`text-3xl font-bold ${colorMap[btn.color]}`}>
                        {btn.count}
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {btn.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex gap-2" role="tablist" aria-label="Table status filters">
              {filterButtons.map((btn) => {
                const isActive = filter === btn.id;
                const colorMap: Record<string, { active: string; inactive: string }> = {
                  gray: { active: 'bg-gray-900 text-white', inactive: 'text-gray-600 hover:bg-gray-100' },
                  amber: { active: 'bg-slate-800 text-white', inactive: 'text-slate-800 hover:bg-slate-50' },
                  blue: { active: 'bg-blue-600 text-white', inactive: 'text-blue-700 hover:bg-blue-50' },
                  orange: { active: 'bg-orange-500 text-white', inactive: 'text-orange-700 hover:bg-orange-50' },
                };
                const colors = colorMap[btn.color];

                return (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id as any)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="tables-grid"
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isActive ? colors.active : colors.inactive
                    }`}
                  >
                    <span>{btn.label}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold ${
                      isActive ? 'bg-white/20' : 'bg-gray-200/50'
                    }`}>
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 lg:p-6">
        {/* Tables Grid */}
        <div id="tables-grid" role="tabpanel" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <GameCard
              key={table.id}
              table={table}
              onStart={handleStartSession}
              onPause={onPauseSession}
              onResume={onResumeSession}
              onStop={handleStopSession}
              onAddFood={(id) => setFoodMenuTable(id)}
              onRemoveFood={onRemoveFood}
              userRole={userRole}
            />
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="w-16 h-16 mx-auto mb-4">
                <SnookerBallIcon className="w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tables found</h3>
              <p className="text-gray-500">No tables match the selected filter</p>
            </div>
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
          onConfirm={handleConfirmPayment}
          userRole={userRole}
        />
      )}

      {foodMenuTable !== null && (
        <FoodMenuModal
          tableNumber={tables.find(t => t.id === foodMenuTable)?.number || ''}
          menuItems={menuItems}
          bundles={bundles}
          onClose={() => setFoodMenuTable(null)}
          onAddItem={handleAddFoodItem}
          onAddBundle={handleAddBundle}
        />
      )}
    </div>
  );
}
