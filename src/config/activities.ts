import type { Activity } from '../types';

// Icon Pack - 50+ Sports & Games
export const iconPack = {
  // Cue Sports
  '🎱': 'Billiards/Pool/Snooker',

  // Throwing Games
  '🎯': 'Darts',
  '🎳': 'Bowling',

  // Racket Sports
  '🏓': 'Table Tennis/Ping Pong',
  '🏸': 'Badminton',
  '🎾': 'Tennis',

  // Ball Sports
  '⚽': 'Soccer/Football/Foosball',
  '🏀': 'Basketball',
  '🏐': 'Volleyball',
  '⚾': 'Baseball',
  '🏈': 'American Football',
  '🏉': 'Rugby',

  // Winter Sports
  '🏒': 'Hockey/Air Hockey',
  '⛸️': 'Ice Skating',
  '⛷️': 'Skiing',

  // Gaming & Entertainment
  '🎮': 'Video Games/Console Gaming',
  '🕹️': 'Retro Arcade',
  '🎰': 'Slots/Casino Games',
  '🎲': 'Board Games',
  '🃏': 'Card Games',
  '♟️': 'Chess',
  '🀄': 'Mahjong',

  // Entertainment
  '🎪': 'General Entertainment',
  '🎭': 'Theater/Performance',
  '🎨': 'Arts & Crafts',
  '🎬': 'Cinema/Movies',
  '🎤': 'Karaoke',
  '🎵': 'Music/DJ',

  // Combat Sports
  '🥊': 'Boxing',
  '🤺': 'Fencing',
  '🥋': 'Martial Arts/Karate',

  // Other Sports
  '🏹': 'Archery/Target Shooting',
  '🏋️': 'Gym/Fitness/Weightlifting',
  '🤸': 'Gymnastics',
  '🧗': 'Rock Climbing',
  '🏊': 'Swimming',
  '🚴': 'Cycling',
  '🏃': 'Running/Track',
  '⛳': 'Golf/Mini Golf',

  // Misc
  '🎡': 'Amusement/Rides',
  '🎢': 'Roller Coaster/Thrill Rides',
  '🎠': 'Carousel/Kids Games',
  '🏎️': 'Racing/Go-Karts',
  '🎣': 'Fishing',
  '🎖️': 'Competitions/Tournaments',
  '🏆': 'Championship/Trophy Room',
  '⭐': 'VIP/Premium Service',
  '🎉': 'Party/Events',
} as const;

// Color schemes for activities
export const colorSchemes = {
  green: {
    color: 'green',
    gradient: 'from-green-600 to-green-700',
    bgClass: 'bg-green-600',
    hoverClass: 'hover:bg-green-700',
    textClass: 'text-green-600'
  },
  blue: {
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700',
    bgClass: 'bg-blue-600',
    hoverClass: 'hover:bg-blue-700',
    textClass: 'text-blue-600'
  },
  red: {
    color: 'red',
    gradient: 'from-red-600 to-red-700',
    bgClass: 'bg-red-600',
    hoverClass: 'hover:bg-red-700',
    textClass: 'text-red-600'
  },
  orange: {
    color: 'orange',
    gradient: 'from-orange-600 to-orange-700',
    bgClass: 'bg-orange-600',
    hoverClass: 'hover:bg-orange-700',
    textClass: 'text-orange-600'
  },
  purple: {
    color: 'purple',
    gradient: 'from-purple-600 to-purple-700',
    bgClass: 'bg-purple-600',
    hoverClass: 'hover:bg-purple-700',
    textClass: 'text-purple-600'
  },
  teal: {
    color: 'teal',
    gradient: 'from-teal-600 to-teal-700',
    bgClass: 'bg-teal-600',
    hoverClass: 'hover:bg-teal-700',
    textClass: 'text-teal-600'
  },
  cyan: {
    color: 'cyan',
    gradient: 'from-cyan-600 to-cyan-700',
    bgClass: 'bg-cyan-600',
    hoverClass: 'hover:bg-cyan-700',
    textClass: 'text-cyan-600'
  },
  indigo: {
    color: 'indigo',
    gradient: 'from-indigo-600 to-indigo-700',
    bgClass: 'bg-indigo-600',
    hoverClass: 'hover:bg-indigo-700',
    textClass: 'text-indigo-600'
  },
  pink: {
    color: 'pink',
    gradient: 'from-pink-600 to-pink-700',
    bgClass: 'bg-pink-600',
    hoverClass: 'hover:bg-pink-700',
    textClass: 'text-pink-600'
  },
  yellow: {
    color: 'yellow',
    gradient: 'from-yellow-600 to-yellow-700',
    bgClass: 'bg-yellow-600',
    hoverClass: 'hover:bg-yellow-700',
    textClass: 'text-yellow-600'
  }
};

