import { ReactNode } from 'react';
import { Inbox, Search, Users, FileText, ShoppingCart, Calendar } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  iconType?: 'inbox' | 'search' | 'users' | 'files' | 'cart' | 'calendar';
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const defaultIcons = {
  inbox: Inbox,
  search: Search,
  users: Users,
  files: FileText,
  cart: ShoppingCart,
  calendar: Calendar,
};

export function EmptyState({
  icon,
  iconType = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = defaultIcons[iconType];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        {icon || <IconComponent className="w-8 h-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoResultsFound({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      iconType="search"
      title="No results found"
      description={
        searchTerm
          ? `No matches for "${searchTerm}". Try adjusting your search.`
          : 'Try adjusting your filters or search term.'
      }
    />
  );
}

export function NoCustomers({ onAddCustomer }: { onAddCustomer?: () => void }) {
  return (
    <EmptyState
      iconType="users"
      title="No customers yet"
      description="Start by adding your first customer to track visits and loyalty."
      action={
        onAddCustomer && (
          <button
            onClick={onAddCustomer}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Customer
          </button>
        )
      }
    />
  );
}

export function NoTransactions() {
  return (
    <EmptyState
      iconType="files"
      title="No transactions"
      description="Completed sessions will appear here once you process payments."
    />
  );
}

export function NoActiveSessions() {
  return (
    <EmptyState
      iconType="calendar"
      title="No active sessions"
      description="All tables are available. Start a session by clicking on a table."
    />
  );
}
