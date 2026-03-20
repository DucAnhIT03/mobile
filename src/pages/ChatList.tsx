import { Search, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const chats = [
  { id: 1, name: 'Alex Johnson', message: 'Just saw the new video!', time: '10:30 AM', unread: 2, avatar: 'https://i.pravatar.cc/150?img=11', online: true },
  { id: 2, name: 'Sarah Lee', message: 'Are you coming to the...', time: 'Yesterday', unread: 5, avatar: 'https://i.pravatar.cc/150?img=5', online: true },
  { id: 3, name: 'Sarah Lee', message: 'Are you coming to the...', time: 'Yesterday', unread: 5, avatar: 'https://i.pravatar.cc/150?img=8', online: false },
  { id: 4, name: 'Sarah Luna', message: 'Event details shared...', time: 'Mon', unread: 1, avatar: 'https://i.pravatar.cc/150?img=9', online: true },
  { id: 5, name: 'Community Group', message: 'Event details shared...', time: 'Mon', unread: 1, avatar: 'https://i.pravatar.cc/150?img=10', online: true },
  { id: 6, name: 'Comn Laby', message: 'Event details shared...', time: 'Mon', unread: 2, avatar: 'https://i.pravatar.cc/150?img=12', online: true },
  { id: 7, name: 'TikTok Trends', message: 'New viral sound...', time: 'Sun', unread: '9+', avatar: 'https://i.pravatar.cc/150?img=16', online: false },
];

export default function ChatList() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-[#121212] flex flex-col text-white">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between gap-3 sticky top-0 bg-[#121212] z-10">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats and messages"
            className="w-full pl-10 pr-4 py-2.5 bg-[#2A2A2A] border-none rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button className="w-11 h-11 bg-[#2A2A2A] rounded-2xl flex items-center justify-center shrink-0 hover:bg-[#333] transition-colors">
          <Edit className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => navigate(`/chats/${chat.id}`)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-[#1A1A1A] cursor-pointer transition-colors"
          >
            <div className="relative shrink-0">
              <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover border border-gray-800" />
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#121212] rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-[17px] font-semibold text-white truncate pr-2">{chat.name}</h3>
                <span className="text-xs text-gray-400 shrink-0">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[15px] text-gray-400 truncate pr-4">{chat.message}</p>
                {chat.unread && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
