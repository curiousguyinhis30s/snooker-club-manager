import { formatCurrencyCompact, formatRate } from '../lib/currency';
import type { Session, SalesTransaction } from '../types';

interface ReceiptTemplateProps {
  // Session is now optional - can derive values from transaction
  session?: Session;
  transaction: SalesTransaction;
  tableNumber: string;
  clubName: string;
  clubAddress?: string;
  clubPhone?: string;
  receiptNumber: string;
}

export default function ReceiptTemplate({
  session,
  transaction,
  tableNumber,
  clubName,
  clubAddress,
  clubPhone,
  receiptNumber,
}: ReceiptTemplateProps) {
  // Derive customer info from session or transaction
  const customerName = session?.customerName || transaction.customerName || 'Guest';
  const customerPhone = session?.customerPhone || '';
  // Calculate hourly rate: tableCharge / (duration in hours)
  const hourlyRate = session?.hourlyRate || (transaction.duration > 0
    ? (transaction.tableCharge / (transaction.duration / 60))
    : 0);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const startDateTime = formatDateTime(transaction.startTime);
  const endDateTime = formatDateTime(transaction.endTime);

  return (
    <div id="receipt-template" className="receipt-container">
      {/* Header */}
      <div className="receipt-header">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{clubName}</h1>
          {clubAddress && <p className="text-sm text-gray-600">{clubAddress}</p>}
          {clubPhone && <p className="text-sm text-gray-600">Tel: {clubPhone}</p>}
        </div>
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-semibold">Receipt #: {receiptNumber}</p>
            <p className="text-gray-600">{endDateTime.date}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{endDateTime.time}</p>
            <p className="text-gray-600">Cashier: {transaction.endedBy}</p>
          </div>
        </div>
      </div>

      {/* Customer & Session Info */}
      <div className="receipt-section">
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Customer:</p>
            <p className="font-semibold">{customerName}</p>
            {customerPhone && (
              <p className="text-gray-500 text-xs">{customerPhone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-600">Table/Station:</p>
            <p className="font-semibold">{tableNumber}</p>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Start Time:</span>
            <span>{startDateTime.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Time:</span>
            <span>{endDateTime.time}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-600">Duration:</span>
            <span>{formatDuration(transaction.duration)}</span>
          </div>
        </div>
      </div>

      {/* Itemized Charges */}
      <div className="receipt-section">
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <h3 className="font-bold text-sm mb-2">CHARGES</h3>

        {/* Table Charges */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-700">
            {transaction.activityName} Session
            <span className="text-xs text-gray-500 block">
              {(transaction.duration / 60).toFixed(2)}h @ {formatRate(hourlyRate)}
            </span>
          </span>
          <span className="font-semibold">{formatCurrencyCompact(transaction.tableCharge)}</span>
        </div>

        {/* Food & Beverage Items */}
        {transaction.fnbItems && transaction.fnbItems.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-600 mb-1">FOOD & BEVERAGE</p>
            {transaction.fnbItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">
                  {item.quantity}x {item.name}
                  {item.isBundle && ' 🎁'}
                  {item.isBundle && item.bundleItems && (
                    <span className="text-xs text-gray-500 block ml-3">
                      {item.bundleItems.map((bi, idx) => (
                        <span key={idx} className="block">• {bi}</span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="font-semibold">{formatCurrencyCompact(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="receipt-section">
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrencyCompact(transaction.subtotal)}</span>
          </div>

          {transaction.discountAmount > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrencyCompact(transaction.discountAmount)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Reason: {transaction.discountReason}
              </div>
            </>
          )}

          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>{formatCurrencyCompact(transaction.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="receipt-section">
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <div className="text-sm">
          <p className="font-semibold mb-1">PAYMENT METHOD</p>
          {transaction.splitPayment ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">💵 Cash:</span>
                <span>{formatCurrencyCompact(transaction.splitPayment.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">💳 Card:</span>
                <span>{formatCurrencyCompact(transaction.splitPayment.card)}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-600">
                {transaction.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
              </span>
              <span className="font-semibold">{formatCurrencyCompact(transaction.total)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
        <div className="text-center text-sm">
          <p className="font-semibold mb-1">Thank You for Your Visit!</p>
          <p className="text-xs text-gray-600">Please come again</p>
          <div className="mt-3 text-xs text-gray-500">
            <p>This is a computer-generated receipt</p>
            <p>Transaction ID: {transaction.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
