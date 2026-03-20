import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';
import Feed from './pages/Feed';
import Search from './pages/Search';
import Create from './pages/Create';
import Reels from './pages/Reels';
import ChatList from './pages/ChatList';
import ChatDetail from './pages/ChatDetail';
import VideoCall from './pages/VideoCall';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Connections from './pages/Connections';
import ActivityHistory from './pages/ActivityHistory';
import Settings from './pages/Settings';
import StoryViewer from './pages/StoryViewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/search" element={<Search />} />
          <Route path="/create" element={<Create />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chats/:id" element={<ChatDetail />} />
          <Route path="/call/:id" element={<VideoCall />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/connections" element={<Connections />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/activity-history" element={<ActivityHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/story/:id" element={<StoryViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
