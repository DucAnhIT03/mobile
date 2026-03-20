import { ChevronLeft, MoreHorizontal, Camera, Image as ImageIcon, Mic, Send, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState('');

  // Mock data based on the image
  const chat = {
    name: 'Alex Chen',
    handle: '@alex_chen',
    avatar: 'https://i.pravatar.cc/150?img=11',
    online: true,
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <div className="pt-12 pb-2 px-4 bg-black flex items-center justify-between border-b border-white/10 shrink-0 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        
        <div className="flex items-center gap-3 flex-1 ml-2">
          <div className="relative">
            <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            {chat.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">{chat.handle}</span>
            </div>
            <h2 className="text-[17px] font-bold text-white leading-tight">{chat.name}</h2>
            <span className="text-xs text-green-500 font-medium">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/call/${id}`)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
          <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col scrollbar-hide">
        
        {/* Received Message */}
        <div className="flex flex-col items-start max-w-[85%]">
          <div className="bg-[#262626] text-white px-4 py-3 rounded-2xl rounded-tl-sm text-[16px] leading-snug">
            Hey! Did you see that new video? It's hilarious!
          </div>
          <span className="text-xs text-gray-500 mt-1 ml-1">10:05 AM</span>
        </div>

        {/* Sent Message */}
        <div className="flex flex-col items-end self-end max-w-[85%]">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-[16px] leading-snug">
            Yeah, I saw it! Totally reminds me of that TikTok trend.
          </div>
          <div className="flex items-center gap-1 mt-1 mr-1">
            <span className="text-xs text-gray-500">10:06 AM</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Received Image Card */}
        <div className="flex flex-col items-start max-w-[85%]">
          <div className="bg-[#262626] p-2 rounded-2xl rounded-tl-sm">
            <div className="relative rounded-xl overflow-hidden mb-2 border border-white/5">
              <img src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop" alt="Shared image" className="w-[240px] h-[160px] object-cover" />
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full border border-black overflow-hidden">
                <img src={chat.avatar} alt="Sender" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 pb-1">
              <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-[13px] text-gray-300 font-medium">Liked by 45 people</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1 ml-1">10:07 AM</span>
        </div>

        {/* Sent Message */}
        <div className="flex flex-col items-end self-end max-w-[85%]">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-[16px] leading-snug">
            That's awesome! We should go there sometime. 😂
          </div>
          <div className="flex items-center gap-1 mt-1 mr-1">
            <span className="text-xs text-gray-500">10:08 AM</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Received Video Card */}
        <div className="flex flex-col items-start max-w-[85%] pb-4">
          <div className="bg-[#262626] p-2 rounded-2xl rounded-tl-sm w-[260px]">
            <div className="relative rounded-xl overflow-hidden bg-black h-[140px] flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="w-5 h-5 text-white ml-1" fill="white" />
              </div>
              {/* Fake progress bar */}
              <div className="absolute bottom-3 left-3 right-3 h-1 bg-white/30 rounded-full">
                <div className="w-1/3 h-full bg-white rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
              </div>
            </div>
            <div className="px-2 pb-1">
              <h3 className="text-[15px] font-bold text-white">New TikTok Share</h3>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1 ml-1">10:09 AM</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black px-3 py-3 pb-8 shrink-0 flex items-center gap-2 border-t border-white/10 w-full box-border">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#262626] text-white hover:bg-[#363636] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
        
        <div className="flex-1 min-w-0 bg-[#262626] rounded-full flex items-center px-3 py-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..." 
            className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-[15px] text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-3 ml-2 shrink-0 text-white">
            {message.trim().length > 0 ? (
              <button className="text-blue-500 hover:text-blue-400 transition-colors p-1">
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <>
                <Camera className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
                <ImageIcon className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
              </>
            )}
          </div>
        </div>

        {!message.trim().length && (
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#262626] text-white hover:bg-[#363636] transition-colors shrink-0">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
