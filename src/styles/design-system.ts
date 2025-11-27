// Design System Configuration
// Central source of truth for all design tokens and styles

export const colors = {
  // Primary palette
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  // Table status colors
  table: {
    available: '#10b981', // green
    occupied: '#3b82f6',  // blue
    paused: '#f59e0b',    // neutral
    maintenance: '#6b7280', // gray
  },
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Courier New", Courier, monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    md: '0.9375rem',   // 15px
    base: '1rem',      // 16px
    lg: '1.1875rem',   // 19px
    xl: '1.625rem',    // 26px
    '2xl': '2rem',     // 32px
    '3xl': '1.875rem', // 30px - timer
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    normal: '1.5',
    tight: '1.2',
  },
  letterSpacing: {
    tight: '-0.015em',
    normal: '0',
    wide: '0.3px',
  }
};

// Component-specific styles
export const components = {
  card: {
    base: 'bg-white rounded-xl shadow-lg border border-gray-200',
    hover: 'hover:shadow-xl transition-shadow duration-200',
  },
  button: {
    primary: 'bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
  },
  input: {
    base: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none',
  }
};

export const tableStyles = {
  // Table card container
  container: 'relative group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300',

  // Table number badge
  badge: {
    container: 'absolute -top-3 -left-3 z-10 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg',
    title: 'text-lg font-bold',
    subtitle: 'text-xs text-gray-400',
  },

  // Table surface (felt)
  surface: {
    available: 'bg-gradient-to-br from-green-600 to-green-700',
    occupied: 'bg-gradient-to-br from-blue-600 to-blue-700',
    paused: 'bg-gradient-to-br from-neutral-500 to-neutral-600',
    maintenance: 'bg-gradient-to-br from-gray-500 to-gray-600',
  },

  // Pockets
  pocket: 'w-6 h-6 bg-black rounded-full shadow-inner',

  // Content overlay
  overlay: 'bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white',

  // Buttons
  actionButton: 'w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 flex items-center justify-center space-x-2 transition-colors text-sm font-medium',
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  components,
  tableStyles,
};
