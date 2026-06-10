import { Tabs } from 'expo-router'
import TabBar, { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { Text } from '@/components/ui/Text'
import { BG } from '@/lib/theme'

function TabEmoji({ emoji, size }: { emoji: string; size: number }) {
  return <Text style={{ fontSize: size * 0.92 }}>{emoji}</Text>
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ size }) => <TabEmoji emoji="✨" size={size} />,
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          tabBarLabel: 'Chart',
          tabBarIcon: ({ size }) => <TabEmoji emoji="🌌" size={size} />,
        }}
      />
      <Tabs.Screen
        name="compatibility"
        options={{
          tabBarLabel: 'Match',
          tabBarIcon: ({ size }) => <TabEmoji emoji="💫" size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ size }) => <TabEmoji emoji="🔮" size={size} />,
        }}
      />
    </Tabs>
  )
}
