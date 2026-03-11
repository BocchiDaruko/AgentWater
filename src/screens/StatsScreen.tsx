import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { useWater } from '../context/WaterContext';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 120;

type Period = 'week' | 'month';

export default function StatsScreen() {
  const { getWeeklyData, getMonthlyData, getWeeklyAverage, getMonthlyAverage, getStreak, state } =
    useWater();
  const [period, setPeriod] = useState<Period>('week');

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const data = period === 'week' ? weeklyData : monthlyData;
  const average = period === 'week' ? getWeeklyAverage() : getMonthlyAverage();
  const streak = getStreak();
  const goal = state.profile.dailyGoal;

  const daysGoalMet = data.filter((d) => d.total >= d.goal).length;
  const maxTotal = Math.max(...data.map((d) => d.total), goal);
  const totalConsumed = data.reduce((s, d) => s + d.total, 0);
  const daysWithData = data.filter((d) => d.total > 0).length;

  const getBarColor = (total: number, dayGoal: number) => {
    const pct = total / dayGoal;
    if (pct >= 1) return COLORS.mint;
    if (pct >= 0.75) return COLORS.wave;
    if (pct >= 0.5) return COLORS.sky;
    if (pct > 0) return COLORS.foam;
    return COLORS.border;
  };

  const getDayLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (period === 'week') return format(d, 'EEE');
    const day = parseInt(format(d, 'd'));
    return day % 5 === 0 || day === 1 ? format(d, 'd') : '';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.ocean, COLORS.wave]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Your Progress</Text>
        <Text style={styles.headerSubtitle}>Track your hydration journey</Text>
      </LinearGradient>

      {/* Period Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'week' && styles.toggleActive]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.toggleTxt, period === 'week' && styles.toggleActiveTxt]}>
            📅 This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'month' && styles.toggleActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.toggleTxt, period === 'month' && styles.toggleActiveTxt]}>
            🗓 This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsRow}>
        <SummaryCard emoji="💧" label="Avg Daily" value={`${(average / 1000).toFixed(2)}L`} color={COLORS.wave} />
        <SummaryCard emoji="🎯" label="Goal Hit" value={`${daysGoalMet}/${data.length}d`} color={COLORS.mint} />
        <SummaryCard emoji="🔥" label="Streak" value={`${streak} days`} color={COLORS.coral} />
      </View>

      <View style={styles.cardsRow}>
        <SummaryCard
          emoji="🌊"
          label="Total"
          value={`${(totalConsumed / 1000).toFixed(1)}L`}
          color={COLORS.ocean}
        />
        <SummaryCard
          emoji="📈"
          label="Active Days"
          value={`${daysWithData}d`}
          color={COLORS.berry}
        />
        <SummaryCard
          emoji="✅"
          label="Success Rate"
          value={`${daysWithData ? Math.round((daysGoalMet / daysWithData) * 100) : 0}%`}
          color={COLORS.lime}
        />
      </View>

      {/* Bar Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {period === 'week' ? '7-Day Overview' : '30-Day Overview'}
        </Text>

        <View style={styles.chart}>
          {/* Goal line */}
          <View
            style={[
              styles.goalLine,
              { bottom: (goal / maxTotal) * BAR_MAX_HEIGHT + 20 },
            ]}
          >
            <Text style={styles.goalLineTxt}>Goal</Text>
          </View>

          <View style={styles.barsContainer}>
            {data.map((d, i) => {
              const barH = d.total > 0 ? (d.total / maxTotal) * BAR_MAX_HEIGHT : 4;
              return (
                <View key={i} style={styles.barColumn}>
                  <Text style={styles.barValue}>
                    {d.total > 0 ? `${(d.total / 1000).toFixed(1)}` : ''}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: getBarColor(d.total, d.goal),
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{getDayLabel(d.date)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem color={COLORS.mint} label="Goal reached" />
          <LegendItem color={COLORS.wave} label="75%+ done" />
          <LegendItem color={COLORS.sky} label="50%+ done" />
          <LegendItem color={COLORS.border} label="No data" />
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.chartTitle}>🔍 Insights</Text>
        <InsightRow
          emoji="🏆"
          text={
            daysGoalMet >= (period === 'week' ? 5 : 20)
              ? 'Outstanding consistency! You hit your goal most days.'
              : daysGoalMet > 0
              ? `You hit your goal on ${daysGoalMet} day${daysGoalMet > 1 ? 's' : ''}. Keep it up!`
              : "You haven't hit your goal yet. Every sip counts!"
          }
        />
        <InsightRow
          emoji="💡"
          text={
            average >= goal
              ? `Your average of ${(average / 1000).toFixed(2)}L exceeds your daily goal. Amazing!`
              : average > 0
              ? `Your average is ${(average / 1000).toFixed(2)}L. Your goal is ${(goal / 1000).toFixed(1)}L.`
              : 'Log your water intake to see personalized insights.'
          }
        />
        <InsightRow
          emoji="🔥"
          text={
            streak >= 7
              ? `${streak}-day streak! You're on fire! Don't break the chain.`
              : streak > 0
              ? `${streak}-day streak going! Keep logging to build momentum.`
              : 'Start a streak today by hitting your daily goal!'
          }
        />
      </View>
    </ScrollView>
  );
}

function SummaryCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendTxt}>{label}</Text>
    </View>
  );
}

function InsightRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightEmoji}>{emoji}</Text>
      <Text style={styles.insightTxt}>{text}</Text>
    </View>
  );
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

  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.ocean },
  toggleTxt: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  toggleActiveTxt: { color: '#fff' },

  cardsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryEmoji: { fontSize: 22 },
  summaryValue: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  summaryLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 3, textAlign: 'center' },

  chartCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },

  chart: { position: 'relative', height: BAR_MAX_HEIGHT + 60 },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.coral,
    borderStyle: 'dashed',
  },
  goalLineTxt: {
    position: 'absolute',
    right: 0,
    top: -14,
    fontSize: 10,
    color: COLORS.coral,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 40,
    paddingTop: 20,
  },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', borderRadius: 6, minHeight: 4 },
  barValue: { fontSize: 7, color: COLORS.textMuted, marginBottom: 2, textAlign: 'center' },
  barLabel: { fontSize: 9, color: COLORS.textSecondary, marginTop: 4, fontWeight: '600' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 11, color: COLORS.textSecondary },

  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  insightEmoji: { fontSize: 20, marginTop: 1 },
  insightTxt: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
