import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWater, calculateDailyGoal } from '../context/WaterContext';
import { COLORS, ACTIVITY_LEVELS, CLIMATE_OPTIONS } from '../utils/constants';
import { requestPermissions, scheduleHydrationReminders } from '../hooks/useNotifications';

const { width } = Dimensions.get('window');

const STEPS = 4;

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { updateProfile, state } = useWater();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<string>('moderate');
  const [climate, setClimate] = useState<string>('temperate');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Animated.timing(slideAnim, {
      toValue: -(step + 1) * width,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    const w = parseFloat(weight) || 70;
    const goal = calculateDailyGoal(w, activity as any, climate as any);
    updateProfile({
      name,
      weight: w,
      activityLevel: activity as any,
      climate: climate as any,
      dailyGoal: goal,
      lastActiveDate: new Date().toISOString(),
    });

    // Try enabling notifications
    const granted = await requestPermissions();
    if (granted) {
      await scheduleHydrationReminders('07:00', '23:00', 2);
      updateProfile({ notificationsEnabled: true });
    }

    onComplete();
  };

  const goal = calculateDailyGoal(
    parseFloat(weight) || 70,
    activity as any,
    climate as any
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.slides,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Step 0: Welcome */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient colors={[COLORS.ocean, COLORS.wave, COLORS.sky]} style={styles.gradient}>
            <Text style={styles.bigEmoji}>💧</Text>
            <Text style={styles.welcomeTitle}>Welcome to{'\n'}AgentWater</Text>
            <Text style={styles.welcomeSubtitle}>
              Your personal AI hydration coach.{'\n'}
              We'll help you drink the right amount{'\n'}
              of water every day — effortlessly.
            </Text>
            <View style={styles.featureList}>
              {[
                { icon: '🎯', text: 'Personalized daily goal' },
                { icon: '🔔', text: 'Smart reminders' },
                { icon: '📊', text: 'Weekly & monthly stats' },
                { icon: '🔥', text: 'Streak tracking' },
              ].map((f) => (
                <View key={f.icon} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnTxt}>Get Started 🚀</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Step 1: Name & Weight */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradient}>
            <Text style={styles.stepEmoji}>👤</Text>
            <Text style={styles.stepTitle}>Tell us about{'\n'}yourself</Text>
            <Text style={styles.stepSubtitle}>We use this to calculate your ideal daily water intake.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Your name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex"
                value={name}
                onChangeText={setName}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Your weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: COLORS.ocean }]}
              onPress={goNext}
            >
              <Text style={styles.nextBtnTxt}>Next →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Step 2: Activity & Climate */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.gradient}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepEmoji}>🏃</Text>
              <Text style={styles.stepTitle}>Your Lifestyle</Text>
              <Text style={styles.stepSubtitle}>This affects how much water your body needs.</Text>

              <Text style={styles.inputLabel}>Activity Level</Text>
              <View style={styles.activityGrid}>
                {ACTIVITY_LEVELS.map((al) => (
                  <TouchableOpacity
                    key={al.value}
                    style={[styles.actBtn, activity === al.value && styles.actBtnActive]}
                    onPress={() => setActivity(al.value)}
                  >
                    <Text style={styles.actIcon}>{al.icon}</Text>
                    <Text style={[styles.actLabel, activity === al.value && styles.actLabelActive]}>
                      {al.label}
                    </Text>
                    <Text style={styles.actDesc}>{al.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 20 }]}>Climate</Text>
              <View style={styles.climateRow}>
                {CLIMATE_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.climateBtn, climate === c.value && styles.actBtnActive]}
                    onPress={() => setClimate(c.value)}
                  >
                    <Text style={styles.actIcon}>{c.icon}</Text>
                    <Text style={[styles.actLabel, climate === c.value && styles.actLabelActive]}>
                      {c.label}
                    </Text>
                    <Text style={styles.actDesc}>{c.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: COLORS.ocean, marginTop: 24 }]}
                onPress={goNext}
              >
                <Text style={styles.nextBtnTxt}>Next →</Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>

        {/* Step 3: Summary */}
        <View style={[styles.slide, { width }]}>
          <LinearGradient colors={[COLORS.ocean, COLORS.wave]} style={styles.gradient}>
            <Text style={styles.bigEmoji}>🎯</Text>
            <Text style={styles.welcomeTitle}>
              {name ? `You're all set,\n${name}!` : "You're all set!"}
            </Text>
            <Text style={styles.welcomeSubtitle}>Your personalized hydration plan:</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.goalNumber}>{goal}ml</Text>
              <Text style={styles.goalLabel}>Your Daily Water Goal</Text>
              <View style={styles.divider} />
              {[
                { label: 'Weight', value: `${weight || 70}kg` },
                {
                  label: 'Activity',
                  value: ACTIVITY_LEVELS.find((a) => a.value === activity)?.label || 'Moderate',
                },
                {
                  label: 'Climate',
                  value: CLIMATE_OPTIONS.find((c) => c.value === climate)?.label || 'Temperate',
                },
              ].map((r) => (
                <View key={r.label} style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>{r.label}</Text>
                  <Text style={styles.summaryRowValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.notifNote}>
              🔔 We'll ask for notification permission to send you hydration reminders.
            </Text>

            <TouchableOpacity style={[styles.nextBtn, styles.finishBtn]} onPress={handleFinish}>
              <Text style={[styles.nextBtnTxt, { color: COLORS.ocean }]}>
                Start Hydrating! 💧
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dots}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slides: { flexDirection: 'row', flex: 1 },
  slide: { flex: 1 },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 28,
    paddingBottom: 60,
    alignItems: 'center',
  },

  bigEmoji: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', lineHeight: 40 },
  welcomeSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  featureList: { marginTop: 28, width: '100%', gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22, width: 30 },
  featureText: { fontSize: 16, color: '#fff', fontWeight: '600' },

  stepEmoji: { fontSize: 52, marginBottom: 12 },
  stepTitle: { fontSize: 28, fontWeight: '800', color: COLORS.ocean, textAlign: 'center', lineHeight: 36 },
  stepSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },

  formGroup: { width: '100%', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: COLORS.wave,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
    width: '100%',
  },

  activityGrid: { gap: 8, width: '100%' },
  actBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    gap: 12,
  },
  actBtnActive: { borderColor: COLORS.wave, backgroundColor: COLORS.droplet },
  actIcon: { fontSize: 24, width: 30 },
  actLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, flex: 1 },
  actLabelActive: { color: COLORS.ocean },
  actDesc: { fontSize: 11, color: COLORS.textMuted, flex: 2, textAlign: 'right' },

  climateRow: { flexDirection: 'row', gap: 8, width: '100%' },
  climateBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    gap: 4,
  },

  nextBtn: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnTxt: { fontSize: 17, fontWeight: '800', color: COLORS.ocean },
  finishBtn: { backgroundColor: '#fff' },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  goalNumber: { fontSize: 48, fontWeight: '900', color: '#fff' },
  goalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%', marginVertical: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  summaryRowLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  summaryRowValue: { color: '#fff', fontWeight: '700', fontSize: 14 },
  notifNote: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 },

  dots: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotActive: { backgroundColor: COLORS.ocean, width: 24 },
});
