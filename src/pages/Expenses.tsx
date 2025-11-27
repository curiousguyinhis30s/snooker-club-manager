import { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Edit, Calendar, DollarSign, Filter, Search } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import { expenseStore } from '../lib/expenseStore';
import { formatCurrencyCompact } from '../lib/currency';
import { LoadingSkeleton } from '../components/ui/LoadingSpinner';
import type { Expense, ExpenseCategory } from '../types';
import { getCurrentUser } from '../lib/auth';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'supplies', label: 'Supplies', icon: '📦' },
  { value: 'food-stock', label: 'Food Stock', icon: '🍔' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'salaries', label: 'Salaries', icon: '💰' },
  { value: 'rent', label: 'Rent', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const currentUser = getCurrentUser();
  const isOwner = currentUser?.role === 'superadmin' || currentUser?.role === 'owner';

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    setIsLoading(true);
    // Simulate brief loading to show skeleton (localStorage is synchronous but UI feedback helps)
    setTimeout(() => {
      const allExpenses = expenseStore.getExpenses();
      setExpenses(allExpenses);
      setIsLoading(false);
    }, 300);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      const success = expenseStore.deleteExpense(id);
      if (success) {
        loadExpenses();
      } else {
        alert('Cannot delete this expense (it may be locked)');
      }
    }
  };

  // Filter expenses
  const getDateRangeFilter = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (dateRange) {
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo.toISOString().split('T')[0], end: todayStr };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo.toISOString().split('T')[0], end: todayStr };
      }
      default:
        return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    // Category filter
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;

    // Search filter
    if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !expense.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter
    const dateFilter = getDateRangeFilter();
    if (dateFilter && (expense.date < dateFilter.start || expense.date > dateFilter.end)) {
      return false;
    }

    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const cashTotal = filteredExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const cardTotal = filteredExpenses.filter(e => e.paymentMethod === 'card').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Expenses</h1>
              <p className="text-xs text-gray-500">Track and manage all business expenses</p>
            </div>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="btn-danger"
              aria-label="Add new expense"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 text-[13px]">
            <div>
              <span className="text-gray-500">Total</span>
              <span className="ml-1.5 font-semibold text-gray-900">{formatCurrencyCompact(totalExpenses)}</span>
            </div>
            <div>
              <span className="text-gray-500">Cash</span>
              <span className="ml-1.5 font-medium text-gray-700">{formatCurrencyCompact(cashTotal)}</span>
            </div>
            <div>
              <span className="text-gray-500">Card</span>
              <span className="ml-1.5 font-medium text-gray-700">{formatCurrencyCompact(cardTotal)}</span>
            </div>
            <div>
              <span className="text-gray-500">Items</span>
              <span className="ml-1.5 font-medium text-gray-700">{filteredExpenses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by description or bill number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search expenses"
              className="input pl-9"
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            aria-label="Filter by date range"
            className="input w-auto"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            aria-label="Filter by category"
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <LoadingSkeleton count={5} type="list" />
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-[13px] mb-2">No expenses found</p>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="btn-primary"
            >
              Add Expense
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {filteredExpenses.map((expense) => {
              const category = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
              return (
                <div
                  key={expense.id}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-base">{category?.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 text-[13px]">{category?.label}</span>
                          <span className="text-[11px] text-gray-400">
                            {expense.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 truncate">{expense.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-[13px]">{formatCurrencyCompact(expense.amount)}</p>
                        <p className="text-[11px] text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>

                      {isOwner && !expense.locked && (
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => {
            loadExpenses();
            setShowExpenseModal(false);
          }}
        />
      )}
    </div>
  );
}
