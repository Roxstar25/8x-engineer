import { useEffect, useRef, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { useProfile } from '@/contexts/ProfileContext'
import { chatWithAstra, type ChatMessage } from '@/lib/gemini'
import { loadChatHistory, saveChatHistory, clearChatHistory } from '@/lib/storage'
import { colors } from '@/constants/theme'

const QUICK_CHIPS = ["What's my destiny?", 'Love advice', 'Career path', "Today's energy"]

let idCounter = 0
function newId() {
  idCounter += 1
  return `${Date.now()}_${idCounter}`
}

// ─── Typing indicator (3 bouncing dots) ──────────────────────────────────────

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]

  useEffect(() => {
    const animations = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: -5, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.delay((dots.length - i) * 160),
        ])
      )
    )
    animations.forEach((a) => a.start())
    return () => animations.forEach((a) => a.stop())
  }, [])

  return (
    <View style={s.astraRow}>
      <View style={s.avatar}>
        <Text style={s.avatarGlyph}>✦</Text>
      </View>
      <View style={[s.bubble, s.astraBubble, s.typingBubble]}>
        {dots.map((d, i) => (
          <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
    </View>
  )
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useProfile()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList<ChatMessage>>(null)

  const userSign = profile?.sign || 'a curious seeker'

  useEffect(() => {
    loadChatHistory().then(setMessages)
  }, [])

  function scrollToEnd() {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput('')

    const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed, createdAt: Date.now() }
    const next = [...messages, userMsg]
    setMessages(next)
    saveChatHistory(next)
    scrollToEnd()

    setSending(true)
    const reply = await chatWithAstra(next, userSign)
    const astraMsg: ChatMessage = { id: newId(), role: 'astra', text: reply, createdAt: Date.now() }
    const withReply = [...next, astraMsg]
    setMessages(withReply)
    saveChatHistory(withReply)
    setSending(false)
    scrollToEnd()
  }

  async function handleClear() {
    setMessages([])
    await clearChatHistory()
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.title}>Astra 🔮</Text>
        <Pressable onPress={handleClear} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Text style={s.clear}>Clear</Text>
        </Pressable>
      </View>

      {/* Quick chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
        style={s.chipsScroll}
      >
        {QUICK_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => send(chip)}
            style={({ pressed }) => [s.chip, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToEnd}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyGlyph}>🌙</Text>
            <Text style={s.emptyText}>Ask Astra anything about your stars.</Text>
          </View>
        }
        ListFooterComponent={sending ? <TypingDots /> : null}
        renderItem={({ item }) =>
          item.role === 'user' ? (
            <View style={[s.bubble, s.userBubble]}>
              <Text style={s.userText}>{item.text}</Text>
            </View>
          ) : (
            <View style={s.astraRow}>
              <View style={s.avatar}>
                <Text style={s.avatarGlyph}>✦</Text>
              </View>
              <View style={[s.bubble, s.astraBubble]}>
                <Text style={s.astraText}>{item.text}</Text>
              </View>
            </View>
          )
        }
      />

      {/* Input bar — lifted above the floating tab bar */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 10 }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message Astra..."
          placeholderTextColor={colors.textSecondary}
          style={s.input}
          multiline
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(input)}
          disabled={!input.trim() || sending}
          style={({ pressed }) => [
            s.sendBtn,
            (!input.trim() || sending) && { opacity: 0.4 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={s.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.gold },
  clear: { fontSize: 14, color: colors.purple, fontWeight: '600' },

  chipsScroll: { maxHeight: 46, flexGrow: 0 },
  chipsRow: { paddingHorizontal: 18, gap: 8, paddingBottom: 8 },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyGlyph: { fontSize: 48 },
  emptyText: { color: colors.textSecondary, fontSize: 14.5 },

  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.purple, borderBottomRightRadius: 6 },
  userText: { color: '#fff', fontSize: 14.5, lineHeight: 20 },

  astraRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, alignSelf: 'flex-start', maxWidth: '88%' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(155,109,255,0.18)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: { color: colors.gold, fontSize: 14 },
  astraBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  astraText: { color: colors.textPrimary, fontSize: 14.5, lineHeight: 20 },

  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textSecondary },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.textPrimary,
    fontSize: 14.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 16 },
})
