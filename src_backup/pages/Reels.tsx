import { Heart, MessageCircle, Share2, Music, MoreHorizontal, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../components/MobileLayout';
import { CommentsModal } from '../components/CommentsModal';

const REELS_DATA = [
  {
    id: 1,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: 'travel_diaries',
    description: 'Beautiful sunset at the beach 🌅 #nature #sunset #travel',
    music: 'Original Audio - travel_diaries',
    likes: '1.2M',
    comments: '4,231',
    shares: '12K',
    avatar: 'https://i.pravatar.cc/150?img=32',
    isLiked: false
  },
  {
    id: 2,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    user: 'tech_guru',
    description: 'Testing the new drone! 🚁 #tech #drone #gadgets',
    music: 'Trending Song - Artist',
    likes: '890K',
    comments: '1,023',
    shares: '5K',
    avatar: 'https://i.pravatar.cc/150?img=11',
    isLiked: true
  },
  {
    id: 3,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    user: 'foodie_adventures',
    description: 'Making the perfect pasta 🍝 #food #cooking #pasta',
    music: 'Italian Cooking Music',
    likes: '2.5M',
    comments: '12K',
    shares: '45K',
    avatar: 'https://i.pravatar.cc/150?img=47',
    isLiked: false
  }
];

export default function Reels() {
  const [reels, setReels] = useState(REELS_DATA);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCommentReelId, setActiveCommentReelId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeReelIndex) {
      setActiveReelIndex(index);
    }
  };

  const toggleLike = (id: number) => {
    setReels(reels.map(reel => 
      reel.id === id ? { ...reel, isLiked: !reel.isLiked } : reel
    ));
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full bg-black text-white overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative"
    >
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 pt-12 z-20 flex justify-between items-center pointer-events-none">
        <h1 className="text-xl font-bold drop-shadow-md">Reels</h1>
        <div className="w-6 h-6" /> {/* Spacer */}
      </div>

      {reels.map((reel, index) => (
        <div key={reel.id} className="w-full h-full snap-start relative bg-black flex-shrink-0">
          {/* Video Player */}
          <VideoPlayer src={reel.video} isActive={index === activeReelIndex} />

          {/* Right Actions */}
          <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                <img src={reel.avatar} alt={reel.user} className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>

            <button onClick={() => toggleLike(reel.id)} className="flex flex-col items-center gap-1 group">
              <Heart className={cn("w-7 h-7 transition-colors drop-shadow-md", reel.isLiked ? "text-red-500 fill-red-500" : "text-white")} />
              <span className="text-xs font-medium drop-shadow-md">{reel.likes}</span>
            </button>

            <button onClick={() => setActiveCommentReelId(reel.id)} className="flex flex-col items-center gap-1 group">
              <MessageCircle className="w-7 h-7 text-white drop-shadow-md" />
              <span className="text-xs font-medium drop-shadow-md">{reel.comments}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <Share2 className="w-7 h-7 text-white drop-shadow-md" />
              <span className="text-xs font-medium drop-shadow-md">{reel.shares}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <MoreHorizontal className="w-7 h-7 text-white drop-shadow-md" />
            </button>

            <div className="w-10 h-10 rounded-md border-2 border-white overflow-hidden mt-2 animate-spin-slow">
              <img src={reel.avatar} alt="Audio" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute left-4 bottom-6 right-20 z-10">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[15px] font-semibold drop-shadow-md">{reel.user}</h3>
              <button className="px-2 py-0.5 border border-white rounded-md text-xs font-medium drop-shadow-md">Follow</button>
            </div>
            <p className="text-[14px] mb-3 leading-snug drop-shadow-md line-clamp-2">
              {reel.description}
            </p>
            
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full py-1 px-3 w-fit">
              <Music className="w-3.5 h-3.5" />
              <span className="text-xs font-medium truncate max-w-[150px] marquee">{reel.music}</span>
            </div>
          </div>
        </div>
      ))}

      <CommentsModal 
        isOpen={activeCommentReelId !== null} 
        onClose={() => setActiveCommentReelId(null)} 
      />
    </div>
  );
}

function VideoPlayer({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(e => console.log("Autoplay prevented:", e));
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full h-full relative" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={false}
      />
      {/* Gradient overlays for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
      
      {/* Play/Pause indicator (optional, can be added if needed) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
          </div>
        </div>
      )}
    </div>
  );
}
