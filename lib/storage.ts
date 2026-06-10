import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ChatMessage } from '@/lib/gemini'

export interface UserProfile {
  name: string
  dob: string // ISO date string
  sign: string
}

const KEYS = {
  profile: 'astra:profile',
  chat: 'astra:chatHistory',
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile))
  } catch (e) {
    console.warn('[storage] saveUserProfile failed:', e)
  }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.profile)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch (e) {
    console.warn('[storage] loadUserProfile failed:', e)
    return null
  }
}

// ─── Chat history ───────────────────────────────────────────────────────────

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.chat, JSON.stringify(messages))
  } catch (e) {
    console.warn('[storage] saveChatHistory failed:', e)
  }
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.chat)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch (e) {
    console.warn('[storage] loadChatHistory failed:', e)
    return []
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.chat)
  } catch (e) {
    console.warn('[storage] clearChatHistory failed:', e)
  }
}

// ─── Generic cache (used for horoscope caching by key) ────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`astra:cache:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`astra:cache:${key}`, JSON.stringify(value))
  } catch (e) {
    console.warn('[storage] cacheSet failed:', e)
  }
}
