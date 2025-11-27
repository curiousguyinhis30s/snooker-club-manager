import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrencyCompact } from '../lib/currency';
import { financeStore } from '../lib/financeStore';

interface ChartDataPoint {
  date: string;
  revenue: number;
  sessions: number;
  food: number;
  customers: number;
}

interface AnalyticsChartsProps {
  data: ChartDataPoint[];
  expenses: {
    category: string;
    amount: number;
  }[];
  startDate?: string;
  endDate?: string;
}

// Elevated palette - professional with strategic accents
const CHART_COLORS = {
  primary: '#6366f1',   // indigo-500 - main highlight
  secondary: '#14b8a6', // teal-500 - secondary accent
  tertiary: '#1e293b',  // slate-800 - base
  muted: '#94a3b8',     // slate-400
  light: '#e0e7ff',     // indigo-100
};

const EXPENSE_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#1e293b', '#64748b'];

export default function AnalyticsCharts({ data, expenses, startDate, endDate }: AnalyticsChartsProps) {
  // Revenue trend - show ALL data for selected date range (not just last 7 days)
  const revenueTrendData = useMemo(() => {
    // For better readability, aggregate by week if more than 14 days
    if (data.length > 14) {
      // Group by week
      const weeklyData: Record<string, { revenue: number; food: number; count: number }> = {};
      data.forEach(d => {
        const date = new Date(d.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, food: 0, count: 0 };
        }
        weeklyData[weekKey].revenue += d.revenue;
        weeklyData[weekKey].food += d.food;
        weeklyData[weekKey].count++;
      });

      return Object.entries(weeklyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, vals]) => ({
          date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          revenue: vals.revenue,
          food: vals.food,
        }));
    }

    // For 14 days or less, show daily data
    return data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: d.revenue,
      food: d.food,
    }));
  }, [data]);

  // Payment method distribution
  const paymentData = useMemo(() => {
    const transactions = financeStore.getSalesTransactions();
    const filtered = transactions.filter(t => {
      if (!startDate || !endDate) return true;
      return t.date >= startDate && t.date <= endDate;
    });

    const cash = filtered.filter(t => t.paymentMethod === 'cash' && !t.splitPayment).length;
    const card = filtered.filter(t => t.paymentMethod === 'card' && !t.splitPayment).length;
    const split = filtered.filter(t => t.splitPayment).length;
    const total = cash + card + split;

    if (total === 0) return [
      { name: 'Cash', value: 0 },
      { name: 'Card', value: 0 },
      { name: 'Split', value: 0 },
    ];

    return [
      { name: 'Cash', value: Math.round((cash / total) * 100) },
      { name: 'Card', value: Math.round((card / total) * 100) },
      { name: 'Split', value: Math.round((split / total) * 100) },
    ];
  }, [startDate, endDate]);

  // Peak hours
  const peakHoursData = useMemo(() => {
    const transactions = financeStore.getSalesTransactions();
    const filtered = transactions.filter(t => {
      if (!startDate || !endDate) return true;
      return t.date >= startDate && t.date <= endDate;
    });

    const hourCounts = Array(15).fill(0);
    filtered.forEach(t => {
      const hour = new Date(t.startTime).getHours();
      if (hour >= 8 && hour <= 22) hourCounts[hour - 8]++;
    });

    return [
      { hour: '10AM', sessions: hourCounts[2] },
      { hour: '2PM', sessions: hourCounts[6] },
      { hour: '6PM', sessions: hourCounts[10] },
      { hour: '10PM', sessions: hourCounts[14] },
    ];
  }, [startDate, endDate]);

  // Expense data (top 4 only)
  const expenseBarData = expenses.slice(0, 4).map((e, i) => ({
    ...e,
    fill: EXPENSE_COLORS[i % EXPENSE_COLORS.length]
  }));

  // Minimal tooltips
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-2 py-1 rounded text-[11px] shadow-lg">
          <p className="font-medium">{label || payload[0].payload.date || payload[0].payload.hour}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-slate-300">
              {entry.name}: <span className="text-white font-medium">
                {typeof entry.value === 'number' && entry.value > 100
                  ? formatCurrencyCompact(entry.value)
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Revenue Trend - Compact Area Chart */}
      <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-xs">Revenue</h3>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              Total
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              F&B
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={revenueTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.15}/>
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} tickFormatter={v => formatCurrencyCompact(v)} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} strokeWidth={1.5} fill="url(#revenueGrad)" name="Revenue" />
            <Area type="monotone" dataKey="food" stroke={CHART_COLORS.muted} strokeWidth={1} fill="transparent" name="F&B" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours - Mini Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="font-medium text-gray-900 text-xs mb-2">Peak Hours</h3>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={peakHoursData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(23, 23, 23, 0.05)' }} />
            <Bar dataKey="sessions" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expenses - Horizontal Mini Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="font-medium text-gray-900 text-xs mb-2">Expenses</h3>
        {expenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={expenseBarData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 9 }} tickFormatter={v => formatCurrencyCompact(v)} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="category" stroke="#9ca3af" tick={{ fontSize: 9 }} width={50} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(23, 23, 23, 0.05)' }} />
              <Bar dataKey="amount" radius={[0, 2, 2, 0]} maxBarSize={16}>
                {expenseBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[100px] flex items-center justify-center text-gray-400 text-xs">
            No data
          </div>
        )}
      </div>

      {/* Payment Methods - Inline Stats */}
      <div className="col-span-2 lg:col-span-4 bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="font-medium text-gray-900 text-xs mb-2">Payment Methods</h3>
        <div className="flex items-center gap-4">
          {paymentData.map((item, i) => (
            <div key={i} className="flex-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: i === 0 ? CHART_COLORS.primary : i === 1 ? CHART_COLORS.secondary : CHART_COLORS.tertiary
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
