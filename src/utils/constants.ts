export const COLORS = {
  // Primary water blues
  ocean: '#0284c7',
  wave: '#0ea5e9',
  sky: '#38bdf8',
  mist: '#7dd3fc',
  foam: '#bae6fd',
  droplet: '#e0f2fe',

  // Accent
  coral: '#f97316',
  lime: '#84cc16',
  mint: '#34d399',
  gold: '#fbbf24',
  berry: '#a78bfa',

  // UI
  background: '#f0f9ff',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const FONTS = {
  display: 'System', // replaced with custom via @expo-google-fonts
  body: 'System',
};

export const QUICK_ADD_OPTIONS = [
  { amount: 100, emoji: '🥃', label: 'Shot' },
  { amount: 200, emoji: '🥤', label: 'Small' },
  { amount: 250, emoji: '🍶', label: 'Cup' },
  { amount: 350, emoji: '🧃', label: 'Juice' },
  { amount: 500, emoji: '🍼', label: 'Bottle' },
  { amount: 750, emoji: '💧', label: 'Large' },
  { amount: 1000, emoji: '🪣', label: 'Jug' },
];

export const DRINK_TYPES = [
  { emoji: '💧', label: 'Water', multiplier: 1.0 },
  { emoji: '🫖', label: 'Tea', multiplier: 0.9 },
  { emoji: '☕', label: 'Coffee', multiplier: 0.8 },
  { emoji: '🥤', label: 'Juice', multiplier: 0.85 },
  { emoji: '🧃', label: 'Smoothie', multiplier: 0.7 },
  { emoji: '🍵', label: 'Herbal Tea', multiplier: 0.95 },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', icon: '🪑', desc: 'Mostly sitting (desk job)' },
  { value: 'light', label: 'Light', icon: '🚶', desc: 'Light exercise 1-3x/week' },
  { value: 'moderate', label: 'Moderate', icon: '🏃', desc: 'Moderate exercise 3-5x/week' },
  { value: 'active', label: 'Active', icon: '🏋️', desc: 'Hard exercise 6-7x/week' },
  { value: 'very_active', label: 'Very Active', icon: '⚡', desc: 'Athlete / physical job' },
];

export const CLIMATE_OPTIONS = [
  { value: 'cold', label: 'Cold', icon: '❄️', desc: 'Below 15°C' },
  { value: 'temperate', label: 'Temperate', icon: '🌤', desc: '15–25°C' },
  { value: 'hot', label: 'Hot', icon: '☀️', desc: 'Above 25°C' },
];

export const HYDRATION_TIPS = [
  '💡 Drink a glass of water first thing in the morning to kickstart your metabolism.',
  '💡 Hunger is often confused with thirst — try drinking water before snacking.',
  '💡 Carry a reusable water bottle everywhere to make hydration easier.',
  '💡 Add lemon or cucumber to your water for a refreshing twist!',
  '💡 Your urine color is a great hydration indicator — aim for pale yellow.',
  '💡 Drinking water before meals can help with digestion and portion control.',
  '💡 Sports or outdoor activities increase your water needs significantly.',
  '💡 Coffee and tea count toward hydration, but water is always best!',
  '💡 Set hourly reminders so you never forget to drink water.',
  '💡 Eat water-rich foods like cucumbers, watermelon, and oranges.',
];

export const ACHIEVEMENT_BADGES = [
  { id: 'first_drop', emoji: '💧', title: 'First Drop', desc: 'Log your first water entry', target: 1 },
  { id: 'daily_goal', emoji: '🎯', title: 'Goal Crusher', desc: 'Hit your daily goal', target: 1 },
  { id: 'streak_3', emoji: '🔥', title: 'On Fire', desc: '3-day streak', target: 3 },
  { id: 'streak_7', emoji: '🌊', title: 'Wave Rider', desc: '7-day streak', target: 7 },
  { id: 'streak_30', emoji: '🏆', title: 'Hydration Master', desc: '30-day streak', target: 30 },
  { id: 'total_10l', emoji: '🪣', title: 'Ocean Starter', desc: 'Log 10 liters total', target: 10000 },
];
