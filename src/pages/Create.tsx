import { X, Music, RefreshCw, Zap, Clock, Wand2, ChevronDown, Image as ImageIcon, Type, Infinity, LayoutGrid, Hand, Layers, Camera as CameraIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../components/MobileLayout';

type TabType = 'Post' | 'Video' | 'Story' | 'Live';

export default function Create() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('Video');

  const renderTabSelector = () => (
    <div className="flex gap-8 overflow-x-auto scrollbar-hide px-4 w-full justify-center items-center h-12">
      {(['Post', 'Video', 'Story', 'Live'] as TabType[]).map((tab) => (
        <span 
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "text-[15px] cursor-pointer transition-colors relative whitespace-nowrap",
            activeTab === tab 
              ? "text-white font-bold drop-shadow-md after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full" 
              : "text-gray-400 font-medium hover:text-white"
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );

  if (activeTab === 'Post') {
    // Mock gallery images
    const galleryImages = Array.from({ length: 24 }).map((_, i) => `https://picsum.photos/seed/${i + 100}/400/400`);

    return (
      <div className="w-full h-full bg-black relative text-white flex flex-col font-sans">
        {/* Top Bar */}
        <div className="pt-12 pb-3 px-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-7 h-7" />
            </button>
            <h1 className="text-[17px] font-semibold">New Post</h1>
          </div>
          <button className="text-blue-500 font-semibold text-[16px] hover:text-blue-400 transition-colors">Next</button>
        </div>

        {/* Preview Area */}
        <div className="w-full aspect-square bg-gray-900 shrink-0">
          <img src="https://picsum.photos/seed/100/800/800" alt="Preview" className="w-full h-full object-cover" />
        </div>

        {/* Gallery Controls */}
        <div className="h-12 px-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="text-[15px] font-semibold group-hover:text-gray-300 transition-colors">Recents</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
              <Layers className="w-4 h-4 text-white" />
            </button>
            <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
              <CameraIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-[1px] bg-black scrollbar-hide">
          {galleryImages.map((img, i) => (
            <div key={i} className="aspect-square bg-gray-800 cursor-pointer relative group">
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>

        {/* Bottom Tabs */}
        <div className="bg-black pt-2 pb-[calc(env(safe-area-inset-bottom,32px)+24px)] shrink-0 rounded-t-3xl border-t border-white/10">
          {renderTabSelector()}
        </div>
      </div>
    );
  }

  // Camera UI (Video, Story, Live)
  return (
    <div className="w-full h-full bg-black relative text-white overflow-hidden font-sans flex flex-col">
      {/* Camera Viewfinder Mock */}
      <div className="absolute inset-0 z-0 rounded-b-3xl overflow-hidden">
        <img
          src={activeTab === 'Story' 
            ? "https://images.unsplash.com/photo-1611162618479-ee4d1e02548c?q=80&w=1000&auto=format&fit=crop" 
            : "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000&auto=format&fit=crop"}
          alt="Camera view"
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* Top Bar */}
      <div className="pt-12 px-4 flex justify-between items-start z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/20 rounded-full transition-colors">
          <X className="w-7 h-7 text-white drop-shadow-md" />
        </button>
        {activeTab !== 'Live' && (
          <button className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2 hover:bg-black/40 transition-colors border border-white/10">
            <Music className="w-4 h-4 text-white" />
            <span className="text-[15px] font-semibold">Add Sound</span>
          </button>
        )}
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Right Sidebar Tools */}
      <div className="absolute top-28 right-4 flex flex-col gap-6 items-center z-10">
        {activeTab === 'Story' ? (
          <>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Type className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Create</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Boomerang</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Layout</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Hand className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Hands-free</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Flip</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Speed</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Timer</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium drop-shadow-md">Filters</span>
            </div>
          </>
        )}
        <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors">
          <ChevronDown className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex-1" /> {/* Spacer to push controls to bottom */}

      {/* Bottom Controls */}
      <div className="pb-[calc(env(safe-area-inset-bottom,32px)+24px)] pt-10 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex flex-col items-center shrink-0">
        
        {/* Record Row */}
        <div className="flex items-center justify-between w-full px-10 mb-6">
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/20 overflow-hidden group-hover:border-white/40 transition-colors flex items-center justify-center backdrop-blur-sm">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-medium drop-shadow-md">Upload</span>
          </div>

          {/* Record Button */}
          <div className={cn(
            "w-[84px] h-[84px] rounded-full p-1.5 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform",
            activeTab === 'Video' || activeTab === 'Live' ? "border-[4px] border-[#FF3B30]/80" : "border-[4px] border-white/80"
          )}>
            <div className={cn(
              "w-full h-full rounded-full",
              activeTab === 'Video' || activeTab === 'Live' 
                ? "bg-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.5)]" 
                : "bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            )}></div>
          </div>

          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-11 h-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors backdrop-blur-sm">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-medium drop-shadow-md">Effects</span>
          </div>
        </div>

        {/* Type selector */}
        {renderTabSelector()}
      </div>
    </div>
  );
}
