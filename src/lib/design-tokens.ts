/**
 * Design Tokens - Single Source of Truth for UI Design
 * All spacing, colors, typography, shadows defined here
 */

export const tokens = {
  // Spacing Scale (8px base)
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  // Typography
  typography: {
    display: 'text-3xl font-bold',
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-semibold',
    body: 'text-sm',
    caption: 'text-xs text-gray-600',
    mono: 'font-mono',
  },

  // Colors (Semantic) - Warm Amber/Brown Accent System
  colors: {
    primary: 'bg-neutral-700 hover:bg-neutral-800 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    success: 'bg-neutral-700 hover:bg-neutral-800 text-white',
    warning: 'bg-neutral-500 hover:bg-neutral-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    muted: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  },

  // Buttons - Warm Amber/Brown Accent System
  button: {
    base: 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    },
    variants: {
      primary: 'bg-neutral-700 hover:bg-neutral-800 text-white focus:ring-neutral-600 shadow-lg shadow-neutral-700/20',
      secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 focus:ring-gray-300',
      success: 'bg-neutral-700 hover:bg-neutral-800 text-white focus:ring-neutral-600 shadow-lg shadow-neutral-700/20',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
      outline: 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700',
      ghost: 'hover:bg-gray-100 text-gray-700',
    },
  },

  // Cards
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md transition-shadow',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },

  // Inputs - Amber Focus
  input: {
    base: 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-700/20 focus:border-neutral-700 transition-colors',
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },

  // Border Radius
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },

  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },

  // Sidebar
  sidebar: {
    expanded: '256px',  // w-64
    collapsed: '64px',  // w-16
  },
} as const;

// Helper function to combine classes
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
