import type { Reservation, ReservationStatus } from '../types';

const STORAGE_KEY = 'snooker_reservations';

// Helper to generate unique IDs
const generateId = () => `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get all reservations
export const getReservations = (): Reservation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save reservations
const saveReservations = (reservations: Reservation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
};

// Get reservations for a specific date
export const getReservationsByDate = (date: string): Reservation[] => {
  return getReservations().filter(r => r.date === date);
};

// Get reservations for a date range
export const getReservationsByDateRange = (startDate: string, endDate: string): Reservation[] => {
  return getReservations().filter(r => r.date >= startDate && r.date <= endDate);
};

// Get reservations by status
export const getReservationsByStatus = (status: ReservationStatus): Reservation[] => {
  return getReservations().filter(r => r.status === status);
};

// Get upcoming reservations (today and future)
export const getUpcomingReservations = (): Reservation[] => {
  const today = new Date().toISOString().split('T')[0];
  return getReservations()
    .filter(r => r.date >= today && !['completed', 'cancelled', 'no-show'].includes(r.status))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
};

// Get today's reservations
export const getTodayReservations = (): Reservation[] => {
  const today = new Date().toISOString().split('T')[0];
  return getReservationsByDate(today).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

// Check if a time slot is available
export const isTimeSlotAvailable = (
  date: string,
  startTime: string,
  endTime: string,
  activityId: string,
  tableId?: number,
  excludeReservationId?: string
): boolean => {
  const reservations = getReservationsByDate(date).filter(r =>
    r.id !== excludeReservationId &&
    r.activityId === activityId &&
    !['cancelled', 'no-show', 'completed'].includes(r.status)
  );

  // If specific table is requested, check only that table
  if (tableId) {
    const tableReservations = reservations.filter(r => r.tableId === tableId);
    return !tableReservations.some(r => {
      return (startTime < r.endTime && endTime > r.startTime);
    });
  }

  // Otherwise, check if there's any overlap
  return !reservations.some(r => {
    return (startTime < r.endTime && endTime > r.startTime);
  });
};

// Create a new reservation
export const createReservation = (
  data: Omit<Reservation, 'id' | 'createdAt' | 'status'>
): Reservation => {
  const reservations = getReservations();

  const newReservation: Reservation = {
    ...data,
    id: generateId(),
    status: 'pending',
    createdAt: Date.now(),
  };

  reservations.push(newReservation);
  saveReservations(reservations);

  return newReservation;
};

// Update reservation
export const updateReservation = (
  id: string,
  updates: Partial<Omit<Reservation, 'id' | 'createdAt'>>
): Reservation | null => {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) return null;

  reservations[index] = { ...reservations[index], ...updates };
  saveReservations(reservations);

  return reservations[index];
};

// Update reservation status
export const updateReservationStatus = (
  id: string,
  status: ReservationStatus,
  reason?: string
): Reservation | null => {
  const updates: Partial<Reservation> = { status };

  switch (status) {
    case 'confirmed':
      updates.confirmedAt = Date.now();
      break;
    case 'checked-in':
      updates.checkedInAt = Date.now();
      break;
    case 'completed':
      updates.completedAt = Date.now();
      break;
    case 'cancelled':
      updates.cancelledAt = Date.now();
      updates.cancellationReason = reason;
      break;
  }

  return updateReservation(id, updates);
};

// Confirm reservation
export const confirmReservation = (id: string): Reservation | null => {
  return updateReservationStatus(id, 'confirmed');
};

// Check in reservation (customer arrived)
export const checkInReservation = (id: string): Reservation | null => {
  return updateReservationStatus(id, 'checked-in');
};

// Complete reservation
export const completeReservation = (id: string): Reservation | null => {
  return updateReservationStatus(id, 'completed');
};

// Cancel reservation
export const cancelReservation = (id: string, reason?: string): Reservation | null => {
  return updateReservationStatus(id, 'cancelled', reason);
};

// Mark as no-show
export const markNoShow = (id: string): Reservation | null => {
  return updateReservationStatus(id, 'no-show');
};

// Delete reservation (hard delete)
export const deleteReservation = (id: string): boolean => {
  const reservations = getReservations();
  const filtered = reservations.filter(r => r.id !== id);

  if (filtered.length === reservations.length) return false;

  saveReservations(filtered);
  return true;
};

// Get reservation by ID
export const getReservationById = (id: string): Reservation | undefined => {
  return getReservations().find(r => r.id === id);
};

// Get reservations by customer phone
export const getReservationsByCustomer = (phone: string): Reservation[] => {
  return getReservations()
    .filter(r => r.customerPhone === phone)
    .sort((a, b) => b.createdAt - a.createdAt);
};

// Get statistics
export const getReservationStats = (startDate: string, endDate: string) => {
  const reservations = getReservationsByDateRange(startDate, endDate);

  return {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    checkedIn: reservations.filter(r => r.status === 'checked-in').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    noShow: reservations.filter(r => r.status === 'no-show').length,
  };
};

// Export store object
export const reservationStore = {
  getAll: getReservations,
  getByDate: getReservationsByDate,
  getByDateRange: getReservationsByDateRange,
  getByStatus: getReservationsByStatus,
  getUpcoming: getUpcomingReservations,
  getToday: getTodayReservations,
  getById: getReservationById,
  getByCustomer: getReservationsByCustomer,
  isTimeSlotAvailable,
  create: createReservation,
  update: updateReservation,
  updateStatus: updateReservationStatus,
  confirm: confirmReservation,
  checkIn: checkInReservation,
  complete: completeReservation,
  cancel: cancelReservation,
  markNoShow,
  delete: deleteReservation,
  getStats: getReservationStats,
};
