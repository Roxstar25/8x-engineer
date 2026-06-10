import { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import SignPickerModal from '@/components/SignPickerModal'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/contexts/ProfileContext'
import { getSignByName } from '@/lib/astrology'
import {
  generateHoroscope,
  type HoroscopeReading,
  type HoroscopePeriod,
} from '@/lib/gemini'
import { cacheGet, cacheSet } from '@/lib/storage'
import { colors } from '@/constants/theme'

const PERIODS: HoroscopePeriod[] = ['daily', 'weekly', 'monthly']

const SUB_CARDS: { key: keyof HoroscopeReading; emoji: string; label: string }[] = [
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'career', emoji: '💼', label: 'Career' },
  { key: 'wellness', emoji: '🌿', label: 'Wellness' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export default function HoroscopeScreen() {
  const insets = useSafeAreaInsets()
  const { profile, setProfile } = useProfile()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [period, setPeriod] = useState<HoroscopePeriod>('daily')
  const [reading, setReading] = useState<HoroscopeReading | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const sign = profile?.sign ?? ''
  const signData = getSignByName(sign)

  useEffect(() => {
    if (!sign) {
      setReading(null)
      return
    }
    let cancelled = false
    const key = `${sign}_${period}_${todayKey()}`

    ;(async () => {
      const cached = await cacheGet<HoroscopeReading>(key)
      if (cached && !cancelled) {
        setReading(cached)
        return
      }
      setLoading(true)
      const result = await generateHoroscope(sign, period)
      if (cancelled) return
      setReading(result)
      setLoading(false)
      cacheSet(key, result)
    })()

    return () => {
      cancelled = true
    }
  }, [sign, period])

  async function handlePickSign(signName: string) {
    await setProfile({
      name: profile?.name ?? '',
      dob: profile?.dob ?? '',
      sign: signName,
    })
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
        <Text style={s.appTitle}>✨ AstraAI</Text>

        {!sign ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyGlyph}>🔮</Text>
            <Text style={s.emptyText}>
              Set your zodiac sign to unlock your personalized horoscope.
            </Text>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.primaryBtnText}>Set Your Sign</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Period toggle */}
            <View style={s.toggle}>
              {PERIODS.map((p) => {
                const active = p === period
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={[s.togglePill, active && s.togglePillActive]}
                  >
                    <Text style={[s.toggleText, active && s.toggleTextActive]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Horoscope card */}
            <View style={s.card}>
              <Pressable style={s.signHeader} onPress={() => setPickerOpen(true)}>
                <Text style={s.signGlyph}>{signData?.symbol}</Text>
                <View>
                  <Text style={s.signName}>{sign}</Text>
                  <Text style={s.signChange}>Tap to change</Text>
                </View>
              </Pressable>

              {loading ? (
                <View style={s.skeletonWrap}>
                  <View style={[s.skeleton, { width: '100%' }]} />
                  <View style={[s.skeleton, { width: '92%' }]} />
                  <View style={[s.skeleton, { width: '70%' }]} />
                  <ActivityIndicator color={colors.purple} style={{ marginTop: 10 }} />
                </View>
              ) : (
                <Text style={s.mainReading}>{reading?.main}</Text>
              )}
            </View>

            {/* Sub-cards */}
            <View style={s.subRow}>
              {SUB_CARDS.map(({ key, emoji, label }) => {
                const isOpen = expanded === key
                return (
                  <Pressable
                    key={key}
                    onPress={() => setExpanded(isOpen ? null : key)}
                    style={[s.subCard, isOpen && s.subCardOpen]}
                  >
                    <Text style={s.subEmoji}>{emoji}</Text>
                    <Text style={s.subLabel}>{label}</Text>
                    {!loading && reading && (
                      <Text style={s.subText} numberOfLines={isOpen ? undefined : 2}>
                        {reading[key]}
                      </Text>
                    )}
                  </Pressable>
                )
              })}
            </View>
            <Text style={s.hint}>Tap a card to expand</Text>
          </>
        )}
      </ScrollView>

      <SignPickerModal
        visible={pickerOpen}
        selected={sign || undefined}
        onSelect={handlePickSign}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 18, gap: 16 },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  emptyWrap: { alignItems: 'center', gap: 16, paddingTop: 60, paddingHorizontal: 12 },
  emptyGlyph: { fontSize: 56 },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  primaryBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  togglePill: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  togglePillActive: { backgroundColor: colors.purple },
  toggleText: { color: colors.textSecondary, fontSize: 13.5, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  signHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signGlyph: { fontSize: 40, color: colors.gold },
  signName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  signChange: { fontSize: 12, color: colors.textSecondary },
  mainReading: { fontSize: 15.5, lineHeight: 24, color: colors.textPrimary },

  skeletonWrap: { gap: 10 },
  skeleton: { height: 13, borderRadius: 7, backgroundColor: 'rgba(155,109,255,0.14)' },

  subRow: { flexDirection: 'row', gap: 10 },
  subCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
  },
  subCardOpen: { borderColor: colors.purple, backgroundColor: 'rgba(155,109,255,0.1)' },
  subEmoji: { fontSize: 20 },
  subLabel: { fontSize: 13, fontWeight: '700', color: colors.gold },
  subText: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  hint: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
})
