import type { Customer, CustomerLoyalty, MembershipTier, LoyaltyConfig } from '../types';
import { store } from './store';

const LOYALTY_CONFIG_KEY = 'snooker_loyalty_config';

// Default loyalty configuration
const defaultLoyaltyConfig: LoyaltyConfig = {
  enabled: true,
  pointsPerCurrency: 10, // 1 point per $10 spent
  redeemPointsValue: 5, // 100 points = $5 discount
  welcomePoints: 50, // Points given on signup
  birthdayMultiplier: 2, // 2x points on birthday
};

// Get loyalty configuration
export const getLoyaltyConfig = (): LoyaltyConfig => {
  try {
    const data = localStorage.getItem(LOYALTY_CONFIG_KEY);
    return data ? { ...defaultLoyaltyConfig, ...JSON.parse(data) } : defaultLoyaltyConfig;
  } catch {
    return defaultLoyaltyConfig;
  }
};

// Save loyalty configuration
export const saveLoyaltyConfig = (config: LoyaltyConfig): void => {
  localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(config));
};

// Calculate tier based on total points earned
export const calculateTier = (totalPointsEarned: number): MembershipTier => {
  if (totalPointsEarned >= 10000) return 'platinum';
  if (totalPointsEarned >= 5000) return 'gold';
  if (totalPointsEarned >= 1000) return 'silver';
  return 'bronze';
};

// Get tier benefits description
export const getTierBenefits = (tier: MembershipTier): { discount: number; description: string } => {
  switch (tier) {
    case 'platinum':
      return { discount: 15, description: '15% off all sessions, priority booking' };
    case 'gold':
      return { discount: 10, description: '10% off all sessions, free birthday game' };
    case 'silver':
      return { discount: 5, description: '5% off all sessions' };
    case 'bronze':
    default:
      return { discount: 0, description: 'Earn points on every visit' };
  }
};

// Initialize loyalty for a new customer
export const initializeLoyalty = (customerId: string): CustomerLoyalty | null => {
  const config = getLoyaltyConfig();
  if (!config.enabled) return null;

  return {
    points: config.welcomePoints,
    totalPointsEarned: config.welcomePoints,
    totalPointsRedeemed: 0,
    tier: 'bronze',
    memberSince: Date.now(),
  };
};

// Calculate points from amount spent
export const calculatePointsFromSpend = (amount: number, customerId?: string): number => {
  const config = getLoyaltyConfig();
  if (!config.enabled) return 0;

  let basePoints = Math.floor(amount / config.pointsPerCurrency);

  // Check if it's customer's birthday
  if (customerId) {
    const settings = store.getSettings();
    const customer = settings.customers?.find(c => c.id === customerId);
    if (customer?.loyalty?.birthday) {
      const today = new Date();
      const [month, day] = customer.loyalty.birthday.split('-').map(Number);
      if (today.getMonth() + 1 === month && today.getDate() === day) {
        basePoints *= config.birthdayMultiplier;
      }
    }
  }

  return basePoints;
};

// Add points to customer
export const addPoints = (customerId: string, points: number): Customer | null => {
  const settings = store.getSettings();
  const customers = settings.customers || [];
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) return null;

  const customer = customers[customerIndex];
  const loyalty = customer.loyalty || initializeLoyalty(customerId);

  if (!loyalty) return customer;

  loyalty.points += points;
  loyalty.totalPointsEarned += points;
  loyalty.tier = calculateTier(loyalty.totalPointsEarned);

  customers[customerIndex] = { ...customer, loyalty };
  store.saveSettings({ ...settings, customers });

  return customers[customerIndex];
};

// Redeem points for discount
export const redeemPoints = (customerId: string, pointsToRedeem: number): { success: boolean; discountAmount: number; customer?: Customer; error?: string } => {
  const config = getLoyaltyConfig();
  const settings = store.getSettings();
  const customers = settings.customers || [];
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    return { success: false, discountAmount: 0, error: 'Customer not found' };
  }

  const customer = customers[customerIndex];
  if (!customer.loyalty) {
    return { success: false, discountAmount: 0, error: 'Customer has no loyalty account' };
  }

  if (customer.loyalty.points < pointsToRedeem) {
    return { success: false, discountAmount: 0, error: 'Insufficient points' };
  }

  // Calculate discount: 100 points = redeemPointsValue discount
  const discountAmount = (pointsToRedeem / 100) * config.redeemPointsValue;

  customer.loyalty.points -= pointsToRedeem;
  customer.loyalty.totalPointsRedeemed += pointsToRedeem;

  customers[customerIndex] = customer;
  store.saveSettings({ ...settings, customers });

  return { success: true, discountAmount, customer };
};

// Get customer loyalty info
export const getCustomerLoyalty = (customerId: string): CustomerLoyalty | null => {
  const settings = store.getSettings();
  const customer = settings.customers?.find(c => c.id === customerId);
  return customer?.loyalty || null;
};

// Set customer birthday
export const setCustomerBirthday = (customerId: string, birthday: string): Customer | null => {
  const settings = store.getSettings();
  const customers = settings.customers || [];
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) return null;

  const customer = customers[customerIndex];
  const loyalty = customer.loyalty || initializeLoyalty(customerId);

  if (!loyalty) return customer;

  loyalty.birthday = birthday;
  customers[customerIndex] = { ...customer, loyalty };
  store.saveSettings({ ...settings, customers });

  return customers[customerIndex];
};

// Get points value in currency
export const getPointsValue = (points: number): number => {
  const config = getLoyaltyConfig();
  return (points / 100) * config.redeemPointsValue;
};

// Update customer total spent and add points after a transaction
export const processTransaction = (customerId: string, transactionAmount: number): { pointsEarned: number; newTotal: number; customer?: Customer } => {
  const pointsEarned = calculatePointsFromSpend(transactionAmount, customerId);

  const settings = store.getSettings();
  const customers = settings.customers || [];
  const customerIndex = customers.findIndex(c => c.id === customerId);

  if (customerIndex === -1) {
    return { pointsEarned: 0, newTotal: 0 };
  }

  const customer = customers[customerIndex];

  // Update total spent
  customer.totalSpent = (customer.totalSpent || 0) + transactionAmount;
  customer.totalVisits = (customer.totalVisits || 0) + 1;
  customer.lastVisit = Date.now();

  // Add loyalty points if enabled
  if (pointsEarned > 0) {
    const loyalty = customer.loyalty || initializeLoyalty(customerId);
    if (loyalty) {
      loyalty.points += pointsEarned;
      loyalty.totalPointsEarned += pointsEarned;
      loyalty.tier = calculateTier(loyalty.totalPointsEarned);
      customer.loyalty = loyalty;
    }
  }

  customers[customerIndex] = customer;
  store.saveSettings({ ...settings, customers });

  return {
    pointsEarned,
    newTotal: customer.loyalty?.points || 0,
    customer
  };
};

// Export store object
export const loyaltyStore = {
  getConfig: getLoyaltyConfig,
  saveConfig: saveLoyaltyConfig,
  initializeLoyalty,
  calculatePointsFromSpend,
  addPoints,
  redeemPoints,
  getCustomerLoyalty,
  setCustomerBirthday,
  getPointsValue,
  processTransaction,
  calculateTier,
  getTierBenefits,
};
