import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, User, Coffee, Wrench, Lock, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Table, UserRole } from '../types';
import { getGameConfig } from '../config/gameTypes';
import { formatCurrencyCompact, formatRate } from '../lib/currency';

interface GameCardProps {
  table: Table;
  onStart: (tableId: number) => void;
  onPause: (tableId: number) => void;
  onResume: (tableId: number) => void;
  onStop: (tableId: number) => void;
  onAddFood: (tableId: number) => void;
  onRemoveFood: (tableId: number, itemId: string) => void;
  userRole?: UserRole;
}

export default function GameCard({ table, onStart, onPause, onResume, onStop, onAddFood, onRemoveFood, userRole = 'employee' }: GameCardProps) {
  const canResume = userRole === 'owner' || userRole === 'superadmin';
  const gameConfig = getGameConfig(table.type);
  const [elapsed, setElapsed] = useState(0);
  const [showFoodItems, setShowFoodItems] = useState(false);

  const handleRemoveFoodItem = (itemId: string, itemName: string) => {
    if (window.confirm(`Remove "${itemName}" from this session?`)) {
      onRemoveFood(table.id, itemId);
    }
  };

  const handleEndSession = () => {
    const customerName = table.session?.customerName || 'this customer';
    if (window.confirm(`End session for ${customerName} and proceed to billing?`)) {
      onStop(table.id);
    }
  };

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

  const getStatusConfig = () => {
    switch (table.status) {
      case 'available':
        return { text: 'Available', color: 'text-slate-800', dot: 'bg-slate-800', cardBorder: 'border-gray-200' };
      case 'occupied':
        return { text: 'In Session', color: 'text-slate-800', dot: 'bg-slate-800 animate-pulse', cardBorder: 'border-slate-200 ring-1 ring-slate-100' };
      case 'paused':
        return { text: 'Paused', color: 'text-slate-800', dot: 'bg-slate-500', cardBorder: 'border-slate-200' };
      case 'maintenance':
        return { text: 'Maintenance', color: 'text-gray-500', dot: 'bg-gray-400', cardBorder: 'border-gray-200' };
      default:
        return { text: 'Unknown', color: 'text-gray-500', dot: 'bg-gray-400', cardBorder: 'border-gray-200' };
    }
  };

  const calculateAmount = () => {
    if (!table.session) return 0;
    const totalMinutes = elapsed / (1000 * 60);
    const rate = table.hourlyRate || table.session.hourlyRate || 10;

    let tableCharge = 0;
    if (totalMinutes <= 60) {
      tableCharge = rate;
    } else {
      tableCharge = rate;
      const remainingMinutes = totalMinutes - 60;
      const additionalHalfHours = Math.ceil(remainingMinutes / 30);
      tableCharge += (additionalHalfHours * (rate / 2));
    }

    const foodCharge = table.session.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return tableCharge + foodCharge;
  };

  const statusConfig = getStatusConfig();
  const foodTotal = table.session?.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div className={`bg-white rounded-xl border ${statusConfig.cardBorder} overflow-hidden transition-all duration-200`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-xl">{gameConfig.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{table.number}</h3>
              <p className="text-xs text-gray-500">{gameConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
            <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.text}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {table.session ? (
          <div className="space-y-3">
            {/* Customer & Timer Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                  {table.session.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{table.session.customerName}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatTime(elapsed)}
                </span>
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-lg font-semibold text-gray-900" dir="auto">
                  {formatCurrencyCompact(calculateAmount())}
                </span>
              </div>

              {/* F&B Items Section */}
              {table.session.foodItems.length > 0 && (
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => setShowFoodItems(!showFoodItems)}
                    className="w-full flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-500">
                      {table.session.foodItems.length} F&B item{table.session.foodItems.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700" dir="auto">
                        {formatCurrencyCompact(foodTotal)}
                      </span>
                      {showFoodItems ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {showFoodItems && (
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                      {table.session.foodItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-700" dir="auto">
                              {formatCurrencyCompact(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => handleRemoveFoodItem(item.id, item.name)}
                              className="p-0.5 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onAddFood(table.id)}
                className="flex items-center justify-center gap-1 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>F&B</span>
              </button>

              {table.status === 'paused' ? (
                canResume ? (
                  <button
                    onClick={() => onResume(table.id)}
                    className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </button>
                )
              ) : (
                <button
                  onClick={() => onPause(table.id)}
                  className="flex items-center justify-center gap-1 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleEndSession}
                className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>End</span>
              </button>
            </div>
          </div>
        ) : (
          /* Available State */
          <div className="py-4">
            {table.status === 'maintenance' ? (
              <div className="text-center py-2">
                <Wrench className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">Under Maintenance</p>
              </div>
            ) : (
              <button
                onClick={() => onStart(table.id)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Start Session</span>
                <span className="text-slate-200 ml-1" dir="auto">
                  {formatRate(table.hourlyRate || 10)}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
