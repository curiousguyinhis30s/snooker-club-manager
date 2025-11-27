import type { GameConfig } from '../types';

export const GAME_TYPES: Record<string, GameConfig> = {
  snooker: {
    type: 'snooker',
    icon: '🎱',
    label: 'Snooker',
    gradient: 'from-green-600 to-green-700',
    defaultRate: 15,
  },
  pool: {
    type: 'pool',
    icon: '🎱',
    label: 'Pool Table',
    gradient: 'from-blue-600 to-blue-700',
    defaultRate: 12,
  },
  '8-ball': {
    type: '8-ball',
    icon: '🎱',
    label: '8-Ball Pool',
    gradient: 'from-blue-500 to-blue-600',
    defaultRate: 10,
  },
  '9-ball': {
    type: '9-ball',
    icon: '🎱',
    label: '9-Ball Pool',
    gradient: 'from-indigo-500 to-indigo-600',
    defaultRate: 10,
  },
  billiards: {
    type: 'billiards',
    icon: '🎱',
    label: 'Billiards',
    gradient: 'from-teal-600 to-teal-700',
    defaultRate: 12,
  },
  'table-tennis': {
    type: 'table-tennis',
    icon: '🏓',
    label: 'Table Tennis',
    gradient: 'from-orange-500 to-orange-600',
    defaultRate: 8,
  },
  carrom: {
    type: 'carrom',
    icon: '🎯',
    label: 'Carrom Board',
    gradient: 'from-neutral-600 to-neutral-700',
    defaultRate: 6,
  },
  arcade: {
    type: 'arcade',
    icon: '🕹️',
    label: 'Arcade Machine',
    gradient: 'from-purple-600 to-purple-700',
    defaultRate: 5,
  },
  'dart-board': {
    type: 'dart-board',
    icon: '🎯',
    label: 'Dart Board',
    gradient: 'from-red-600 to-red-700',
    defaultRate: 7,
  },
  'air-hockey': {
    type: 'air-hockey',
    icon: '🏒',
    label: 'Air Hockey',
    gradient: 'from-cyan-600 to-cyan-700',
    defaultRate: 10,
  },
};

export const getGameConfig = (type: string): GameConfig => {
  return GAME_TYPES[type] || GAME_TYPES.snooker;
};

export const getAllGameTypes = (): GameConfig[] => {
  return Object.values(GAME_TYPES);
};
