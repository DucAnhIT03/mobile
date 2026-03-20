import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './MobileLayout';

interface Notification {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'suggestion';
  user: string;
  userImage: string;
  time?: string;
  content?: string;
  postImage?: string;
  subtitle?: string;
  isFollowing?: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, type: 'follow', user: 'jane_doe', userImage: 'https://i.pravatar.cc/150?img=1', time: '2h', isFollowing: false },
  { id: 2, type: 'like', user: 'mike.travels', userImage: 'https://i.pravatar.cc/150?img=47', time: '3h', postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=100' },
  { id: 3, type: 'comment', user: 'sarah.j', userImage: 'https://i.pravatar.cc/150?img=32', time: '5h', content: 'This is amazing! 🔥', postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=100' },
  { id: 4, type: 'suggestion', user: 'photography_daily', userImage: 'https://i.pravatar.cc/150?img=15', subtitle: 'Suggested for you', isFollowing: false },
  { id: 5, type: 'suggestion', user: 'travel_vibes', userImage: 'https://i.pravatar.cc/150?img=20', subtitle: 'Followed by sarah.j', isFollowing: false },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById('mobile-layout-container'));
  }, []);

  if (!isOpen || !container) return null;

  const toggleFollow = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isFollowing: !n.isFollowing } : n
    ));
  };

  return createPortal(
    <>
      <div className="absolute inset-0 bg-black/60 z-50 transition-opacity" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-[#1A1A1A] rounded-t-2xl z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="w-6" />
          <h2 className="text-base font-bold text-white">Notifications</h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-10">
          {/* Today Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Today</h3>
            <div className="space-y-4">
              {notifications.filter(n => n.type !== 'suggestion').map(notification => (
                <div key={notification.id} className="flex items-center gap-3">
                  <img src={notification.userImage} alt={notification.user} className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex-1 text-[13px]">
                    <span className="font-semibold text-white mr-1">{notification.user}</span>
                    {notification.type === 'follow' && <span className="text-gray-300">started following you.</span>}
                    {notification.type === 'like' && <span className="text-gray-300">liked your post.</span>}
                    {notification.type === 'comment' && <span className="text-gray-300">commented: {notification.content}</span>}
                    <span className="text-gray-500 ml-1">{notification.time}</span>
                  </div>
                  {notification.type === 'follow' ? (
                    <button 
                      onClick={() => toggleFollow(notification.id)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors",
                        notification.isFollowing ? "bg-[#363636] text-white" : "bg-blue-500 text-white"
                      )}
                    >
                      {notification.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  ) : (
                    <img src={notification.postImage} alt="Post" className="w-11 h-11 rounded-md object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-white mb-4">Suggested for you</h3>
            <div className="space-y-4">
              {notifications.filter(n => n.type === 'suggestion').map(notification => (
                <div key={notification.id} className="flex items-center gap-3">
                  <img src={notification.userImage} alt={notification.user} className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex-1 text-[13px]">
                    <div className="font-semibold text-white">{notification.user}</div>
                    <div className="text-gray-500">{notification.subtitle}</div>
                  </div>
                  <button 
                    onClick={() => toggleFollow(notification.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors",
                      notification.isFollowing ? "bg-[#363636] text-white" : "bg-blue-500 text-white"
                    )}
                  >
                    {notification.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    container
  );
}
