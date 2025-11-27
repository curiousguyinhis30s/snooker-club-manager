import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, User, Coffee, Lock } from 'lucide-react';
import type { Table, UserRole } from '../types';
import { getCurrentUser } from '../lib/auth';

interface TableCardProps {
  table: Table;
  onStart: (tableId: number) => void;
  onPause: (tableId: number) => void;
  onResume: (tableId: number) => void;
  onStop: (tableId: number) => void;
  onAddFood: (tableId: number) => void;
  userRole?: UserRole;
}

export default function TableCard({ table, onStart, onPause, onResume, onStop, onAddFood, userRole = 'employee' }: TableCardProps) {
  const currentUser = getCurrentUser();
  const canResume = userRole === 'owner' || userRole === 'superadmin';
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (table.status === 'occupied' && table.session) {
      const interval = setInterval(() => {
        const now = Date.now();
        const duration = now - table.session!.startTime - table.session!.pausedDuration;
        setElapsed(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [table.status, table.session]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (table.status) {
      case 'available': return 'from-teal-500 to-teal-600';
      case 'occupied': return 'from-indigo-500 to-indigo-600';
      case 'paused': return 'from-amber-500 to-amber-600';
    }
  };

  const getStatusText = () => {
    switch (table.status) {
      case 'available': return 'Available';
      case 'occupied': return 'In Session';
      case 'paused': return 'Paused';
    }
  };

  const calculateAmount = () => {
    if (!table.session) return 0;
    const hours = elapsed / (1000 * 60 * 60);
    const tableCharge = hours * table.session.hourlyRate;
    const foodCharge = table.session.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return tableCharge + foodCharge;
  };

  return (
    <div className={`bg-gradient-to-br ${getStatusColor()} rounded-xl shadow-lg text-white transition-all transform hover:scale-105`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{table.number}</h3>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            {getStatusText()}
          </span>
        </div>

        {/* Session Info */}
        {table.session ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span className="truncate">{table.session.customerName}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-2xl font-mono font-bold">{formatTime(elapsed)}</span>
              </div>
            </div>

            {table.session.foodItems.length > 0 && (
              <div className="text-xs opacity-90">
                <Coffee className="w-3 h-3 inline mr-1" />
                {table.session.foodItems.length} item{table.session.foodItems.length > 1 ? 's' : ''}
              </div>
            )}

            <div className="pt-2 border-t border-white/20">
              <div className="text-sm opacity-90">Current Amount</div>
              <div className="text-2xl font-bold">${calculateAmount().toFixed(2)}</div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onAddFood(table.id)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 flex items-center justify-center space-x-2 transition-colors"
              >
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">Add F&B</span>
              </button>

              <div className="flex space-x-2">
                {table.status === 'occupied' && (
                  <>
                    <button
                      onClick={() => onPause(table.id)}
                      className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      <span className="text-sm font-medium">Pause</span>
                    </button>
                    <button
                      onClick={() => onStop(table.id)}
                      className="flex-1 bg-red-500/80 hover:bg-red-600 rounded-lg py-2 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      <span className="text-sm font-medium">End</span>
                    </button>
                  </>
                )}

                {table.status === 'paused' && (
                  <>
                    {canResume ? (
                      <button
                        onClick={() => onResume(table.id)}
                        className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Resume</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-white/10 rounded-lg py-2 flex items-center justify-center space-x-1 opacity-50 cursor-not-allowed"
                        title="Only Owner and SuperAdmin can resume sessions"
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Locked</span>
                      </button>
                    )}
                    <button
                      onClick={() => onStop(table.id)}
                      className="flex-1 bg-red-500/80 hover:bg-red-600 rounded-lg py-2 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      <span className="text-sm font-medium">End</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <button
              onClick={() => onStart(table.id)}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-6 py-3 flex items-center space-x-2 mx-auto transition-colors"
            >
              <Play className="w-5 h-5" />
              <span className="font-medium">Start Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