// Default activities - Pre-configured but user can enable/disable
export const defaultActivities: Activity[] = [
  {
    id: 'snooker',
    name: 'Snooker',
    icon: '🎱',
    color: 'green',
    gradient: 'from-green-600 to-green-700',
    defaultRate: 15,
    stationCount: 3,
    stationType: 'Table',
    enabled: true,
    order: 1
  },
  {
    id: 'pool',
    name: 'Pool',
    icon: '🎱',
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700',
    defaultRate: 12,
    stationCount: 2,
    stationType: 'Table',
    enabled: true,
    order: 2
  },
  {
    id: 'darts',
    name: 'Darts',
    icon: '🎯',
    color: 'red',
    gradient: 'from-red-600 to-red-700',
    defaultRate: 8,
    stationCount: 4,
    stationType: 'Board',
    enabled: true,
    order: 3
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: '🏓',
    color: 'orange',
    gradient: 'from-orange-600 to-orange-700',
    defaultRate: 10,
    stationCount: 2,
    stationType: 'Table',
    enabled: true,
    order: 4
  },
  {
    id: 'arcade',
    name: 'Arcade',
    icon: '🎮',
    color: 'purple',
    gradient: 'from-purple-600 to-purple-700',
    defaultRate: 5,
    stationCount: 6,
    stationType: 'Machine',
    enabled: true,
    order: 5
  },
  {
    id: 'foosball',
    name: 'Foosball',
    icon: '⚽',
    color: 'teal',
    gradient: 'from-teal-600 to-teal-700',
    defaultRate: 10,
    stationCount: 2,
    stationType: 'Table',
    enabled: false,
    order: 6
  },
  {
    id: 'air-hockey',
    name: 'Air Hockey',
    icon: '🏒',
    color: 'cyan',
    gradient: 'from-cyan-600 to-cyan-700',
    defaultRate: 10,
    stationCount: 2,
    stationType: 'Table',
    enabled: false,
    order: 7
  },
  {
    id: 'bowling',
    name: 'Bowling',
    icon: '🎳',
    color: 'indigo',
    gradient: 'from-indigo-600 to-indigo-700',
    defaultRate: 20,
    stationCount: 4,
    stationType: 'Lane',
    enabled: false,
    order: 8
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    icon: '🎤',
    color: 'pink',
    gradient: 'from-pink-600 to-pink-700',
    defaultRate: 15,
    stationCount: 3,
    stationType: 'Room',
    enabled: false,
    order: 9
  },
  {
    id: 'mini-golf',
    name: 'Mini Golf',
    icon: '⛳',
    color: 'green',
    gradient: 'from-green-600 to-green-700',
    defaultRate: 12,
    stationCount: 1,
    stationType: 'Course',
    enabled: false,
    order: 10
  }
];

// Helper function to get activity by ID
export const getActivity = (activities: Activity[], activityId: string): Activity | undefined => {
  return activities.find(a => a.id === activityId);
};

// Helper function to get enabled activities only
export const getEnabledActivities = (activities: Activity[]): Activity[] => {
  return activities.filter(a => a.enabled).sort((a, b) => a.order - b.order);
};

// Helper function to create a new activity ID
export const generateActivityId = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};
