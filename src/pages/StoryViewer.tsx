import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, MoreHorizontal, Heart, Send } from 'lucide-react';
import { cn } from '../components/MobileLayout';

const storiesData = [
  { id: 2, user: 'alex_chen', avatar: 'https://i.pravatar.cc/150?img=12', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop', time: '2h' },
  { id: 3, user: 'sarah.j', avatar: 'https://i.pravatar.cc/150?img=32', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop', time: '5h' },
  { id: 4, user: 'mike.travels', avatar: 'https://i.pravatar.cc/150?img=47', image: 'https://images.unsplash.com/photo-1506744626753-eda8151a7471?q=80&w=1000&auto=format&fit=crop', time: '8h' },
  { id: 5, user: 'emma_w', avatar: 'https://i.pravatar.cc/150?img=5', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', time: '12h' },
  { id: 6, user: 'david.dev', avatar: 'https://i.pravatar.cc/150?img=8', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop', time: '15h' },
];

export default function StoryViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const initialIndex = storiesData.findIndex(s => s.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const currentStory = storiesData[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentIndex < storiesData.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
            return 0;
          } else {
            navigate('/feed');
            return 100;
          }
        }
        return prev + 1; // 100 steps, let's say 5 seconds total -> 50ms per step
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, navigate]);

  const handleNext = () => {
    if (currentIndex < storiesData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setIsLiked(false);
    } else {
      navigate('/feed');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setIsLiked(false);
    } else {
      setProgress(0);
    }
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  if (!currentStory) return null;

  return (
    <div className="w-full h-full bg-black relative flex flex-col font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={currentStory.image} 
          alt="Story" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Top UI */}
      <div className="relative z-10 pt-12 px-4 flex flex-col gap-3">
        {/* Progress Bars */}
        <div className="flex gap-1 w-full">
          {storiesData.map((story, idx) => (
            <div key={story.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={currentStory.avatar} alt={currentStory.user} className="w-8 h-8 rounded-full border border-white/20" />
            <span className="text-white font-semibold text-[14px]">{currentStory.user}</span>
            <span className="text-white/60 text-[14px]">{currentStory.time}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white hover:opacity-70 transition-opacity">
              <MoreHorizontal className="w-6 h-6" />
            </button>
            <button onClick={() => navigate('/feed')} className="text-white hover:opacity-70 transition-opacity">
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Tap Areas for Navigation */}
      <div className="flex-1 relative z-10 flex">
        <div 
          className="w-1/3 h-full" 
          onClick={handlePrev}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        />
        <div 
          className="w-2/3 h-full" 
          onClick={handleNext}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        />
      </div>

      {/* Bottom UI */}
      <div className="relative z-10 p-4 pb-8 flex items-center gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder={`Gửi tin nhắn cho ${currentStory.user}`}
            className="w-full bg-transparent border border-white/40 rounded-full py-3 px-5 text-white placeholder:text-white/80 focus:outline-none focus:border-white text-[14px]"
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          />
        </div>
        <button onClick={() => setIsLiked(!isLiked)} className="text-white hover:scale-110 transition-transform">
          <Heart className={cn("w-7 h-7", isLiked && "fill-red-500 text-red-500")} />
        </button>
        <button className="text-white hover:scale-110 transition-transform">
          <Send className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
