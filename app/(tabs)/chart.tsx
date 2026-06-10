import { useMemo, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import ZodiacWheel from '@/components/ZodiacWheel'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/contexts/ProfileContext'
import { getSunSign, getPlanetSigns, type PlanetRow } from '@/lib/astrology'
import { generatePlanetInterpretation } from '@/lib/gemini'
import { cacheGet, cacheSet } from '@/lib/storage'
import { colors, elementColors } from '@/constants/theme'

const DOB_RE = /^\d{4}-\d{1,2}-\d{1,2}$/

function parseDob(text: string): Date | null {
  if (!DOB_RE.test(text.trim())) return null
  const d = new Date(text.trim() + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

export default function ChartScreen() {
  const insets = useSafeAreaInsets()
  const { profile, setProfile } = useProfile()

  const [name, setName] = useState(profile?.name ?? '')
  const [dobText, setDobText] = useState(profile?.dob ? profile.dob.slice(0, 10) : '')
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<PlanetRow | null>(null)
  const [interpretation, setInterpretation] = useState('')
  const [interpLoading, setInterpLoading] = useState(false)

  const planets = useMemo<PlanetRow[]>(
    () => (profile?.dob ? getPlanetSigns(new Date(profile.dob)) : []),
    [profile?.dob]
  )

  async function handleGenerate() {
    const dob = parseDob(dobText)
    if (!dob) {
      setError('Enter your birth date as YYYY-MM-DD')
      return
    }
    setError(null)
    const sign = getSunSign(dob)
    await setProfile({ name: name.trim(), dob: dob.toISOString(), sign: sign.name })
  }

  async function openPlanet(planet: PlanetRow) {
    setSelected(planet)
    setInterpretation('')
    const key = `planet_${planet.planet}_${planet.sign}`
    const cached = await cacheGet<string>(key)
    if (cached) {
      setInterpretation(cached)
      return
    }
    setInterpLoading(true)
    const text = await generatePlanetInterpretation(planet.planet, planet.sign)
    setInterpretation(text)
    setInterpLoading(false)
    cacheSet(key, text)
  }

  const header = (
    <View style={s.header}>
      <Text style={s.title}>🌌 Birth Chart</Text>

      <View style={s.inputRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={s.label}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
            style={s.input}
          />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={s.label}>BIRTH DATE</Text>
          <TextInput
            value={dobText}
            onChangeText={setDobText}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numbers-and-punctuation"
            style={s.input}
          />
        </View>
      </View>
      {error && <Text style={s.error}>{error}</Text>}

      <Pressable
        onPress={handleGenerate}
        style={({ pressed }) => [s.generateBtn, pressed && { opacity: 0.85 }]}
      >
        <Text style={s.generateText}>Generate Chart</Text>
      </Pressable>

      {profile?.sign ? (
        <>
          <View style={s.wheelWrap}>
            <ZodiacWheel activeSign={profile.sign} size={300} />
          </View>
          <Text style={s.sectionTitle}>PLANETS</Text>
        </>
      ) : (
        <Text style={s.emptyHint}>
          Enter your details above to reveal your birth chart.
        </Text>
      )}
    </View>
  )

  return (
    <View style={s.root}>
      <FlatList
        data={planets}
        keyExtractor={(item) => item.planet}
        ListHeaderComponent={header}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: insets.top + 14,
          paddingBottom: TAB_BAR_CLEARANCE + 20,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openPlanet(item)}
            style={({ pressed }) => [s.planetRow, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.planetEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.planetName}>{item.planet}</Text>
              <Text style={s.planetMeaning}>{item.meaning}</Text>
            </View>
            <View
              style={[
                s.signBadge,
                { backgroundColor: elementColors[item.element] + '33', borderColor: elementColors[item.element] },
              ]}
            >
              <Text style={[s.signBadgeText, { color: elementColors[item.element] }]}>
                {item.symbol} {item.sign}
              </Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Planet interpretation bottom sheet */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={s.modalContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          <View style={[s.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={s.handle} />
            {selected && (
              <>
                <View style={s.sheetHead}>
                  <Text style={s.sheetEmoji}>{selected.emoji}</Text>
                  <Text style={s.sheetTitle}>
                    {selected.planet} in {selected.sign} {selected.symbol}
                  </Text>
                </View>
                {interpLoading ? (
                  <ActivityIndicator color={colors.purple} style={{ marginVertical: 20 }} />
                ) : (
                  <Text style={s.sheetBody}>{interpretation}</Text>
                )}
                <Pressable
                  onPress={() => setSelected(null)}
                  style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={s.closeText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { gap: 14 },
  title: { fontSize: 24, fontWeight: '800', color: colors.gold, textAlign: 'center' },

  inputRow: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, color: colors.textSecondary },
  input: {
    height: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  error: { color: '#FF6B9D', fontSize: 12.5 },

  generateBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  wheelWrap: { alignItems: 'center', marginVertical: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 21,
  },

  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },
  planetEmoji: { fontSize: 24, width: 30, textAlign: 'center' },
  planetName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  planetMeaning: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  signBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  signBadgeText: { fontSize: 12, fontWeight: '700' },

  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  sheetEmoji: { fontSize: 28 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.gold, flex: 1 },
  sheetBody: { fontSize: 15, lineHeight: 23, color: colors.textPrimary },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
})
