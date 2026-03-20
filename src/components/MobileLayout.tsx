import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Clapperboard, MessageCircle, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideBottomNav = location.pathname.includes('/call') || location.pathname.includes('/chats/') || location.pathname.includes('/create') || location.pathname.includes('/edit-profile') || location.pathname.includes('/story');

  const navItems = [
    { icon: Home, path: '/feed', label: 'Home' },
    { icon: Search, path: '/search', label: 'Search' },
    { icon: Clapperboard, path: '/reels', label: 'Reels' },
    { icon: MessageCircle, path: '/chats', label: 'Messages' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-sans">
      <div id="mobile-layout-container" className="w-full max-w-[400px] h-[100dvh] bg-black relative overflow-hidden shadow-2xl sm:rounded-[40px] sm:h-[850px] sm:border-[8px] sm:border-gray-800 flex flex-col">
        {/* Status Bar Mock */}
        <div className="absolute top-0 w-full h-12 justify-between items-center px-6 z-50 pointer-events-none hidden sm:flex">
          <span className="text-[15px] font-semibold tracking-tight text-white drop-shadow-md">9:41</span>
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9.5H3V11.5H1V9.5ZM5 7.5H7V11.5H5V7.5ZM9 5.5H11V11.5H9V5.5ZM13 3.5H15V11.5H13V3.5ZM17 1.5H19V11.5H17V1.5Z" fill="white"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C4.8 0 1.8 1.4 0 3.6L8 12L16 3.6C14.2 1.4 11.2 0 8 0Z" fill="white"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white"/>
              <rect x="2" y="2" width="18" height="8" rx="2" fill="white"/>
              <path d="M23 4V8" stroke="white" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        {!hideBottomNav && (
          <div className="bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-white/10 flex justify-around items-start pt-3 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] px-2 shrink-0 z-40">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                    isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <item.icon className={cn("w-[26px] h-[26px]", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        )}
        
        {/* Home Indicator Mock */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white rounded-full z-50 pointer-events-none opacity-80" />
      </div>
    </div>
  );
}
