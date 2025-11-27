export type GameType = 'snooker' | 'pool' | '8-ball' | '9-ball' | 'billiards' | 'table-tennis' | 'carrom' | 'arcade' | 'dart-board' | 'air-hockey';
export type TableSize = 'small' | 'medium' | 'large' | 'full-size';

export interface GameConfig {
  type: GameType;
  icon: string;
  label: string;
  gradient: string;
  defaultRate: number;
}

export interface Table {
  id: number;
  number: string;
  type: GameType;
  size: TableSize;
  hourlyRate: number;
  status: 'available' | 'occupied' | 'paused' | 'maintenance';
  session?: Session;
  gameConfig?: GameConfig;
  activityId?: string; // Links table to activity
}

export interface Session {
  id: string;
  tableId: number;
  customerName: string;
  customerPhone?: string;
  startTime: number;
  pausedAt?: number;
  pausedDuration: number;
  foodItems: FoodItem[];
  hourlyRate: number;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isBundle?: boolean;
  bundleItems?: string[]; // Item names included in bundle
  menuItemId?: string; // Original menu item ID for proper merging
  bundleId?: string; // Original bundle ID for proper merging
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'drinks' | 'snacks' | 'meals';
  available: boolean;
}

export interface BundleItem {
  menuItemId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  originalPrice: number;
  bundlePrice: number;
  discount: number; // percentage
  available: boolean;
  icon?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: number;
  totalVisits?: number;
  lastVisit?: number;
  totalSpent?: number;
  // Loyalty fields
  loyalty?: CustomerLoyalty;
}

export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  defaultRate: number;
  stationCount: number;
  stationType: string; // "Table", "Board", "Lane", "Court", "Machine"
  enabled: boolean;
  order: number;
}

export interface RolePermissions {
  canResumeSession: boolean;
  canApplyDiscount: boolean;
  canCloseDayAccounts: boolean;
  canManageActivities: boolean;
  canManageUsers: boolean;
  canViewFinance: boolean;
  canManageFnB: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canDeleteSessions: boolean;
}

export interface Settings {
  clubName: string;
  numberOfTables: number;
  hourlyRate: number;
  currency: string;
  menuItems: MenuItem[];
  bundles: Bundle[];
  customers?: Customer[];
  activities?: Activity[];
  clubPhone?: string;
  clubEmail?: string;
  clubAddress?: string;
  taxId?: string;
  rolePermissions?: {
    employee: RolePermissions;
    owner: RolePermissions;
    superadmin: RolePermissions;
  };
}

export type UserRole = 'superadmin' | 'owner' | 'employee';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  employeeId?: string;
  pin: string; // Hashed
  createdAt: number;
  lastLogin?: number;
  active: boolean;
  createdBy?: string; // Who created this user
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

// Finance Management Types
export interface SalesTransaction {
  id: string;
  sessionId: string;
  date: string; // YYYY-MM-DD
  tableNumber: string;
  activityName: string;

  // Time tracking
  startTime: number;
  endTime: number;
  duration: number; // minutes

  // Charges
  tableCharge: number;
  fnbItems: FoodItem[];
  fnbTotal: number;
  subtotal: number;

  // Discount (owner only)
  discountAmount: number;
  discountReason: string;
  discountApprovedBy: string;

  // Final
  total: number;

  // Payment
  paymentMethod: 'cash' | 'card' | 'upi' | 'split';
  splitPayment?: {
    cash: number;
    card: number;
  };

  // Customer info (optional)
  customerName?: string;
  customerPhone?: string;

  // Staff
  startedBy: string;
  endedBy: string;
  endedUsing: 'owner' | 'emergency_pin';

  // Audit
  createdAt: number;
  locked: boolean;
}

export interface DayClosureRecord {
  id: string;
  date: string; // YYYY-MM-DD

  // Summary
  totalSessions: number;
  grossRevenue: number;
  totalDiscounts: number;
  netRevenue: number;

  // Expected (from system)
  expectedCash: number;
  expectedCard: number;
  expectedUpi: number;

  // Actual (counted by owner)
  actualCash: number;
  actualCard: number;
  actualUpi: number;

  // Variance
  cashVariance: number;
  cardVariance: number;
  upiVariance: number;
  balanced: boolean;
  varianceNotes?: string;

  // Emergency PIN usage
  emergencyPinUsageCount: number;

  // Audit
  closedBy: string;
  closedAt: number;
  locked: boolean;
}

export interface EmergencyPIN {
  pin: string; // hashed
  expiryType: 'weekly' | 'monthly';
  expiresAt: number;
  active: boolean;
  createdAt: number;
  usageLog: Array<{
    sessionId: string;
    employeeName: string;
    usedAt: number;
    amount: number;
  }>;
}

// Reservation System
export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';

export interface Reservation {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  activityId: string;
  activityName: string;
  tableId?: number; // Optional - can be assigned later
  tableNumber?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  duration: number; // minutes
  numberOfPlayers: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: number;
  createdBy: string;
  confirmedAt?: number;
  checkedInAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
}

// Loyalty System
export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerCurrency: number; // e.g., 1 point per $10 spent
  redeemPointsValue: number; // e.g., 100 points = $5 discount
  welcomePoints: number; // Points given on signup
  birthdayMultiplier: number; // e.g., 2x points on birthday
}

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CustomerLoyalty {
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  tier: MembershipTier;
  memberSince: number;
  birthday?: string; // MM-DD
}

// Expense Tracking
export type ExpenseCategory = 'maintenance' | 'supplies' | 'food-stock' | 'utilities' | 'salaries' | 'rent' | 'other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  description: string;
  billNumber?: string;
  paymentMethod: 'cash' | 'card';
  addedBy: string; // User name
  addedByRole: UserRole;
  createdAt: number;
  locked: boolean;
}
