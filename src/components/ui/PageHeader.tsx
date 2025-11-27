import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center space-x-2 lg:space-x-3">
        {icon && (
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-lg lg:rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-base lg:text-xl font-bold text-gray-900 truncate">{title}</h1>
          {description && (
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
