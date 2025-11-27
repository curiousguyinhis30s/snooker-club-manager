import { useState, useMemo } from 'react';
import { Receipt, Search, Calendar, Filter, Eye, Printer, ChevronDown, ChevronUp, DollarSign, Clock, User } from 'lucide-react';
import { createPortal } from 'react-dom';
import { financeStore } from '../lib/financeStore';
import { formatCurrencyCompact } from '../lib/currency';
import { store } from '../lib/store';
import ReceiptTemplate from '../components/ReceiptTemplate';
import type { SalesTransaction } from '../types';

export default function BillsHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'split'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<SalesTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [printTransaction, setPrintTransaction] = useState<SalesTransaction | null>(null);

  const settings = store.getSettings();
  const allTransactions = financeStore.getSalesTransactions();

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (dateFilter === 'today') {
      filtered = filtered.filter(t => t.date === today);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(t => t.date >= weekAgo);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(t => t.date >= monthAgo);
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === paymentFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.customerName?.toLowerCase().includes(search) ||
        t.tableNumber.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [allTransactions, dateFilter, paymentFilter, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const cash = filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
    const card = filteredTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0);
    const split = filteredTransactions.filter(t => t.paymentMethod === 'split').reduce((sum, t) => sum + t.total, 0);
    return { total, cash, card, split, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handlePrint = (transaction: SalesTransaction) => {
    setPrintTransaction(transaction);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintTransaction(null), 1000);
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gray-700" />
              <h1 className="text-base font-semibold text-gray-900">Bills History</h1>
            </div>
            <span className="text-xs text-gray-500">{stats.count} bills</span>
          </div>
          {/* Mobile Stats Row */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{formatCurrencyCompact(stats.total)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Total</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600">{formatCurrencyCompact(stats.cash)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Cash</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600">{formatCurrencyCompact(stats.card)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Card</div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bills History</h1>
              <p className="text-xs text-gray-500">View and print past transactions</p>
            </div>

            {/* Stats - Inline */}
            <div className="flex items-center gap-4 text-[13px]">
              <div>
                <span className="text-gray-500">Total</span>
                <span className="ml-1.5 font-semibold text-gray-900">{formatCurrencyCompact(stats.total)}</span>
              </div>
              <div>
                <span className="text-gray-500">Cash</span>
                <span className="ml-1.5 font-medium text-gray-700">{formatCurrencyCompact(stats.cash)}</span>
              </div>
              <div>
                <span className="text-gray-500">Card</span>
                <span className="ml-1.5 font-medium text-gray-700">{formatCurrencyCompact(stats.card)}</span>
              </div>
              <div>
                <span className="text-gray-500">Split</span>
                <span className="ml-1.5 font-medium text-gray-700">{formatCurrencyCompact(stats.split)}</span>
              </div>
              <div>
                <span className="text-gray-500">Count</span>
                <span className="ml-1.5 font-medium text-gray-700">{stats.count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, table, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search transactions"
              className="input pl-9"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            aria-label="Filter by date"
            className="input w-auto"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            aria-label="Filter by payment method"
            className="input w-auto"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="split">Split</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-[13px]">No bills match the selected filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-medium text-gray-600">
                        {(transaction.customerName || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 text-[13px]">{transaction.customerName || 'Guest'}</span>
                          <span className="text-[11px] text-gray-400">{transaction.tableNumber}</span>
                          <span className={`text-[10px] px-1 py-0.5 rounded ${
                            transaction.paymentMethod === 'cash' ? 'bg-gray-100 text-gray-600' :
                            transaction.paymentMethod === 'card' ? 'bg-gray-100 text-gray-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {transaction.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>{formatDuration(transaction.duration)}</span>
                          {transaction.fnbTotal > 0 && <span>F&B: {formatCurrencyCompact(transaction.fnbTotal)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-[13px]">{formatCurrencyCompact(transaction.total)}</span>
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedTransaction(selectedTransaction?.id === transaction.id ? null : transaction)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Details"
                        >
                          {selectedTransaction?.id === transaction.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handlePrint(transaction)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedTransaction?.id === transaction.id && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                      <div className="grid grid-cols-4 gap-3 text-gray-600">
                        <div>
                          <span className="text-gray-400">ID:</span> <span className="font-mono">{transaction.id.slice(-8)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Started:</span> {transaction.startedBy}
                        </div>
                        <div>
                          <span className="text-gray-400">Ended:</span> {transaction.endedBy}
                        </div>
                        <div>
                          <span className="text-gray-400">Subtotal:</span> {formatCurrencyCompact(transaction.subtotal)}
                        </div>
                      </div>

                      {transaction.fnbItems.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {transaction.fnbItems.map((item, idx) => (
                            <span key={idx} className="text-gray-600">
                              {item.quantity}x {item.name} ({formatCurrencyCompact(item.price * item.quantity)})
                            </span>
                          ))}
                        </div>
                      )}

                      {transaction.discountAmount > 0 && (
                        <div className="mt-2 text-gray-600">
                          Discount: -{formatCurrencyCompact(transaction.discountAmount)} ({transaction.discountReason})
                        </div>
                      )}

                      {transaction.splitPayment && (
                        <div className="mt-2 text-gray-600">
                          Split: Cash {formatCurrencyCompact(transaction.splitPayment.cash)} / Card {formatCurrencyCompact(transaction.splitPayment.card)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Receipt for Printing */}
      {printTransaction && createPortal(
        <div id="receipt-print-wrapper" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <ReceiptTemplate
            transaction={printTransaction}
            tableNumber={printTransaction.tableNumber}
            clubName={settings.clubName}
            receiptNumber={printTransaction.id.slice(-8).toUpperCase()}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
