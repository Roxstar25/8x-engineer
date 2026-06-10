import { Modal, View, Pressable, StyleSheet, ScrollView } from 'react-native'
import { Text } from '@/components/ui/Text'
import { ZODIAC } from '@/lib/astrology'
import { colors, elementColors } from '@/constants/theme'

interface SignPickerModalProps {
  visible: boolean
  title?: string
  selected?: string
  onSelect: (signName: string) => void
  onClose: () => void
}

export default function SignPickerModal({
  visible,
  title = 'Choose Your Sign',
  selected,
  onSelect,
  onClose,
}: SignPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
            {ZODIAC.map((sign) => {
              const isSel = selected === sign.name
              return (
                <Pressable
                  key={sign.name}
                  onPress={() => {
                    onSelect(sign.name)
                    onClose()
                  }}
                  style={({ pressed }) => [
                    s.chip,
                    isSel && s.chipActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[s.glyph, { color: elementColors[sign.element] }]}>
                    {sign.symbol}
                  </Text>
                  <Text style={[s.name, isSel && s.nameActive]}>{sign.name}</Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <Pressable onPress={onClose} style={({ pressed }) => [s.cancel, pressed && { opacity: 0.6 }]}>
            <Text style={s.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 28,
    maxHeight: '78%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  title: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  chip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(155,109,255,0.18)',
    borderColor: colors.purple,
  },
  glyph: { fontSize: 22 },
  name: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  nameActive: { color: colors.gold },
  cancel: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
})
