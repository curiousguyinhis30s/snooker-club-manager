import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Lock, Unlock } from 'lucide-react';
import { financeStore } from '../lib/financeStore';
import { formatCurrencyCompact } from '../lib/currency';
import type { DayClosureRecord, SalesTransaction, UserRole } from '../types';
import { getCurrentUser } from '../lib/auth';

interface FinanceProps {
  userRole?: UserRole;
}

export default function Finance({ userRole = 'employee' }: FinanceProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [actualCash, setActualCash] = useState(0);
  const [actualCard, setActualCard] = useState(0);
  const [actualUpi, setActualUpi] = useState(0);
  const [varianceNotes, setVarianceNotes] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser = getCurrentUser();
  const isOwner = userRole === 'owner' || userRole === 'superadmin';

  // Get daily summary
  const summary = financeStore.calculateDailySummary(selectedDate);
  const isClosed = financeStore.isDayClosed(selectedDate);
  const closure = isClosed ? financeStore.getDayClosures().find(c => c.date === selectedDate) : null;

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleClosureSubmit = () => {
    if (!isOwner) {
      alert('Only owners can close the day');
      return;
    }

    const cashVariance = actualCash - summary.expectedCash;
    const cardVariance = actualCard - summary.expectedCard;
    const upiVariance = actualUpi - summary.expectedUpi;
    const balanced = Math.abs(cashVariance) < 0.01 && Math.abs(cardVariance) < 0.01 && Math.abs(upiVariance) < 0.01;

    const closureRecord: DayClosureRecord = {
      id: `closure-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: selectedDate,
      totalSessions: summary.totalSessions,
      grossRevenue: summary.grossRevenue,
      totalDiscounts: summary.totalDiscounts,
      netRevenue: summary.netRevenue,
      expectedCash: summary.expectedCash,
      expectedCard: summary.expectedCard,
      expectedUpi: summary.expectedUpi,
      actualCash,
      actualCard,
      actualUpi,
      cashVariance,
      cardVariance,
      upiVariance,
      balanced,
      varianceNotes,
      emergencyPinUsageCount: summary.emergencyPinUsageCount,
      closedBy: currentUser?.name || 'Owner',
      closedAt: Date.now(),
      locked: true,
    };

    financeStore.saveDayClosure(closureRecord);
    setShowClosureForm(false);
    setRefreshKey(prev => prev + 1);

    // Show notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${balanced ? 'bg-green-600' : 'bg-yellow-600'} text-white px-6 py-4 rounded-lg shadow-2xl z-[100] flex items-center space-x-3`;
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-bold">${balanced ? 'Day Closed - Balanced!' : 'Day Closed - Variance Detected'}</p>
        <p class="text-sm">${selectedDate}</p>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handlePrepopulateActual = () => {
    setActualCash(summary.expectedCash);
    setActualCard(summary.expectedCard);
    setActualUpi(summary.expectedUpi);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Finance Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track daily sales, manage closures, and reconcile payments
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Day Status */}
        {isClosed ? (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <Lock className="w-5 h-5" />
            <span className="font-medium">Day Closed by {closure?.closedBy}</span>
            <span className="text-sm text-gray-600">
              {closure?.balanced ? '✓ Balanced' : '⚠ Variance Detected'}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
            <Unlock className="w-5 h-5" />
            <span className="font-medium">Day Open - {summary.totalSessions} sessions</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrencyCompact(summary.grossRevenue)}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Discounts</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                -{formatCurrencyCompact(summary.totalDiscounts)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-slate-800 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {formatCurrencyCompact(summary.netRevenue)}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-indigo-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalSessions}</p>
            </div>
            <Calendar className="w-10 h-10 text-gray-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Cash</p>
            <p className="text-xl font-bold text-green-700">
              {formatCurrencyCompact(isClosed ? closure!.actualCash : summary.expectedCash)}
            </p>
            {isClosed && closure!.cashVariance !== 0 && (
              <p className={`text-sm mt-1 ${closure!.cashVariance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {closure!.cashVariance > 0 ? '+' : ''}{formatCurrencyCompact(closure!.cashVariance)} variance
              </p>
            )}
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Card</p>
            <p className="text-xl font-bold text-indigo-700">
              {formatCurrencyCompact(isClosed ? closure!.actualCard : summary.expectedCard)}
            </p>
            {isClosed && closure!.cardVariance !== 0 && (
              <p className={`text-sm mt-1 ${closure!.cardVariance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {closure!.cardVariance > 0 ? '+' : ''}{formatCurrencyCompact(closure!.cardVariance)} variance
              </p>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">UPI</p>
            <p className="text-xl font-bold text-slate-700">
              {formatCurrencyCompact(isClosed ? closure!.actualUpi : summary.expectedUpi)}
            </p>
            {isClosed && closure!.upiVariance !== 0 && (
              <p className={`text-sm mt-1 ${closure!.upiVariance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {closure!.upiVariance > 0 ? '+' : ''}{formatCurrencyCompact(closure!.upiVariance)} variance
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Day Closure Form */}
      {!isClosed && isOwner && summary.totalSessions > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!showClosureForm ? (
            <button
              onClick={() => {
                setShowClosureForm(true);
                handlePrepopulateActual();
              }}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              Close Day - {selectedDate}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Day Closure Form</h3>
                <button
                  onClick={() => setShowClosureForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expected vs Actual */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Expected (System)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash:</span>
                      <span className="font-medium">{formatCurrencyCompact(summary.expectedCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card:</span>
                      <span className="font-medium">{formatCurrencyCompact(summary.expectedCard)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">UPI:</span>
                      <span className="font-medium">{formatCurrencyCompact(summary.expectedUpi)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Actual (Counted)</h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      value={actualCash}
                      onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
                      placeholder="Cash amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={actualCard}
                      onChange={(e) => setActualCard(parseFloat(e.target.value) || 0)}
                      placeholder="Card amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={actualUpi}
                      onChange={(e) => setActualUpi(parseFloat(e.target.value) || 0)}
                      placeholder="UPI amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Variance Display */}
              {(actualCash !== summary.expectedCash || actualCard !== summary.expectedCard || actualUpi !== summary.expectedUpi) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1 space-y-1 text-sm">
                      {actualCash !== summary.expectedCash && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cash Variance:</span>
                          <span className={`font-medium ${actualCash - summary.expectedCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {actualCash - summary.expectedCash >= 0 ? '+' : ''}{formatCurrencyCompact(actualCash - summary.expectedCash)}
                          </span>
                        </div>
                      )}
                      {actualCard !== summary.expectedCard && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Card Variance:</span>
                          <span className={`font-medium ${actualCard - summary.expectedCard >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {actualCard - summary.expectedCard >= 0 ? '+' : ''}{formatCurrencyCompact(actualCard - summary.expectedCard)}
                          </span>
                        </div>
                      )}
                      {actualUpi !== summary.expectedUpi && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">UPI Variance:</span>
                          <span className={`font-medium ${actualUpi - summary.expectedUpi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {actualUpi - summary.expectedUpi >= 0 ? '+' : ''}{formatCurrencyCompact(actualUpi - summary.expectedUpi)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variance Notes {(actualCash !== summary.expectedCash || actualCard !== summary.expectedCard || actualUpi !== summary.expectedUpi) && '*'}
                </label>
                <textarea
                  value={varianceNotes}
                  onChange={(e) => setVarianceNotes(e.target.value)}
                  placeholder="Explain any variance in amounts..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleClosureSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Confirm & Close Day
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table */}
      {summary.transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Transactions ({summary.transactions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Table</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Duration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Table</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">F&B</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Discount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.transactions.map((txn: SalesTransaction) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(txn.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{txn.tableNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{Math.floor(txn.duration / 60)}h {txn.duration % 60}m</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrencyCompact(txn.tableCharge)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrencyCompact(txn.fnbTotal)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-900">
                      {txn.discountAmount > 0 ? `-${formatCurrencyCompact(txn.discountAmount)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrencyCompact(txn.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        txn.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                        txn.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {txn.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {summary.totalSessions === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions</h3>
          <p className="text-gray-600">
            No sales recorded for {selectedDate}
          </p>
        </div>
      )}
    </div>
  );
}
