import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useWater } from '../context/WaterContext';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HYDRATION_MESSAGES = [
  { title: '💧 Time to Hydrate!', body: "Your body is calling — give it some water! You're doing great today." },
  { title: '🌊 Water Break!', body: 'A quick sip keeps the doctor away. Stay on track with your goal!' },
  { title: '💦 Splash Alert!', body: "Don't forget to drink water. Every ml counts toward your daily goal!" },
  { title: '🚿 Hydration Check!', body: "How's your water intake? Let's keep that streak going!" },
  { title: '🫧 Bubble Reminder!', body: 'Your body is 60% water — keep it topped up! Time for a glass.' },
  { title: '⛲ Flow with It!', body: 'Staying hydrated = better focus + energy. Drink up!' },
  { title: '🌧 Rain on Yourself!', body: 'Hydration time! Your future self will thank you.' },
  { title: '🐳 Big Splash!', body: 'Even whales stay hydrated! Log your water now. 🐳' },
];

export function useNotifications() {
  const { state } = useWater();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (state.isLoaded) {
      if (state.profile.notificationsEnabled) {
        scheduleHydrationReminders();
      } else {
        cancelAllNotifications();
      }
    }
  }, [
    state.isLoaded,
    state.profile.notificationsEnabled,
    state.profile.notificationInterval,
    state.profile.wakeUpTime,
    state.profile.sleepTime,
  ]);

  return { requestPermissions, cancelAllNotifications };
}

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Notifications require a physical device.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('hydration', {
      name: 'Hydration Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleHydrationReminders(
  wakeUpTime = '07:00',
  sleepTime = '23:00',
  intervalHours = 2
) {
  await cancelAllNotifications();

  const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);
  const [sleepH, sleepM] = sleepTime.split(':').map(Number);

  const wakeMinutes = wakeH * 60 + wakeM;
  const sleepMinutes = sleepH * 60 + sleepM;

  const notifications = [];
  let currentMinutes = wakeMinutes + intervalHours * 60;
  let msgIndex = 0;

  while (currentMinutes < sleepMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const msg = HYDRATION_MESSAGES[msgIndex % HYDRATION_MESSAGES.length];

    notifications.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { type: 'hydration_reminder' },
          sound: 'default',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      })
    );

    currentMinutes += intervalHours * 60;
    msgIndex++;
  }

  await Promise.all(notifications);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendTestNotification() {
  const msg = HYDRATION_MESSAGES[Math.floor(Math.random() * HYDRATION_MESSAGES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      data: { type: 'test' },
    },
    trigger: { seconds: 3 },
  });
}
