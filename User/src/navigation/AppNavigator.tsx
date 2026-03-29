import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Home, Search, Clapperboard, MessageCircle, User } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import ReelsScreen from '../screens/ReelsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import CreateScreen from '../screens/CreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import StoryViewerScreen from '../screens/StoryViewerScreen';
import UserSearchScreen from '../screens/UserSearchScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ChatInfoScreen from '../screens/ChatInfoScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreateStoryScreen from '../screens/CreateStoryScreen';
import LikesHistoryScreen from '../screens/LikesHistoryScreen';
import CommentsHistoryScreen from '../screens/CommentsHistoryScreen';
import IncomingCallModal from '../components/IncomingCallModal';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  ChatDetail: { id: string; targetUserId?: number };
  VideoCall: { targetUserId: number; targetName: string; targetAvatar: string; callType: 'voice' | 'video'; conversationId: number; isIncoming: boolean; callerId?: number };
  Create: undefined;
  EditProfile: undefined;
  Connections: { tab?: string };
  ActivityHistory: undefined;
  Settings: undefined;
  StoryViewer: { userId: number };
  AIChat: undefined;
  OtpVerify: { email: string };
  UserSearch: undefined;
  UserProfile: { userId: number; username: string; avatar: string; isOnline: boolean; email?: string };
  ChatInfo: { name: string; avatar: string; isOnline: boolean; targetUserId: number };
  PostDetail: { post: any };
  CreateStory: undefined;
  LikesHistory: undefined;
  CommentsHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        sceneStyle: { backgroundColor: '#000' },
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 65 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: false,
        tabBarIndicatorStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, focused }: any) => (
            <Home size={26} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'none'} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }: any) => (
            <Search size={26} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarIcon: ({ color, focused }: any) => (
            <Clapperboard size={26} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'none'} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, focused }: any) => (
            <MessageCircle size={26} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'none'} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }: any) => (
            <User size={26} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'none'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#000' } }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'none',
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="VideoCall" component={VideoCallScreen} />
        <Stack.Screen name="Create" component={CreateScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Connections" component={ConnectionsScreen} />
        <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="StoryViewer" component={StoryViewerScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="AIChat" component={AIChatScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="UserSearch" component={UserSearchScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="ChatInfo" component={ChatInfoScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="CreateStory" component={CreateStoryScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="LikesHistory" component={LikesHistoryScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="CommentsHistory" component={CommentsHistoryScreen} options={{ animation: 'none' }} />
      </Stack.Navigator>
      <IncomingCallModal />
    </NavigationContainer>
  );
}
