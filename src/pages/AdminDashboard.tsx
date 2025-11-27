import { useState, useRef, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock, Activity, Download, Calendar, Filter, Users, Package, Upload, Database, Receipt, FileDown, FileText, ChevronDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Table } from '../types';
import { formatCurrencyCompact } from '../lib/currency';
import { expenseStore } from '../lib/expenseStore';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { exportSalesTransactions, exportExpenses, exportDailyClosingReport, exportMonthlyReport, exportPDFReport } from '../lib/csvExport';
import { store } from '../lib/store';
import { financeStore } from '../lib/financeStore';
import { EmptyState } from '../components/ui/EmptyState';

interface AdminDashboardProps {
  tables: Table[];
  currency: string;
}

// Generate analytics data from REAL transactions
const generateAnalyticsData = () => {
  const transactions = financeStore.getSalesTransactions();
  const dataByDate: Record<string, { revenue: number; sessions: number; food: number; customers: Set<string> }> = {};

  // Group transactions by date
  transactions.forEach(transaction => {
    const date = transaction.date; // Already in YYYY-MM-DD format

    if (!dataByDate[date]) {
      dataByDate[date] = { revenue: 0, sessions: 0, food: 0, customers: new Set() };
    }

    dataByDate[date].revenue += transaction.total;
    dataByDate[date].sessions += 1;
    dataByDate[date].food += transaction.fnbTotal;
    if (transaction.customerName) {
      dataByDate[date].customers.add(transaction.customerName);
    }
  });

  // Convert to array format
  return Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      sessions: data.sessions,
      food: Math.round(data.food),
      customers: data.customers.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const realData = generateAnalyticsData();

// Calculate top activities from REAL transactions
const calculateTopActivities = () => {
  const transactions = financeStore.getSalesTransactions();
  const activityStats: Record<string, { revenue: number; sessions: number }> = {};

  transactions.forEach(transaction => {
    const activity = transaction.activityName;
    if (!activityStats[activity]) {
      activityStats[activity] = { revenue: 0, sessions: 0 };
    }
    activityStats[activity].revenue += transaction.total;
    activityStats[activity].sessions += 1;
  });

  const totalRevenue = Object.values(activityStats).reduce((sum, a) => sum + a.revenue, 0);

  return Object.entries(activityStats)
    .map(([name, stats]) => ({
      name,
      revenue: Math.round(stats.revenue),
      sessions: stats.sessions,
      percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

const topActivities = calculateTopActivities();

// Calculate top customers from REAL transactions
const calculateTopCustomers = () => {
  const transactions = financeStore.getSalesTransactions();
  const customerStats: Record<string, { visits: number; spent: number }> = {};

  transactions.forEach(transaction => {
    const customer = transaction.customerName || 'Walk-in';
    if (!customerStats[customer]) {
      customerStats[customer] = { visits: 0, spent: 0 };
    }
    customerStats[customer].visits += 1;
    customerStats[customer].spent += transaction.total;
  });

  return Object.entries(customerStats)
    .map(([name, stats]) => ({
      name,
      visits: stats.visits,
      spent: Math.round(stats.spent),
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
};

const topCustomers = calculateTopCustomers();

export default function AdminDashboard({ tables, currency }: AdminDashboardProps) {
  // Date range state - 'preset' or 'custom'
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [dateRange, setDateRange] = useState('7'); // Last 7 days for preset mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    paused: tables.filter(t => t.status === 'paused').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
    currentRevenue: tables
      .filter(t => t.session)
      .reduce((sum, t) => {
        const duration = Date.now() - t.session!.startTime - t.session!.pausedDuration;
        const hours = duration / (1000 * 60 * 60);
        const tableCharge = hours * t.hourlyRate;
        const foodCharge = t.session!.foodItems.reduce((s, item) => s + (item.price * item.quantity), 0);
        return sum + tableCharge + foodCharge;
      }, 0),
    activeSessions: tables.filter(t => t.session).length,
  };

  // Filter data based on date range (preset or custom)
  let filteredData = realData;

  if (rangeMode === 'preset') {
    // Use preset range (last N days)
    filteredData = realData.slice(-parseInt(dateRange));
  } else {
    // Use custom date range
    if (startDate && endDate) {
      filteredData = realData.filter(d => d.date >= startDate && d.date <= endDate);
    }
  }

  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSessions = filteredData.reduce((sum, d) => sum + d.sessions, 0);
  const totalFood = filteredData.reduce((sum, d) => sum + d.food, 0);
  const totalCustomers = filteredData.reduce((sum, d) => sum + d.customers, 0);
  const avgRevenue = filteredData.length > 0 ? Math.floor(totalRevenue / filteredData.length) : 0;

  // Get expenses for the selected date range
  const startDateStr = rangeMode === 'custom' && startDate ? startDate : new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDateStr = rangeMode === 'custom' && endDate ? endDate : new Date().toISOString().split('T')[0];
  const totalExpenses = expenseStore.getTotalExpenses(startDateStr, endDateStr);
  const netProfit = totalRevenue - totalExpenses;

  // Calculate expenses by category for charts
  const expenses = expenseStore.getExpensesByDateRange(startDateStr, endDateStr);
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(e => e.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  const activeTables = tables.filter(t => t.session);

  // Export analytics report as JSON
  const exportReport = () => {
    const dateRangeText = rangeMode === 'preset'
      ? `Last ${dateRange} days`
      : `${startDate} to ${endDate}`;

    const report = {
      timestamp: new Date().toISOString(),
      dateRange: dateRangeText,
      summary: {
        totalRevenue,
        totalSessions,
        totalFood,
        totalCustomers,
        avgRevenue,
      },
      topActivities,
      topCustomers,
      dailyData: filteredData,
      currentStats: stats,
      activeSessions: activeTables.map(t => ({
        table: t.number,
        type: t.type,
        customer: t.session!.customerName,
        startTime: new Date(t.session!.startTime).toISOString(),
        duration: Date.now() - t.session!.startTime - t.session!.pausedDuration,
        amount: (() => {
          const duration = Date.now() - t.session!.startTime - t.session!.pausedDuration;
          const hours = duration / (1000 * 60 * 60);
          const tableCharge = hours * t.hourlyRate;
          const foodCharge = t.session!.foodItems.reduce((s, item) => s + (item.price * item.quantity), 0);
          return tableCharge + foodCharge;
        })(),
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export ALL localStorage data for backup
  const exportLocalStorage = () => {
    const allData: Record<string, any> = {};

    // Export all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          allData[key] = value ? JSON.parse(value) : value;
        } catch {
          // If not JSON, store as string
          allData[key] = localStorage.getItem(key);
        }
      }
    }

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: allData,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snooker-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`✅ Backup created successfully!\n\nBackup includes:\n- ${Object.keys(allData).length} data items\n- All tables, sessions, and settings\n- User accounts and history`);
  };

  // Import localStorage data from backup file
  const importLocalStorage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.data || !backup.version) {
          alert('❌ Invalid backup file format');
          return;
        }

        const confirmRestore = window.confirm(
          `⚠️ RESTORE FROM BACKUP\n\n` +
          `This will REPLACE all current data with backup from:\n${new Date(backup.timestamp).toLocaleString()}\n\n` +
          `Backup contains ${Object.keys(backup.data).length} data items.\n\n` +
          `Current data will be LOST!\n\n` +
          `Do you want to continue?`
        );

        if (!confirmRestore) {
          return;
        }

        // Clear current localStorage
        localStorage.clear();

        // Restore all data
        for (const [key, value] of Object.entries(backup.data)) {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
        }

        alert(
          `✅ Data restored successfully!\n\n` +
          `Restored ${Object.keys(backup.data).length} items from backup.\n\n` +
          `Page will reload to apply changes...`
        );

        // Reload page to reflect changes
        window.location.reload();
      } catch (error) {
        alert(`❌ Error reading backup file:\n${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick date range presets
  const setPresetRange = (days: string) => {
    setRangeMode('preset');
    setDateRange(days);
  };

  const setCustomRange = () => {
    setRangeMode('custom');

    // Default to last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // Export handlers
  const handleExportSales = () => {
    const transactions = financeStore.getSalesTransactions();
    const filtered = transactions.filter(t => t.date >= startDateStr && t.date <= endDateStr);
    exportSalesTransactions(filtered);
  };

  const handleExportExpenses = () => {
    exportExpenses(expenses);
  };

  const handleDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const transactions = financeStore.getSalesTransactions();
    exportDailyClosingReport(today, transactions, expenses);
  };

  const handleMonthlyReport = () => {
    const transactions = financeStore.getSalesTransactions();
    const filtered = transactions.filter(t => t.date >= startDateStr && t.date <= endDateStr);
    exportMonthlyReport(startDateStr, endDateStr, filtered, expenses);
  };

  const handlePDFReport = () => {
    const transactions = financeStore.getSalesTransactions();
    const settings = store.getSettings();
    const dateRangeText = rangeMode === 'preset'
      ? `Last ${dateRange} Days Report`
      : 'Financial Report';
    exportPDFReport(dateRangeText, startDateStr, endDateStr, transactions, expenses, settings.clubName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-4 w-full max-w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">Revenue and performance insights</p>
            </div>

            {/* Filters & Actions - Compact */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Range */}
              <div className="flex items-center">
                <button
                  onClick={() => setPresetRange('7')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-l-md border transition-all duration-150 ${
                    rangeMode === 'preset' && dateRange === '7'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setPresetRange('30')}
                  className={`px-2.5 py-1 text-[11px] font-medium border-t border-b transition-all duration-150 ${
                    rangeMode === 'preset' && dateRange === '30'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={setCustomRange}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-r-md border transition-all duration-150 ${
                    rangeMode === 'custom'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Date Range */}
              {rangeMode === 'custom' && (
                <div className="flex items-center gap-1 text-xs">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input py-1 px-2 text-xs" />
                  <span className="text-gray-400">-</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input py-1 px-2 text-xs" />
                </div>
              )}

              {/* Export Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value === 'sales') handleExportSales();
                  else if (e.target.value === 'expenses') handleExportExpenses();
                  else if (e.target.value === 'daily') handleDailyReport();
                  else if (e.target.value === 'monthly') handleMonthlyReport();
                  else if (e.target.value === 'pdf') handlePDFReport();
                  e.target.value = '';
                }}
                className="input py-1.5 text-xs w-auto"
                defaultValue=""
              >
                <option value="" disabled>Export...</option>
                <option value="sales">Sales CSV</option>
                <option value="expenses">Expenses CSV</option>
                <option value="daily">Daily Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="pdf">📄 PDF Report</option>
              </select>

              {/* Backup/Restore */}
              <button onClick={exportLocalStorage} className="btn-secondary text-xs py-1.5 px-2.5" title="Backup">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={importLocalStorage} className="btn-secondary text-xs py-1.5 px-2.5" title="Restore">
                <Upload className="w-3.5 h-3.5" />
              </button>

              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </div>
          </div>
        </div>

        {/* Summary Stats - Compact inline */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-0.5">
              <DollarSign className="w-3 h-3" />
              Revenue
            </div>
            <div className="text-sm font-bold text-gray-900">{formatCurrencyCompact(totalRevenue)}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-0.5">
              <TrendingDown className="w-3 h-3" />
              Expenses
            </div>
            <div className="text-sm font-bold text-gray-900">{formatCurrencyCompact(totalExpenses)}</div>
          </div>

          <div className={`rounded-lg border p-2.5 ${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`flex items-center gap-1 text-[10px] font-medium mb-0.5 ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
            </div>
            <div className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {netProfit < 0 ? '-' : ''}{formatCurrencyCompact(Math.abs(netProfit))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-0.5">
              <Activity className="w-3 h-3" />
              Sessions
            </div>
            <div className="text-sm font-bold text-gray-900">{totalSessions}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-0.5">
              <Package className="w-3 h-3" />
              F&B
            </div>
            <div className="text-sm font-bold text-gray-900">{formatCurrencyCompact(totalFood)}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-0.5">
              <Users className="w-3 h-3" />
              Tables
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900">{stats.occupied}</span>
              <span className="text-gray-400 text-xs">/ {tables.length}</span>
            </div>
          </div>
        </div>

        {/* Visual Analytics Charts */}
        <AnalyticsCharts
          data={filteredData}
          expenses={expensesByCategory}
          startDate={startDateStr}
          endDate={endDateStr}
        />

        {/* Top Activities & Customers - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Activities */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Top Activities</h3>
            {topActivities.length > 0 ? (
              <div className="space-y-1.5">
                {topActivities.slice(0, 4).map((activity, index) => (
                  <div key={activity.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-medium ${
                        index === 0 ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{index + 1}</span>
                      <span className="font-medium text-gray-900">{activity.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrencyCompact(activity.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">No data yet</p>
            )}
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Top Customers</h3>
            {topCustomers.length > 0 ? (
              <div className="space-y-1.5">
                {topCustomers.slice(0, 4).map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-medium ${
                        index === 0 ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{index + 1}</span>
                      <span className="font-medium text-gray-900">{customer.name}</span>
                      <span className="text-gray-400">{customer.visits}x</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrencyCompact(customer.spent)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">No data yet</p>
            )}
          </div>
        </div>

        {/* Active Sessions - Compact */}
        {activeTables.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900">Active Sessions</h3>
              <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[10px] font-medium rounded">
                {activeTables.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {activeTables.map(table => {
                const duration = Date.now() - table.session!.startTime - table.session!.pausedDuration;
                const hours = duration / (1000 * 60 * 60);
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                const tableCharge = hours * table.hourlyRate;
                const foodCharge = table.session!.foodItems.reduce((s, item) => s + (item.price * item.quantity), 0);
                const total = tableCharge + foodCharge;
                const isPaused = table.status === 'paused';

                return (
                  <div key={table.id} className="px-3 py-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-gray-400' : 'bg-slate-900 animate-pulse'}`} />
                        <span className="font-semibold text-gray-900">{table.number}</span>
                      </div>
                      <span className="text-gray-600">{table.session!.customerName}</span>
                      {isPaused && <span className="px-1 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">Paused</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 tabular-nums">{Math.floor(hours)}h {minutes}m</span>
                      <span className="font-semibold text-gray-900 tabular-nums">{formatCurrencyCompact(total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Running total</span>
                <span className="font-semibold text-gray-900">{formatCurrencyCompact(stats.currentRevenue)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
