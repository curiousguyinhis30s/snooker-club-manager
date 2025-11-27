import type { SalesTransaction, DayClosureRecord, EmergencyPIN } from '../types';
import { hashPin, verifyPin } from './auth';

const STORAGE_KEYS = {
  SALES: 'snooker_sales_transactions',
  CLOSURES: 'snooker_day_closures',
  EMERGENCY_PIN: 'snooker_emergency_pin',
};

export const financeStore = {
  // Sales Transactions
  getSalesTransactions(): SalesTransaction[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('[FinanceStore] Failed to parse sales transactions:', e);
      return [];
    }
  },

  saveSalesTransaction(transaction: SalesTransaction) {
    const transactions = this.getSalesTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(transactions));
  },

  getTodaysSales(): SalesTransaction[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getSalesTransactions().filter(t => t.date === today);
  },

  getSalesByDate(date: string): SalesTransaction[] {
    return this.getSalesTransactions().filter(t => t.date === date);
  },

  // Day Closures
  getDayClosures(): DayClosureRecord[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CLOSURES);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('[FinanceStore] Failed to parse day closures:', e);
      return [];
    }
  },

  saveDayClosure(closure: DayClosureRecord) {
    const closures = this.getDayClosures();
    closures.push(closure);
    localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(closures));
  },

  isDayClosed(date: string): boolean {
    return this.getDayClosures().some(c => c.date === date);
  },

  getTodayClosure(): DayClosureRecord | null {
    const today = new Date().toISOString().split('T')[0];
    return this.getDayClosures().find(c => c.date === today) || null;
  },

  // Emergency PIN
  getEmergencyPIN(): EmergencyPIN | null {
    const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_PIN);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('[FinanceStore] Failed to parse emergency PIN:', e);
      return null;
    }
  },

  setEmergencyPIN(pin: string, expiryType: 'weekly' | 'monthly'): EmergencyPIN {
    const hashedPin = hashPin(pin);
    const now = new Date();
    let expiresAt: number;

    if (expiryType === 'weekly') {
      // Expires next Sunday at 23:59:59
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      const sunday = new Date(now);
      sunday.setDate(now.getDate() + daysUntilSunday);
      sunday.setHours(23, 59, 59, 999);
      expiresAt = sunday.getTime();
    } else {
      // Expires end of month at 23:59:59
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);
      expiresAt = lastDay.getTime();
    }

    const emergencyPIN: EmergencyPIN = {
      pin: hashedPin,
      expiryType,
      expiresAt,
      active: true,
      createdAt: Date.now(),
      usageLog: [],
    };

    localStorage.setItem(STORAGE_KEYS.EMERGENCY_PIN, JSON.stringify(emergencyPIN));
    return emergencyPIN;
  },

  verifyEmergencyPIN(pin: string): boolean {
    const stored = this.getEmergencyPIN();
    if (!stored || !stored.active) return false;

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      this.deactivateEmergencyPIN();
      return false;
    }

    return verifyPin(pin, stored.pin);
  },

  logEmergencyPINUsage(sessionId: string, employeeName: string, amount: number) {
    const stored = this.getEmergencyPIN();
    if (!stored) return;

    stored.usageLog.push({
      sessionId,
      employeeName,
      usedAt: Date.now(),
      amount,
    });

    localStorage.setItem(STORAGE_KEYS.EMERGENCY_PIN, JSON.stringify(stored));
  },

  deactivateEmergencyPIN() {
    const stored = this.getEmergencyPIN();
    if (stored) {
      stored.active = false;
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_PIN, JSON.stringify(stored));
    }
  },

  // Calculate today's expected amounts
  calculateDailySummary(date: string) {
    const sales = this.getSalesByDate(date);

    const grossRevenue = sales.reduce((sum, s) => sum + s.subtotal, 0);
    const totalDiscounts = sales.reduce((sum, s) => sum + s.discountAmount, 0);
    const netRevenue = grossRevenue - totalDiscounts;

    const expectedCash = sales
      .filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);

    const expectedCard = sales
      .filter(s => s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.total, 0);

    const expectedUpi = sales
      .filter(s => s.paymentMethod === 'upi')
      .reduce((sum, s) => sum + s.total, 0);

    const emergencyPinUsageCount = sales.filter(s => s.endedUsing === 'emergency_pin').length;

    return {
      totalSessions: sales.length,
      grossRevenue,
      totalDiscounts,
      netRevenue,
      expectedCash,
      expectedCard,
      expectedUpi,
      emergencyPinUsageCount,
      transactions: sales,
    };
  },

  // Auto-close day at midnight
  autoClosePreviousDay() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (this.isDayClosed(yesterdayStr)) {
      return null; // Already closed
    }

    const summary = this.calculateDailySummary(yesterdayStr);

    if (summary.totalSessions === 0) {
      return null; // No sessions to close
    }

    const closure: DayClosureRecord = {
      id: `closure-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: yesterdayStr,
      ...summary,
      actualCash: 0, // Unknown - requires manual verification
      actualCard: 0, // Unknown - requires manual verification
      actualUpi: 0,  // Unknown - requires manual verification
      cashVariance: -summary.expectedCash,
      cardVariance: -summary.expectedCard,
      upiVariance: -summary.expectedUpi,
      balanced: false, // Not balanced until manually verified
      varianceNotes: '⚠️ Auto-closed - REQUIRES MANUAL RECONCILIATION. Actual amounts not recorded.',
      closedBy: 'system',
      closedAt: Date.now(),
      locked: false, // Allow editing for reconciliation
    };

    this.saveDayClosure(closure);
    return closure;
  },
};
