import type { SalesTransaction, Expense } from '../types';
import { formatCurrencyCompact } from './currency';

// Convert array of objects to CSV string
const convertToCSV = (data: any[], headers: string[]): string => {
  const headerRow = headers.join(',');
  const dataRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      // Handle values with commas by wrapping in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value ?? '';
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

// Download CSV file
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export sales transactions to CSV
export const exportSalesTransactions = (transactions: SalesTransaction[]) => {
  const headers = [
    'Date',
    'Table',
    'Activity',
    'Customer',
    'Duration (min)',
    'Table Charge',
    'F&B Total',
    'Subtotal',
    'Discount',
    'Total',
    'Payment Method',
    'Cashier'
  ];

  const data = transactions.map(t => ({
    'Date': t.date,
    'Table': t.tableNumber,
    'Activity': t.activityName,
    'Customer': 'N/A', // Customer name not in transaction type
    'Duration (min)': t.duration,
    'Table Charge': t.tableCharge.toFixed(2),
    'F&B Total': t.fnbTotal.toFixed(2),
    'Subtotal': t.subtotal.toFixed(2),
    'Discount': t.discountAmount.toFixed(2),
    'Total': t.total.toFixed(2),
    'Payment Method': t.paymentMethod,
    'Cashier': t.endedBy
  }));

  const csv = convertToCSV(data, headers);
  const filename = `sales-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
};

// Export expenses to CSV
export const exportExpenses = (expenses: Expense[]) => {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount',
    'Bill Number',
    'Payment Method',
    'Added By'
  ];

  const data = expenses.map(e => ({
    'Date': e.date,
    'Category': e.category,
    'Description': e.description,
    'Amount': e.amount.toFixed(2),
    'Bill Number': e.billNumber || 'N/A',
    'Payment Method': e.paymentMethod,
    'Added By': e.addedBy
  }));

  const csv = convertToCSV(data, headers);
  const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
};

// Export customers to CSV
export const exportCustomers = (customers: any[]) => {
  const headers = [
    'Name',
    'Phone',
    'Email',
    'Total Visits',
    'Last Visit',
    'Created'
  ];

  const data = customers.map(c => ({
    'Name': c.name,
    'Phone': c.phone || 'N/A',
    'Email': c.email || 'N/A',
    'Total Visits': c.totalVisits || 0,
    'Last Visit': c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'N/A',
    'Created': new Date(c.createdAt).toLocaleDateString()
  }));

  const csv = convertToCSV(data, headers);
  const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
};

// Generate daily closing report
export const exportDailyClosingReport = (
  date: string,
  transactions: SalesTransaction[],
  expenses: Expense[]
) => {
  // Filter by date
  const dayTransactions = transactions.filter(t => t.date === date);
  const dayExpenses = expenses.filter(e => e.date === date);

  // Calculate totals
  const totalRevenue = dayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Cash vs Card breakdown
  const cashRevenue = dayTransactions
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  const cardRevenue = dayTransactions
    .filter(t => t.paymentMethod === 'card')
    .reduce((sum, t) => sum + t.total, 0);
  const splitRevenue = dayTransactions
    .filter(t => t.splitPayment)
    .reduce((sum, t) => {
      return sum + (t.splitPayment?.cash || 0) + (t.splitPayment?.card || 0);
    }, 0);

  // Generate report content
  const reportContent = `
DAILY CLOSING REPORT
Date: ${date}
Generated: ${new Date().toLocaleString()}

=====================================
REVENUE SUMMARY
=====================================
Total Sales: ${formatCurrencyCompact(totalRevenue)}
Number of Sessions: ${dayTransactions.length}
Average Transaction: ${formatCurrencyCompact(dayTransactions.length > 0 ? totalRevenue / dayTransactions.length : 0)}

Payment Method Breakdown:
  Cash: ${formatCurrencyCompact(cashRevenue)}
  Card: ${formatCurrencyCompact(cardRevenue)}
  Split: ${formatCurrencyCompact(splitRevenue)}

=====================================
EXPENSE SUMMARY
=====================================
Total Expenses: ${formatCurrencyCompact(totalExpenses)}
Number of Expenses: ${dayExpenses.length}

Expense Breakdown:
${dayExpenses.map(e => `  ${e.category}: ${formatCurrencyCompact(e.amount)} (${e.description})`).join('\n')}

=====================================
NET PROFIT
=====================================
Net Profit: ${formatCurrencyCompact(netProfit)}
Profit Margin: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%

=====================================
TOP CUSTOMERS
=====================================
${dayTransactions
  .slice(0, 5)
  .map((t, i) => `${i + 1}. Table ${t.tableNumber} - ${formatCurrencyCompact(t.total)}`)
  .join('\n')}

=====================================
END OF REPORT
=====================================
`;

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `daily-report-${date}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate monthly financial report
export const exportMonthlyReport = (
  startDate: string,
  endDate: string,
  transactions: SalesTransaction[],
  expenses: Expense[]
) => {
  const monthTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);
  const monthExpenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);

  const totalRevenue = monthTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const reportContent = `
MONTHLY FINANCIAL REPORT
Period: ${startDate} to ${endDate}
Generated: ${new Date().toLocaleString()}

=====================================
FINANCIAL SUMMARY
=====================================
Total Revenue: ${formatCurrencyCompact(totalRevenue)}
Total Expenses: ${formatCurrencyCompact(totalExpenses)}
Net Profit: ${formatCurrencyCompact(netProfit)}
Profit Margin: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%

Number of Sessions: ${monthTransactions.length}
Number of Expenses: ${monthExpenses.length}
Average Daily Revenue: ${formatCurrencyCompact(totalRevenue / 30)}

=====================================
REVENUE BY PAYMENT METHOD
=====================================
Cash: ${formatCurrencyCompact(monthTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0))}
Card: ${formatCurrencyCompact(monthTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0))}

=====================================
EXPENSE BY CATEGORY
=====================================
${Object.entries(
  monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>)
)
  .map(([cat, amt]) => `${cat}: ${formatCurrencyCompact(amt)}`)
  .join('\n')}

=====================================
END OF REPORT
=====================================
`;

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `monthly-report-${startDate}-to-${endDate}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate PDF Report (opens print dialog for Save as PDF)
export const exportPDFReport = (
  title: string,
  startDate: string,
  endDate: string,
  transactions: SalesTransaction[],
  expenses: Expense[],
  clubName: string = 'Club'
) => {
  const monthTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);
  const monthExpenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);

  const totalRevenue = monthTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Payment breakdown
  const cashRevenue = monthTransactions.filter(t => t.paymentMethod === 'cash' && !t.splitPayment).reduce((sum, t) => sum + t.total, 0);
  const cardRevenue = monthTransactions.filter(t => t.paymentMethod === 'card' && !t.splitPayment).reduce((sum, t) => sum + t.total, 0);
  const splitRevenue = monthTransactions.filter(t => t.splitPayment).reduce((sum, t) => sum + t.total, 0);

  // Expense breakdown by category
  const expensesByCategory = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Top transactions
  const topTransactions = [...monthTransactions]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${clubName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #1f2937;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1e293b;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 { font-size: 24px; font-weight: 700; color: #1e293b; }
        .header p { color: #64748b; margin-top: 4px; }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }
        .summary-card.profit { background: ${netProfit >= 0 ? '#f0fdf4' : '#fef2f2'}; border-color: ${netProfit >= 0 ? '#86efac' : '#fecaca'}; }
        .summary-card label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .summary-card .value { font-size: 22px; font-weight: 700; color: #1e293b; margin-top: 4px; }
        .summary-card.profit .value { color: ${netProfit >= 0 ? '#15803d' : '#dc2626'}; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #475569; }
        tr:hover { background: #f8fafc; }
        .text-right { text-align: right; }
        .amount { font-family: 'SF Mono', 'Monaco', monospace; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 10px; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${clubName}</h1>
        <p>${title}</p>
        <p>Period: ${startDate} to ${endDate}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <label>Total Revenue</label>
          <div class="value">${formatCurrencyCompact(totalRevenue)}</div>
        </div>
        <div class="summary-card">
          <label>Total Expenses</label>
          <div class="value">${formatCurrencyCompact(totalExpenses)}</div>
        </div>
        <div class="summary-card profit">
          <label>Net Profit</label>
          <div class="value">${formatCurrencyCompact(netProfit)}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <label>Sessions</label>
          <div class="value">${monthTransactions.length}</div>
        </div>
        <div class="summary-card">
          <label>Profit Margin</label>
          <div class="value">${profitMargin}%</div>
        </div>
        <div class="summary-card">
          <label>Avg Per Session</label>
          <div class="value">${formatCurrencyCompact(monthTransactions.length > 0 ? totalRevenue / monthTransactions.length : 0)}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Payment Methods</h3>
        <table>
          <tr><th>Method</th><th class="text-right">Amount</th><th class="text-right">%</th></tr>
          <tr><td>Cash</td><td class="text-right amount">${formatCurrencyCompact(cashRevenue)}</td><td class="text-right">${totalRevenue > 0 ? ((cashRevenue / totalRevenue) * 100).toFixed(1) : 0}%</td></tr>
          <tr><td>Card</td><td class="text-right amount">${formatCurrencyCompact(cardRevenue)}</td><td class="text-right">${totalRevenue > 0 ? ((cardRevenue / totalRevenue) * 100).toFixed(1) : 0}%</td></tr>
          <tr><td>Split</td><td class="text-right amount">${formatCurrencyCompact(splitRevenue)}</td><td class="text-right">${totalRevenue > 0 ? ((splitRevenue / totalRevenue) * 100).toFixed(1) : 0}%</td></tr>
        </table>
      </div>

      <div class="section">
        <h3 class="section-title">Expenses by Category</h3>
        <table>
          <tr><th>Category</th><th class="text-right">Amount</th><th class="text-right">%</th></tr>
          ${Object.entries(expensesByCategory).length > 0
            ? Object.entries(expensesByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `<tr><td>${cat}</td><td class="text-right amount">${formatCurrencyCompact(amt)}</td><td class="text-right">${totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0}%</td></tr>`)
                .join('')
            : '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">No expenses recorded</td></tr>'
          }
        </table>
      </div>

      <div class="section">
        <h3 class="section-title">Top 10 Transactions</h3>
        <table>
          <tr><th>Date</th><th>Table</th><th>Customer</th><th>Duration</th><th class="text-right">Total</th></tr>
          ${topTransactions.map(t => `
            <tr>
              <td>${t.date}</td>
              <td>${t.tableNumber}</td>
              <td>${t.customerName || 'Walk-in'}</td>
              <td>${Math.floor(t.duration / 60)}h ${t.duration % 60}m</td>
              <td class="text-right amount">${formatCurrencyCompact(t.total)}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>This is a computer-generated report</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog in new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
