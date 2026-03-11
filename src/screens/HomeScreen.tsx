import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

import { useWater } from '../context/WaterContext';
import { WaterBottle } from '../components/WaterBottle';
import { COLORS, QUICK_ADD_OPTIONS, HYDRATION_TIPS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, addEntry, removeEntry, getTodayTotal, getTodayProgress } = useWater();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💧');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [tipIndex] = useState(() => Math.floor(Math.random() * HYDRATION_TIPS.length));

  const total = getTodayTotal();
  const progress = getTodayProgress();
  const goal = state.profile.dailyGoal;
  const remaining = Math.max(goal - total, 0);

  const handleQuickAdd = (amount: number, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    addEntry(amount, emoji);
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0 || amount > 5000) {
      Alert.alert('Invalid Amount', 'Please enter a value between 1 and 5000 ml.');
      return;
    }
    handleQuickAdd(amount, selectedEmoji);
    setCustomModalVisible(false);
    setCustomAmount('');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getProgressEmoji = () => {
    if (progress >= 1) return '🏆';
    if (progress >= 0.75) return '🌊';
    if (progress >= 0.5) return '💧';
    if (progress >= 0.25) return '😮‍💨';
    return '🏜️';
  };

  const getProgressMessage = () => {
    if (progress >= 1) return "Amazing! You've hit your goal! 🎉";
    if (progress >= 0.75) return `Just ${remaining}ml to go! Almost there!`;
    if (progress >= 0.5) return `Halfway there! Keep drinking! 💪`;
    if (progress >= 0.25) return `Good start! ${remaining}ml remaining.`;
    return `Stay hydrated! ${remaining}ml needed today.`;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.ocean, COLORS.wave, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}{state.profile.name ? `, ${state.profile.name}` : ''}!
            </Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakText}>{state.profile.streakDays}d</Text>
          </View>
        </View>

        {/* Bottle + Progress */}
        <View style={styles.bottleContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <WaterBottle progress={progress} size={160} />
          </Animated.View>

          <View style={styles.statsColumn}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>{getProgressEmoji()}</Text>
              <Text style={styles.statValue}>{(total / 1000).toFixed(2)}L</Text>
              <Text style={styles.statLabel}>consumed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{(goal / 1000).toFixed(1)}L</Text>
              <Text style={styles.statLabel}>daily goal</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⬇️</Text>
              <Text style={styles.statValue}>{remaining}ml</Text>
              <Text style={styles.statLabel}>remaining</Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>

        <Text style={styles.progressMsg}>{getProgressMessage()}</Text>
      </LinearGradient>

      {/* Quick Add */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add 💦</Text>
        <View style={styles.quickAddGrid}>
          {QUICK_ADD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.amount}
              style={styles.quickAddBtn}
              onPress={() => handleQuickAdd(opt.amount, opt.emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickAddEmoji}>{opt.emoji}</Text>
              <Text style={styles.quickAddAmount}>{opt.amount}ml</Text>
              <Text style={styles.quickAddLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickAddBtn, styles.customBtn]}
            onPress={() => setCustomModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickAddEmoji}>✏️</Text>
            <Text style={styles.quickAddAmount}>Custom</Text>
            <Text style={styles.quickAddLabel}>Amount</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Log */}
      {state.todayEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Log 📋</Text>
          <View style={styles.logContainer}>
            {[...state.todayEntries].reverse().map((entry) => (
              <View key={entry.id} style={styles.logEntry}>
                <Text style={styles.logEmoji}>{entry.emoji}</Text>
                <View style={styles.logInfo}>
                  <Text style={styles.logAmount}>{entry.amount}ml</Text>
                  <Text style={styles.logTime}>
                    {format(new Date(entry.timestamp), 'h:mm a')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    removeEntry(entry.id);
                  }}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hydration Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Hydration Tip</Text>
        <Text style={styles.tipText}>{HYDRATION_TIPS[tipIndex]}</Text>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom Amount</Text>
            <Text style={styles.modalSubtitle}>How much did you drink?</Text>

            <View style={styles.emojiRow}>
              {['💧', '🥤', '☕', '🫖', '🧃', '🍶'].map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setSelectedEmoji(e)}
                  style={[styles.emojiOpt, selectedEmoji === e && styles.emojiSelected]}
                >
                  <Text style={styles.emojiOptTxt}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.customInput}
              placeholder="Amount in ml"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              autoFocus
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.addBtn]}
                onPress={handleCustomAdd}
              >
                <Text style={styles.addBtnTxt}>Add Water 💧</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  date: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  streakFire: { fontSize: 18 },
  streakText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Bottle area
  bottleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16 },
  statsColumn: { gap: 10 },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  statEmoji: { fontSize: 20 },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 16, marginTop: 2 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },

  // Progress bar
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  progressBarBg: { flex: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
  progressPercent: { color: '#fff', fontWeight: '700', fontSize: 14, minWidth: 40, textAlign: 'right' },
  progressMsg: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 8, textAlign: 'center' },

  // Sections
  section: { margin: 20, marginBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },

  // Quick Add
  quickAddGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAddBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: (width - 60) / 4,
    shadowColor: COLORS.ocean,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  customBtn: { borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.wave, backgroundColor: COLORS.droplet },
  quickAddEmoji: { fontSize: 24 },
  quickAddAmount: { fontSize: 12, fontWeight: '700', color: COLORS.ocean, marginTop: 4 },
  quickAddLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

  // Log
  logContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logEmoji: { fontSize: 24, marginRight: 12 },
  logInfo: { flex: 1 },
  logAmount: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  logTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteTxt: { fontSize: 14, color: COLORS.error },

  // Tip
  tipCard: {
    margin: 20,
    backgroundColor: COLORS.droplet,
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.wave,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: COLORS.ocean, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  tipText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  emojiRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  emojiOpt: { padding: 10, borderRadius: 12, backgroundColor: COLORS.background },
  emojiSelected: { backgroundColor: COLORS.droplet, borderWidth: 2, borderColor: COLORS.wave },
  emojiOptTxt: { fontSize: 24 },
  customInput: {
    borderWidth: 2,
    borderColor: COLORS.wave,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  cancelBtn: { backgroundColor: COLORS.background },
  cancelBtnTxt: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 15 },
  addBtn: { backgroundColor: COLORS.ocean },
  addBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
