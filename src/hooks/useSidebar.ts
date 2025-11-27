import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sidebar-state';
const BOOKINGS_KEY = 'sidebar-bookings-expanded';
const SETTINGS_KEY = 'sidebar-settings-expanded';

interface SidebarState {
  isCollapsed: boolean;
  bookingsExpanded: boolean;
  settingsExpanded: boolean;
}

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  const [bookingsExpanded, setBookingsExpanded] = useState(() => {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    return saved ? JSON.parse(saved) : true; // Default expanded
  });

  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : true; // Default expanded
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookingsExpanded));
  }, [bookingsExpanded]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsExpanded));
  }, [settingsExpanded]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleBookings = () => setBookingsExpanded(!bookingsExpanded);
  const toggleSettings = () => setSettingsExpanded(!settingsExpanded);

  return {
    isCollapsed,
    bookingsExpanded,
    settingsExpanded,
    toggleSidebar,
    toggleBookings,
    toggleSettings,
  };
}
