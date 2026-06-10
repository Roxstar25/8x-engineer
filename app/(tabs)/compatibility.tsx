import { useEffect, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Animated, Easing, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import SignPickerModal from '@/components/SignPickerModal'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/contexts/ProfileContext'
import { getCompatibility, getSignByName, type CompatibilityResult } from '@/lib/astrology'
import { generateCompatibility } from '@/lib/gemini'
import { colors } from '@/constants/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

function scoreColor(score: number): string {
  if (score < 50) return '#FF6B4A'
  if (score <= 75) return '#FFD700'
  return '#4CAF50'
}

// ─── Animated score arc ───────────────────────────────────────────────────────

function ScoreArc({ score, size = 150 }: { score: number; size?: number }) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    progress.setValue(0)
    Animated.timing(progress, {
      toValue: score / 100,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [score])

  const dashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [c, 0],
  })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={scoreColor(score)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashoffset}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={s.arcCenter}>
          <Text style={[s.arcScore, { color: scoreColor(score) }]}>{score}</Text>
          <Text style={s.arcLabel}>overall</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Animated score bar ───────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const fill = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fill.setValue(0)
    Animated.timing(fill, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [score])

  const width = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${score}%`],
  })

  return (
    <View style={s.barRow}>
      <View style={s.barLabelRow}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={[s.barScore, { color: scoreColor(score) }]}>{score}</Text>
      </View>
      <View style={s.barTrack}>
        <Animated.View style={[s.barFill, { width, backgroundColor: scoreColor(score) }]} />
      </View>
    </View>
  )
}

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets()
  const { profile, setProfile } = useProfile()

  const [partnerSign, setPartnerSign] = useState<string>('')
  const [pickerTarget, setPickerTarget] = useState<'you' | 'partner' | null>(null)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const yourSign = profile?.sign ?? ''
  const yourData = getSignByName(yourSign)
  const partnerData = getSignByName(partnerSign)

  async function handlePick(signName: string) {
    if (pickerTarget === 'you') {
      await setProfile({ name: profile?.name ?? '', dob: profile?.dob ?? '', sign: signName })
    } else if (pickerTarget === 'partner') {
      setPartnerSign(signName)
    }
  }

  async function handleCheck() {
    if (!yourSign || !partnerSign) return
    const scores = getCompatibility(yourSign, partnerSign)
    setResult(scores)
    setSummary('')
    setLoading(true)
    const text = await generateCompatibility(yourSign, partnerSign, scores)
    setSummary(text)
    setLoading(false)
  }

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[
          s.container,
          { paddingTop: insets.top + 14, paddingBottom: TAB_BAR_CLEARANCE + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>💫 Compatibility</Text>

        {/* Sign selectors */}
        <View style={s.selectorRow}>
          <Pressable style={s.selector} onPress={() => setPickerTarget('you')}>
            <Text style={s.selectorLabel}>YOUR SIGN</Text>
            <Text style={s.selectorValue}>
              {yourData ? `${yourData.symbol} ${yourData.name}` : 'Tap to set'}
            </Text>
          </Pressable>
          <Pressable style={s.selector} onPress={() => setPickerTarget('partner')}>
            <Text style={s.selectorLabel}>PARTNER'S SIGN</Text>
            <Text style={s.selectorValue}>
              {partnerData ? `${partnerData.symbol} ${partnerData.name}` : 'Tap to pick'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleCheck}
          disabled={!yourSign || !partnerSign}
          style={({ pressed }) => [
            s.checkBtn,
            (!yourSign || !partnerSign) && { opacity: 0.4 },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={s.checkText}>Check Compatibility</Text>
        </Pressable>

        {result && (
          <View style={s.results}>
            {/* Sign pair */}
            <View style={s.pairRow}>
              <Text style={s.pairGlyph}>{yourData?.symbol}</Text>
              <Text style={s.heart}>♥</Text>
              <Text style={s.pairGlyph}>{partnerData?.symbol}</Text>
            </View>

            {/* Arc */}
            <View style={{ alignItems: 'center', marginVertical: 6 }}>
              <ScoreArc score={result.overall} />
            </View>

            {/* Bars */}
            <View style={s.bars}>
              <ScoreBar label="Love" score={result.love} />
              <ScoreBar label="Communication" score={result.communication} />
              <ScoreBar label="Trust" score={result.trust} />
            </View>

            {/* AI summary */}
            <View style={s.summaryCard}>
              {loading ? (
                <ActivityIndicator color={colors.purple} />
              ) : (
                <Text style={s.summaryText}>{summary}</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <SignPickerModal
        visible={pickerTarget !== null}
        title={pickerTarget === 'partner' ? "Partner's Sign" : 'Your Sign'}
        selected={pickerTarget === 'partner' ? partnerSign : yourSign}
        onSelect={handlePick}
        onClose={() => setPickerTarget(null)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 18, gap: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.gold, textAlign: 'center' },

  selectorRow: { flexDirection: 'row', gap: 12 },
  selector: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  selectorLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, color: colors.textSecondary },
  selectorValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  checkBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  results: { gap: 18, marginTop: 4 },
  pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  pairGlyph: { fontSize: 52, color: colors.gold },
  heart: { fontSize: 30, color: colors.pink },

  arcCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  arcScore: { fontSize: 42, fontWeight: '800' },
  arcLabel: { fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5, marginTop: -2 },

  bars: { gap: 14 },
  barRow: { gap: 7 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 13.5, fontWeight: '600', color: colors.textPrimary },
  barScore: { fontSize: 13.5, fontWeight: '700' },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999 },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})
