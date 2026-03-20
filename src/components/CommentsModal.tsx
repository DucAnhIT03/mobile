import { X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './MobileLayout';

interface Comment {
  id: number;
  user: string;
  userImage: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

const initialComments: Comment[] = [
  { id: 1, user: 'sarah.j', userImage: 'https://i.pravatar.cc/150?img=32', text: 'This is so beautiful! 😍', time: '2h', likes: 12, isLiked: false },
  { id: 2, user: 'mike.travels', userImage: 'https://i.pravatar.cc/150?img=47', text: 'Wow, amazing shot!', time: '1h', likes: 5, isLiked: true },
  { id: 3, user: 'emma_w', userImage: 'https://i.pravatar.cc/150?img=5', text: 'Need to go there ASAP 🔥', time: '45m', likes: 0, isLiked: false },
  { id: 4, user: 'david.dev', userImage: 'https://i.pravatar.cc/150?img=8', text: 'What camera did you use?', time: '10m', likes: 2, isLiked: false },
];

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsModal({ isOpen, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById('mobile-layout-container'));
  }, []);

  if (!isOpen || !container) return null;

  const toggleLike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    }));
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      user: 'alex_chen',
      userImage: 'https://i.pravatar.cc/150?img=12',
      text: newComment,
      time: 'Just now',
      likes: 0,
      isLiked: false,
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-[#1A1A1A] rounded-t-2xl z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="w-6" /> {/* Spacer */}
          <h2 className="text-base font-bold text-white">Comments</h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img src={comment.userImage} alt={comment.user} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[13px] text-white mr-2">{comment.user}</span>
                    <span className="text-[13px] text-gray-200">{comment.text}</span>
                  </div>
                  <button onClick={() => toggleLike(comment.id)} className="mt-1 shrink-0">
                    <Heart className={cn("w-3.5 h-3.5", comment.isLiked ? "text-red-500 fill-red-500" : "text-gray-400")} />
                  </button>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-500 font-medium">
                  <span>{comment.time}</span>
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                  <button className="text-gray-400">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#1A1A1A] pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?img=12" alt="You" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-[#2A2A2A] text-white text-[14px] rounded-full py-2.5 pl-4 pr-12 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              {newComment.trim() && (
                <button 
                  onClick={handlePost}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 font-semibold text-[14px]"
                >
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    container
  );
}
