// Demo data initialization for the demo version
// This creates sample data so visitors can explore the full app

const DEMO_INITIALIZED_KEY = 'demo_initialized';

export function initializeDemoData() {
  // Only initialize once per browser
  if (localStorage.getItem(DEMO_INITIALIZED_KEY)) {
    return;
  }

  // Sample tables with mixed states
  const demoTables = [
    { id: 1, number: 'Snooker 1', activityId: 'snooker', status: 'available', hourlyRate: 500, session: null },
    { id: 2, number: 'Snooker 2', activityId: 'snooker', status: 'available', hourlyRate: 500, session: null },
    { id: 3, number: 'Pool 1', activityId: 'pool', status: 'available', hourlyRate: 300, session: null },
    { id: 4, number: 'Pool 2', activityId: 'pool', status: 'available', hourlyRate: 300, session: null },
    { id: 5, number: 'Pool 3', activityId: 'pool', status: 'available', hourlyRate: 300, session: null },
  ];

  // Sample menu items
  const demoMenuItems = [
    { id: 'item-1', name: 'Chai', price: 50, category: 'drinks', available: true },
    { id: 'item-2', name: 'Coffee', price: 80, category: 'drinks', available: true },
    { id: 'item-3', name: 'Cold Drink', price: 100, category: 'drinks', available: true },
    { id: 'item-4', name: 'Water', price: 30, category: 'drinks', available: true },
    { id: 'item-5', name: 'Samosa', price: 40, category: 'snacks', available: true },
    { id: 'item-6', name: 'Pakora', price: 60, category: 'snacks', available: true },
    { id: 'item-7', name: 'Chips', price: 50, category: 'snacks', available: true },
    { id: 'item-8', name: 'Biryani', price: 350, category: 'meals', available: true },
    { id: 'item-9', name: 'Burger', price: 250, category: 'meals', available: true },
    { id: 'item-10', name: 'Sandwich', price: 150, category: 'meals', available: true },
  ];

  // Sample bundles
  const demoBundles = [
    {
      id: 'bundle-1',
      name: 'Game Night Special',
      description: '2 Cold Drinks + Chips + Samosa',
      items: [
        { menuItemId: 'item-3', quantity: 2 },
        { menuItemId: 'item-7', quantity: 1 },
        { menuItemId: 'item-5', quantity: 2 },
      ],
      originalPrice: 330,
      bundlePrice: 280,
      discount: 15,
      available: true,
      icon: '🎱',
    },
    {
      id: 'bundle-2',
      name: 'Chai Break',
      description: '2 Chai + Samosa',
      items: [
        { menuItemId: 'item-1', quantity: 2 },
        { menuItemId: 'item-5', quantity: 2 },
      ],
      originalPrice: 180,
      bundlePrice: 150,
      discount: 17,
      available: true,
      icon: '☕',
    },
  ];

  // Sample customers
  const demoCustomers = [
    {
      id: 'cust-1',
      name: 'Ahmed Khan',
      phone: '03001234567',
      email: 'ahmed.khan@email.com',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      totalVisits: 15,
      totalSpent: 7500,
      lastVisit: Date.now() - 2 * 24 * 60 * 60 * 1000,
      loyaltyPoints: 750,
      membershipTier: 'gold',
    },
    {
      id: 'cust-2',
      name: 'Usman Ali',
      phone: '03007654321',
      email: 'usman.ali@email.com',
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      totalVisits: 23,
      totalSpent: 12000,
      lastVisit: Date.now() - 1 * 24 * 60 * 60 * 1000,
      loyaltyPoints: 1200,
      membershipTier: 'platinum',
    },
    {
      id: 'cust-3',
      name: 'Bilal Hussain',
      phone: '03009876543',
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      totalVisits: 8,
      totalSpent: 3200,
      lastVisit: Date.now() - 5 * 24 * 60 * 60 * 1000,
      loyaltyPoints: 320,
      membershipTier: 'silver',
    },
    {
      id: 'cust-4',
      name: 'Faisal Malik',
      phone: '03005551234',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      totalVisits: 4,
      totalSpent: 1800,
      lastVisit: Date.now() - 3 * 24 * 60 * 60 * 1000,
      loyaltyPoints: 180,
      membershipTier: 'bronze',
    },
  ];

  // Sample owners
  const demoOwners = [
    {
      id: 'owner-1',
      name: 'Malik Sahib',
      username: 'malik',
      pin: '123456',
      role: 'owner',
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    },
  ];

  // Sample employees
  const demoEmployees = [
    {
      id: 'emp-1',
      name: 'Asad',
      username: 'asad',
      pin: '111111',
      role: 'employee',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'emp-2',
      name: 'Kamran',
      username: 'kamran',
      pin: '222222',
      role: 'employee',
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
  ];

  // Sample transactions (past bills)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const demoTransactions = [
    {
      id: 'txn-1',
      date: today,
      tableNumber: 'Snooker 1',
      activityId: 'snooker',
      customerName: 'Ahmed Khan',
      customerPhone: '03001234567',
      duration: 120,
      tableCharges: 1000,
      fnbItems: [
        { id: 'item-1', name: 'Chai', price: 50, quantity: 2 },
        { id: 'item-5', name: 'Samosa', price: 40, quantity: 2 },
      ],
      fnbTotal: 180,
      subtotal: 1180,
      discountAmount: 0,
      discountReason: '',
      total: 1180,
      paymentMethod: 'cash',
      startedBy: 'Asad',
      endedBy: 'Asad',
      createdAt: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      id: 'txn-2',
      date: today,
      tableNumber: 'Pool 1',
      activityId: 'pool',
      customerName: 'Usman Ali',
      customerPhone: '03007654321',
      duration: 90,
      tableCharges: 450,
      fnbItems: [
        { id: 'item-3', name: 'Cold Drink', price: 100, quantity: 2 },
      ],
      fnbTotal: 200,
      subtotal: 650,
      discountAmount: 50,
      discountReason: 'Regular customer',
      total: 600,
      paymentMethod: 'card',
      startedBy: 'Kamran',
      endedBy: 'Kamran',
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
    },
    {
      id: 'txn-3',
      date: yesterday,
      tableNumber: 'Snooker 2',
      activityId: 'snooker',
      customerName: 'Bilal Hussain',
      customerPhone: '03009876543',
      duration: 180,
      tableCharges: 1500,
      fnbItems: [
        { id: 'item-8', name: 'Biryani', price: 350, quantity: 1 },
        { id: 'item-1', name: 'Chai', price: 50, quantity: 2 },
      ],
      fnbTotal: 450,
      subtotal: 1950,
      discountAmount: 0,
      discountReason: '',
      total: 1950,
      paymentMethod: 'cash',
      startedBy: 'Asad',
      endedBy: 'Malik Sahib',
      createdAt: Date.now() - 28 * 60 * 60 * 1000,
    },
    {
      id: 'txn-4',
      date: yesterday,
      tableNumber: 'Pool 2',
      activityId: 'pool',
      customerName: 'Guest',
      duration: 60,
      tableCharges: 300,
      fnbItems: [],
      fnbTotal: 0,
      subtotal: 300,
      discountAmount: 0,
      discountReason: '',
      total: 300,
      paymentMethod: 'cash',
      startedBy: 'Kamran',
      endedBy: 'Kamran',
      createdAt: Date.now() - 30 * 60 * 60 * 1000,
    },
    {
      id: 'txn-5',
      date: twoDaysAgo,
      tableNumber: 'Snooker 1',
      activityId: 'snooker',
      customerName: 'Faisal Malik',
      customerPhone: '03005551234',
      duration: 150,
      tableCharges: 1250,
      fnbItems: [
        { id: 'item-9', name: 'Burger', price: 250, quantity: 2 },
        { id: 'item-3', name: 'Cold Drink', price: 100, quantity: 2 },
      ],
      fnbTotal: 700,
      subtotal: 1950,
      discountAmount: 100,
      discountReason: 'First visit discount',
      total: 1850,
      paymentMethod: 'split',
      splitPayment: { cash: 1000, card: 850 },
      startedBy: 'Asad',
      endedBy: 'Malik Sahib',
      createdAt: Date.now() - 52 * 60 * 60 * 1000,
    },
  ];

  // Sample expenses
  const demoExpenses = [
    {
      id: 'exp-1',
      date: today,
      category: 'utilities',
      description: 'Electricity bill',
      amount: 5000,
      paymentMethod: 'cash',
      createdBy: 'Malik Sahib',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: 'exp-2',
      date: yesterday,
      category: 'supplies',
      description: 'New chalk and cue tips',
      amount: 1500,
      paymentMethod: 'cash',
      createdBy: 'Asad',
      createdAt: Date.now() - 26 * 60 * 60 * 1000,
    },
    {
      id: 'exp-3',
      date: twoDaysAgo,
      category: 'inventory',
      description: 'Cold drinks stock',
      amount: 3000,
      paymentMethod: 'card',
      createdBy: 'Malik Sahib',
      createdAt: Date.now() - 50 * 60 * 60 * 1000,
    },
  ];

  // Settings
  const demoSettings = {
    version: 2,
    clubName: 'Demo Snooker Club',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    timezone: 'Asia/Karachi',
    defaultHourlyRate: 500,
    menuItems: demoMenuItems,
    bundles: demoBundles,
    customers: demoCustomers,
    owners: demoOwners,
    employees: demoEmployees,
    activities: [
      { id: 'snooker', name: 'Snooker', defaultRate: 500, icon: '🎱', color: 'slate' },
      { id: 'pool', name: 'Pool', defaultRate: 300, icon: '🎱', color: 'blue' },
    ],
    loyaltyEnabled: true,
    loyaltyPointsPerCurrency: 0.1,
    membershipTiers: [
      { name: 'bronze', minPoints: 0, discount: 0 },
      { name: 'silver', minPoints: 500, discount: 5 },
      { name: 'gold', minPoints: 1000, discount: 10 },
      { name: 'platinum', minPoints: 2000, discount: 15 },
    ],
  };

  // Save to localStorage
  localStorage.setItem('snooker_tables', JSON.stringify(demoTables));
  localStorage.setItem('snooker_settings', JSON.stringify(demoSettings));
  localStorage.setItem('finance_transactions', JSON.stringify(demoTransactions));
  localStorage.setItem('finance_expenses', JSON.stringify(demoExpenses));

  // Mark as initialized
  localStorage.setItem(DEMO_INITIALIZED_KEY, 'true');

  console.log('Demo data initialized successfully!');
}

// Function to reset demo data (for testing)
export function resetDemoData() {
  localStorage.removeItem(DEMO_INITIALIZED_KEY);
  localStorage.removeItem('snooker_tables');
  localStorage.removeItem('snooker_settings');
  localStorage.removeItem('finance_transactions');
  localStorage.removeItem('finance_expenses');
  initializeDemoData();
}
