import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react';
import { cn } from '../components/MobileLayout';

const MOCK_FOLLOWERS = [
  { id: 1, username: 'sarah_j', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
  { id: 2, username: 'mike.dev', name: 'Mike Chen', avatar: 'https://i.pravatar.cc/150?img=8', isFollowing: false },
  { id: 3, username: 'emma_travels', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
  { id: 4, username: 'alex_photography', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=12', isFollowing: false },
  { id: 5, username: 'jessica.designs', name: 'Jessica Taylor', avatar: 'https://i.pravatar.cc/150?img=16', isFollowing: true },
  { id: 6, username: 'david_b', name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=33', isFollowing: false },
  { id: 7, username: 'lisa.music', name: 'Lisa Anderson', avatar: 'https://i.pravatar.cc/150?img=44', isFollowing: true },
  { id: 8, username: 'ryan_fitness', name: 'Ryan Martinez', avatar: 'https://i.pravatar.cc/150?img=55', isFollowing: false },
];

const MOCK_FOLLOWING = [
  { id: 1, username: 'tech_guru', name: 'Tech Insider', avatar: 'https://i.pravatar.cc/150?img=60', isFollowing: true },
  { id: 2, username: 'nature_shots', name: 'Nature Photography', avatar: 'https://i.pravatar.cc/150?img=61', isFollowing: true },
  { id: 3, username: 'sarah_j', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
  { id: 4, username: 'daily_quotes', name: 'Daily Inspiration', avatar: 'https://i.pravatar.cc/150?img=62', isFollowing: true },
  { id: 5, username: 'emma_travels', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
];

export default function Connections() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'following' ? 'following' : 'followers';
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const currentList = activeTab === 'followers' ? MOCK_FOLLOWERS : MOCK_FOLLOWING;
  const filteredList = currentList.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#121212] text-white font-sans flex flex-col">
      {/* Header */}
      <div className="pt-[calc(env(safe-area-inset-top,40px)+16px)] pb-3 px-4 flex items-center shrink-0 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold ml-4">alex_chen</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        <button 
          onClick={() => handleTabChange('followers')}
          className={cn(
            "flex-1 py-3.5 flex justify-center items-center transition-colors border-b-2 font-semibold text-[15px]",
            activeTab === 'followers' ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          1,14k Followers
        </button>
        <button 
          onClick={() => handleTabChange('following')}
          className={cn(
            "flex-1 py-3.5 flex justify-center items-center transition-colors border-b-2 font-semibold text-[15px]",
            activeTab === 'following' ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          63 Following
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#262626] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 text-[15px]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,20px)+80px)] scrollbar-hide">
        {filteredList.length > 0 ? (
          <div className="flex flex-col">
            {filteredList.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[14px]">{user.username}</span>
                    <span className="text-gray-400 text-[14px]">{user.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'followers' ? (
                    <button className="px-5 py-1.5 bg-[#262626] hover:bg-[#333] rounded-lg font-semibold text-[14px] transition-colors">
                      Remove
                    </button>
                  ) : (
                    <button className="px-5 py-1.5 bg-[#262626] hover:bg-[#333] rounded-lg font-semibold text-[14px] transition-colors">
                      Following
                    </button>
                  )}
                  <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
