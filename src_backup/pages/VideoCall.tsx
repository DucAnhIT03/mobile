import { MicOff, RefreshCcw, PhoneOff, VideoOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VideoCall() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-black relative text-white font-sans overflow-hidden">
      {/* Main Video (Other Person) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" 
          alt="Video call" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
      </div>

      {/* PiP (Self) */}
      <div className="absolute top-14 left-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl z-20">
        <img 
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" 
          alt="Self" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Timer */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full z-20">
        <span className="text-sm font-medium tracking-wider">05:24</span>
      </div>

      {/* Right Actions removed */}

      {/* Bottom User Info */}
      <div className="absolute bottom-48 left-6 z-20">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold drop-shadow-md">Alex Chen</h2>
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-white/90 drop-shadow-md">
          @alexchen | #travel #friends
        </p>
      </div>

      {/* Controls Panel */}
      <div className="absolute bottom-8 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-[32px] p-6 flex items-center justify-between z-30 shadow-2xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
        
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <MicOff className="w-6 h-6 text-gray-800" />
          </div>
          <span className="text-xs font-semibold text-gray-800">Mute</span>
        </button>

        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <RefreshCcw className="w-6 h-6 text-gray-800" />
          </div>
          <span className="text-xs font-semibold text-gray-800">Flip Camera</span>
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-600 transition-colors">
            <PhoneOff className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-800">End Call</span>
        </button>

        <button className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <VideoOff className="w-6 h-6 text-gray-800" />
          </div>
          <span className="text-xs font-semibold text-gray-800">Video Off</span>
        </button>
      </div>
    </div>
  );
}
