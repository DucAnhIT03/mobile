import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="chat-detail" />
        <Stack.Screen name="video-call" />
        <Stack.Screen name="create" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="connections" />
        <Stack.Screen name="activity-history" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="story-viewer" />
      </Stack>
    </>
  );
}
