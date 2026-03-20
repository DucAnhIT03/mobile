import { Plus, Play, Grid3x3, Clapperboard, Contact, Layers, Menu, Clock, Settings, LogOut, X, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../components/MobileLayout';

type TabType = 'posts' | 'reels' | 'tagged';

const postsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop', isCarousel: true },
  { id: 2, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 3, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', isCarousel: true },
  { id: 4, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 5, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 6, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop', isCarousel: true },
];

const reelsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', views: '15.4K' },
  { id: 2, image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=400&auto=format&fit=crop', views: '1.2M' },
  { id: 3, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', views: '324K' },
  { id: 4, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop', views: '12K' },
];

const taggedData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 2, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', isCarousel: true },
];

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    navigate('/login');
  };

  return (
    <div className="w-full h-full bg-[#121212] text-white font-sans flex flex-col pt-12 relative">
      {/* Top Bar with Menu */}
      <div className="px-4 flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Alex Chen</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="px-4 pb-6 flex items-center justify-between">
        <div className="relative">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600">
            <div className="w-full h-full rounded-full border-4 border-[#121212] overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 flex justify-around ml-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">49</span>
            <span className="text-[13px] text-gray-400">Posts</span>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/profile/connections?tab=followers')}
          >
            <span className="text-xl font-bold">1,14k</span>
            <span className="text-[13px] text-gray-400">Followers</span>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/profile/connections?tab=following')}
          >
            <span className="text-xl font-bold">63</span>
            <span className="text-[13px] text-gray-400">Following</span>
          </div>
        </div>
      </div>

      {/* Bio & Actions */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold mb-1">Alex Chen</h2>
        <p className="text-[15px] text-gray-300 mb-4">
          Digital Creator | Sharing life's moments | Seattle ðŸ“ 
        </p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/edit-profile')}
            className="flex-1 py-2 bg-[#2A2A2A] hover:bg-[#333] transition-colors rounded-xl font-semibold text-[15px] border border-gray-700"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="flex-1 py-2 bg-[#2A2A2A] hover:bg-[#333] transition-colors rounded-xl font-semibold text-[15px] border border-gray-700"
          >
            Create Content
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-0.5">
        <button 
          onClick={() => setActiveTab('posts')}
          className={cn(
            "flex-1 py-3 flex justify-center items-center transition-colors border-b-2",
            activeTab === 'posts' ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          <Grid3x3 className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('reels')}
          className={cn(
            "flex-1 py-3 flex justify-center items-center transition-colors border-b-2",
            activeTab === 'reels' ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          <Clapperboard className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('tagged')}
          className={cn(
            "flex-1 py-3 flex justify-center items-center transition-colors border-b-2",
            activeTab === 'tagged' ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          <Contact className="w-6 h-6" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5">
            {postsData.map((post) => (
              <div key={post.id} className="aspect-square relative group cursor-pointer">
                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {post.isCarousel && (
                  <div className="absolute top-2 right-2">
                    <Layers className="w-4 h-4 text-white drop-shadow-md" fill="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-0.5">
            {reelsData.map((reel) => (
              <div key={reel.id} className="aspect-[9/16] relative group cursor-pointer">
                <img src={reel.image} alt="Reel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <Play className="w-3 h-3 text-white" fill="white" />
                  <span className="text-xs font-semibold text-white drop-shadow-md">{reel.views}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="grid grid-cols-3 gap-0.5">
            {taggedData.map((post) => (
              <div key={post.id} className="aspect-square relative group cursor-pointer">
                <img src={post.image} alt="Tagged Post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {post.isCarousel && (
                  <div className="absolute top-2 right-2">
                    <Layers className="w-4 h-4 text-white drop-shadow-md" fill="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Menu Bottom Sheet */}
      {showMenu && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setShowMenu(false)} />
          <div className="bg-[#121212] w-full rounded-t-3xl relative flex flex-col animate-in slide-in-from-bottom-full duration-300 pb-[calc(env(safe-area-inset-bottom,20px)+20px)]">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>
            
            <div className="flex flex-col px-4 pt-4 space-y-2">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate('/activity-history');
                }}
                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors w-full text-left"
              >
                <Clock className="w-6 h-6 text-white" />
                <span className="text-lg font-medium text-white">Lịch sử hoạt động</span>
              </button>
              
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors w-full text-left"
              >
                <Settings className="w-6 h-6 text-white" />
                <span className="text-lg font-medium text-white">Cài đặt và quyền riêng tư</span>
              </button>
              
              <div className="h-px bg-gray-800 my-2" />
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left group"
              >
                <LogOut className="w-6 h-6 text-red-500 group-hover:text-red-400" />
                <span className="text-lg font-medium text-red-500 group-hover:text-red-400">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
