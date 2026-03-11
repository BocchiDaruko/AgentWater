import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfWeek, startOfMonth, eachDayOfInterval, subDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  amount: number; // ml
  timestamp: string; // ISO
  emoji: string;
}

export interface UserProfile {
  name: string;
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  climate: 'cold' | 'temperate' | 'hot';
  dailyGoal: number; // ml
  notificationsEnabled: boolean;
  notificationInterval: number; // hours
  wakeUpTime: string; // "HH:mm"
  sleepTime: string;  // "HH:mm"
  streakDays: number;
  lastActiveDate: string;
}

export interface DayRecord {
  date: string; // "yyyy-MM-dd"
  entries: WaterEntry[];
  goal: number;
  totalConsumed: number;
}

interface WaterState {
  profile: UserProfile;
  todayEntries: WaterEntry[];
  history: Record<string, DayRecord>; // key: "yyyy-MM-dd"
  isLoaded: boolean;
}

type WaterAction =
  | { type: 'LOAD_STATE'; payload: Partial<WaterState> }
  | { type: 'ADD_ENTRY'; payload: WaterEntry }
  | { type: 'REMOVE_ENTRY'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'RESET_DAY' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calculateDailyGoal(
  weight: number,
  activityLevel: UserProfile['activityLevel'],
  climate: UserProfile['climate']
): number {
  // Base: 35ml per kg
  let base = weight * 35;

  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.35,
    very_active: 1.5,
  };

  const climateBonus = {
    cold: 0,
    temperate: 200,
    hot: 500,
  };

  return Math.round(base * activityMultipliers[activityLevel] + climateBonus[climate]);
}

// ─── Initial State ────────────────────────────────────────────────────────────

const defaultProfile: UserProfile = {
  name: '',
  weight: 70,
  activityLevel: 'moderate',
  climate: 'temperate',
  dailyGoal: 2450,
  notificationsEnabled: false,
  notificationInterval: 2,
  wakeUpTime: '07:00',
  sleepTime: '23:00',
  streakDays: 0,
  lastActiveDate: '',
};

const initialState: WaterState = {
  profile: defaultProfile,
  todayEntries: [],
  history: {},
  isLoaded: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function waterReducer(state: WaterState, action: WaterAction): WaterState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoaded: true };

    case 'ADD_ENTRY': {
      const newEntries = [...state.todayEntries, action.payload];
      const today = format(new Date(), 'yyyy-MM-dd');
      const total = newEntries.reduce((sum, e) => sum + e.amount, 0);
      return {
        ...state,
        todayEntries: newEntries,
        history: {
          ...state.history,
          [today]: {
            date: today,
            entries: newEntries,
            goal: state.profile.dailyGoal,
            totalConsumed: total,
          },
        },
      };
    }

    case 'REMOVE_ENTRY': {
      const newEntries = state.todayEntries.filter((e) => e.id !== action.payload);
      const today = format(new Date(), 'yyyy-MM-dd');
      const total = newEntries.reduce((sum, e) => sum + e.amount, 0);
      return {
        ...state,
        todayEntries: newEntries,
        history: {
          ...state.history,
          [today]: {
            date: today,
            entries: newEntries,
            goal: state.profile.dailyGoal,
            totalConsumed: total,
          },
        },
      };
    }

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'RESET_DAY':
      return { ...state, todayEntries: [] };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface WaterContextType {
  state: WaterState;
  addEntry: (amount: number, emoji: string) => void;
  removeEntry: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getTodayTotal: () => number;
  getTodayProgress: () => number; // 0-1
  getWeeklyData: () => { date: string; total: number; goal: number }[];
  getMonthlyData: () => { date: string; total: number; goal: number }[];
  getWeeklyAverage: () => number;
  getMonthlyAverage: () => number;
  getStreak: () => number;
}

const WaterContext = createContext<WaterContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WaterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(waterReducer, initialState);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [profileRaw, historyRaw] = await Promise.all([
          AsyncStorage.getItem('agentwater_profile'),
          AsyncStorage.getItem('agentwater_history'),
        ]);

        const today = format(new Date(), 'yyyy-MM-dd');
        const profile = profileRaw ? JSON.parse(profileRaw) : defaultProfile;
        const history: Record<string, DayRecord> = historyRaw ? JSON.parse(historyRaw) : {};
        const todayRecord = history[today];

        dispatch({
          type: 'LOAD_STATE',
          payload: {
            profile,
            history,
            todayEntries: todayRecord?.entries || [],
          },
        });
      } catch {
        dispatch({ type: 'LOAD_STATE', payload: {} });
      }
    })();
  }, []);

  // Persist on state change
  useEffect(() => {
    if (!state.isLoaded) return;
    AsyncStorage.setItem('agentwater_profile', JSON.stringify(state.profile));
    AsyncStorage.setItem('agentwater_history', JSON.stringify(state.history));
  }, [state]);

  // ── Actions ──

  const addEntry = (amount: number, emoji: string) => {
    dispatch({
      type: 'ADD_ENTRY',
      payload: {
        id: Date.now().toString(),
        amount,
        timestamp: new Date().toISOString(),
        emoji,
      },
    });
  };

  const removeEntry = (id: string) => dispatch({ type: 'REMOVE_ENTRY', payload: id });

  const updateProfile = (updates: Partial<UserProfile>) =>
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });

  const getTodayTotal = () => state.todayEntries.reduce((s, e) => s + e.amount, 0);

  const getTodayProgress = () =>
    Math.min(getTodayTotal() / state.profile.dailyGoal, 1);

  const getWeeklyData = () => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const record = state.history[key];
      return { date: key, total: record?.totalConsumed || 0, goal: record?.goal || state.profile.dailyGoal };
    });
  };

  const getMonthlyData = () => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const record = state.history[key];
      return { date: key, total: record?.totalConsumed || 0, goal: record?.goal || state.profile.dailyGoal };
    });
  };

  const getWeeklyAverage = () => {
    const data = getWeeklyData();
    const withData = data.filter((d) => d.total > 0);
    return withData.length ? Math.round(withData.reduce((s, d) => s + d.total, 0) / withData.length) : 0;
  };

  const getMonthlyAverage = () => {
    const data = getMonthlyData();
    const withData = data.filter((d) => d.total > 0);
    return withData.length ? Math.round(withData.reduce((s, d) => s + d.total, 0) / withData.length) : 0;
  };

  const getStreak = () => {
    let streak = 0;
    let current = new Date();
    while (true) {
      const key = format(current, 'yyyy-MM-dd');
      const record = state.history[key];
      if (record && record.totalConsumed >= record.goal) {
        streak++;
        current = subDays(current, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <WaterContext.Provider
      value={{
        state,
        addEntry,
        removeEntry,
        updateProfile,
        getTodayTotal,
        getTodayProgress,
        getWeeklyData,
        getMonthlyData,
        getWeeklyAverage,
        getMonthlyAverage,
        getStreak,
      }}
    >
      {children}
    </WaterContext.Provider>
  );
}

export function useWater() {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error('useWater must be used within WaterProvider');
  return ctx;
}
