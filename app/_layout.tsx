import React from 'react'
import { View, Platform } from 'react-native'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter'
import { ThemeProvider, DarkTheme } from '@react-navigation/native'
import { Text } from '@/components/ui/Text'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { BG } from '@/lib/theme'

// ─── Error boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center' }}>
            Please close and reopen the app.
          </Text>
        </View>
      )
    }
    return this.props.children
  }
}

const customDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: BG },
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: BG }} />
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
          <BottomSheetModalProvider>
            <StatusBar
              style="light"
              translucent={Platform.OS === 'android'}
              backgroundColor={Platform.OS === 'android' ? BG : undefined}
            />
            <ThemeProvider value={customDarkTheme}>
              <ProfileProvider>
                <View style={{ flex: 1, backgroundColor: BG }}>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'fade',
                      contentStyle: { backgroundColor: BG },
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                </View>
              </ProfileProvider>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
