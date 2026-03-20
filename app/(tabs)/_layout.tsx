import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(26,26,26,0.95)',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 0.5,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'film' : 'film-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat-list"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
