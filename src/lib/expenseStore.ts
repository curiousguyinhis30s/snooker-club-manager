import type { Expense } from '../types';

const EXPENSES_KEY = 'expenses';

class ExpenseStore {
  // Get all expenses
  getExpenses(): Expense[] {
    const expenses = localStorage.getItem(EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  }

  // Get expenses by date range
  getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
    const expenses = this.getExpenses();
    return expenses.filter(expense =>
      expense.date >= startDate && expense.date <= endDate
    );
  }

  // Get expenses by category
  getExpensesByCategory(category: string): Expense[] {
    const expenses = this.getExpenses();
    return expenses.filter(expense => expense.category === category);
  }

  // Add new expense
  addExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.push(expense);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }

  // Update expense
  updateExpense(id: string, updates: Partial<Expense>): boolean {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);

    if (index !== -1) {
      // Don't allow updating locked expenses
      if (expenses[index].locked) {
        return false;
      }

      expenses[index] = { ...expenses[index], ...updates };
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return true;
    }

    return false;
  }

  // Delete expense
  deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);

    if (index !== -1) {
      // Don't allow deleting locked expenses
      if (expenses[index].locked) {
        return false;
      }

      expenses.splice(index, 1);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return true;
    }

    return false;
  }

  // Get total expenses for a date range
  getTotalExpenses(startDate: string, endDate: string): number {
    const expenses = this.getExpensesByDateRange(startDate, endDate);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // Get expenses by payment method
  getExpensesByPaymentMethod(method: 'cash' | 'card', startDate?: string, endDate?: string): number {
    let expenses = this.getExpenses();

    if (startDate && endDate) {
      expenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);
    }

    return expenses
      .filter(e => e.paymentMethod === method)
      .reduce((total, expense) => total + expense.amount, 0);
  }

  // Get expenses summary by category
  getExpensesSummary(startDate: string, endDate: string): Record<string, number> {
    const expenses = this.getExpensesByDateRange(startDate, endDate);
    const summary: Record<string, number> = {};

    expenses.forEach(expense => {
      if (!summary[expense.category]) {
        summary[expense.category] = 0;
      }
      summary[expense.category] += expense.amount;
    });

    return summary;
  }

  // Get today's expenses
  getTodayExpenses(): Expense[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getExpensesByDateRange(today, today);
  }
}

export const expenseStore = new ExpenseStore();
