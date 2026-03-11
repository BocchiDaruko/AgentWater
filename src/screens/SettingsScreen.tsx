import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWater, calculateDailyGoal } from '../context/WaterContext';
import { COLORS, ACTIVITY_LEVELS, CLIMATE_OPTIONS } from '../utils/constants';
import {
  requestPermissions,
  scheduleHydrationReminders,
  cancelAllNotifications,
  sendTestNotification,
} from '../hooks/useNotifications';

export default function SettingsScreen() {
  const { state, updateProfile } = useWater();
  const { profile } = state;

  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(String(profile.weight));
  const [wakeUpTime, setWakeUpTime] = useState(profile.wakeUpTime);
  const [sleepTime, setSleepTime] = useState(profile.sleepTime);
  const [interval, setInterval] = useState(String(profile.notificationInterval));

  const handleSaveProfile = () => {
    const w = parseFloat(weight);
    if (!w || w < 30 || w > 300) {
      Alert.alert('Invalid Weight', 'Please enter a weight between 30 and 300 kg.');
      return;
    }
    const newGoal = calculateDailyGoal(w, profile.activityLevel, profile.climate);
    updateProfile({ name, weight: w, dailyGoal: newGoal });
    Alert.alert('Saved! 💧', `Your daily goal is now ${newGoal}ml.`);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive hydration reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      await scheduleHydrationReminders(wakeUpTime, sleepTime, parseInt(interval) || 2);
      updateProfile({ notificationsEnabled: true });
    } else {
      await cancelAllNotifications();
      updateProfile({ notificationsEnabled: false });
    }
  };

  const handleSaveNotifications = async () => {
    const h = parseInt(interval);
    if (!h || h < 1 || h > 8) {
      Alert.alert('Invalid Interval', 'Please enter an interval between 1 and 8 hours.');
      return;
    }
    updateProfile({
      notificationInterval: h,
      wakeUpTime,
      sleepTime,
    });
    if (profile.notificationsEnabled) {
      await cancelAllNotifications();
      await scheduleHydrationReminders(wakeUpTime, sleepTime, h);
    }
    Alert.alert('Notifications Updated! 🔔', 'Your reminder schedule has been saved.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={[COLORS.ocean, COLORS.wave]} style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>Personalize your experience</Text>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Profile</Text>

        <View style={styles.card}>
          <Label text="Your Name" />
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.textMuted}
          />

          <Label text="Weight (kg)" />
          <TextInput
            style={styles.input}
            placeholder="e.g. 70"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholderTextColor={COLORS.textMuted}
          />

          <Label text="Activity Level" />
          <View style={styles.optionGrid}>
            {ACTIVITY_LEVELS.map((al) => (
              <TouchableOpacity
                key={al.value}
                style={[
                  styles.optionBtn,
                  profile.activityLevel === al.value && styles.optionBtnActive,
                ]}
                onPress={() => {
                  const newGoal = calculateDailyGoal(
                    parseFloat(weight) || profile.weight,
                    al.value as any,
                    profile.climate
                  );
                  updateProfile({ activityLevel: al.value as any, dailyGoal: newGoal });
                }}
              >
                <Text style={styles.optionIcon}>{al.icon}</Text>
                <Text
                  style={[
                    styles.optionTxt,
                    profile.activityLevel === al.value && styles.optionTxtActive,
                  ]}
                >
                  {al.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text="Climate" />
          <View style={styles.optionRow}>
            {CLIMATE_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[
                  styles.climateBtn,
                  profile.climate === c.value && styles.optionBtnActive,
                ]}
                onPress={() => {
                  const newGoal = calculateDailyGoal(
                    parseFloat(weight) || profile.weight,
                    profile.activityLevel,
                    c.value as any
                  );
                  updateProfile({ climate: c.value as any, dailyGoal: newGoal });
                }}
              >
                <Text style={styles.optionIcon}>{c.icon}</Text>
                <Text
                  style={[
                    styles.optionTxt,
                    profile.climate === c.value && styles.optionTxtActive,
                  ]}
                >
                  {c.label}
                </Text>
                <Text style={styles.climateDesc}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.goalDisplay}>
            <Text style={styles.goalLabel}>Recommended Daily Goal</Text>
            <Text style={styles.goalValue}>
              {calculateDailyGoal(
                parseFloat(weight) || profile.weight,
                profile.activityLevel,
                profile.climate
              )}
              ml
            </Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
            <Text style={styles.saveBtnTxt}>Save Profile 💾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Enable Reminders</Text>
              <Text style={styles.switchSubLabel}>Get hydration alerts throughout the day</Text>
            </View>
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: COLORS.border, true: COLORS.wave }}
              thumbColor={profile.notificationsEnabled ? COLORS.ocean : '#f4f3f4'}
            />
          </View>

          {profile.notificationsEnabled && (
            <>
              <Label text="Reminder Interval (hours)" />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                keyboardType="numeric"
                value={interval}
                onChangeText={setInterval}
                placeholderTextColor={COLORS.textMuted}
              />

              <Label text="Wake-up Time (HH:MM)" />
              <TextInput
                style={styles.input}
                placeholder="07:00"
                value={wakeUpTime}
                onChangeText={setWakeUpTime}
                placeholderTextColor={COLORS.textMuted}
              />

              <Label text="Sleep Time (HH:MM)" />
              <TextInput
                style={styles.input}
                placeholder="23:00"
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotifications}>
                <Text style={styles.saveBtnTxt}>Update Schedule 🔔</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testBtn}
                onPress={() => {
                  sendTestNotification();
                  Alert.alert('Test Sent!', 'You will receive a notification in ~3 seconds.');
                }}
              >
                <Text style={styles.testBtnTxt}>Send Test Notification 🧪</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Goal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 How We Calculate Your Goal</Text>
        <View style={[styles.card, { gap: 10 }]}>
          {[
            { emoji: '⚖️', text: 'Base: 35ml per kg of body weight' },
            { emoji: '🏋️', text: 'Adjusted by your activity level (1.0x–1.5x)' },
            { emoji: '☀️', text: 'Climate bonus: up to +500ml in hot weather' },
            { emoji: '🎯', text: 'Result: your personalized daily hydration goal' },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoEmoji}>{item.emoji}</Text>
              <Text style={styles.infoTxt}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  section: { margin: 20, marginBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },

  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  optionBtnActive: { backgroundColor: COLORS.droplet, borderColor: COLORS.wave },
  optionIcon: { fontSize: 16 },
  optionTxt: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  optionTxtActive: { color: COLORS.ocean },

  optionRow: { flexDirection: 'row', gap: 8 },
  climateBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  climateDesc: { fontSize: 9, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },

  goalDisplay: {
    backgroundColor: COLORS.droplet,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  goalLabel: { fontSize: 13, color: COLORS.ocean, fontWeight: '600' },
  goalValue: { fontSize: 28, fontWeight: '800', color: COLORS.ocean, marginTop: 4 },

  saveBtn: {
    backgroundColor: COLORS.ocean,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  testBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: COLORS.wave,
  },
  testBtnTxt: { color: COLORS.ocean, fontWeight: '600', fontSize: 14 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  switchSubLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, maxWidth: 220 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoEmoji: { fontSize: 18, marginTop: 1 },
  infoTxt: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
