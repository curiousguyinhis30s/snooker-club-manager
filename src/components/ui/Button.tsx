import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm',  // Smaller on mobile
  lg: 'px-4 py-2 text-sm lg:px-5 lg:py-2.5',
};

const variantClasses = {
  primary: 'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-600 shadow-sm',
  secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 focus:ring-gray-300',
  success: 'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-600 shadow-sm',
  danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
  outline: 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg lg:rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
