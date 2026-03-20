import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/MobileLayout';
import { CommentsModal } from '../components/CommentsModal';
import { NotificationsModal } from '../components/NotificationsModal';

const stories = [
  { id: 1, user: 'Your Story', image: 'https://i.pravatar.cc/150?img=11', isUser: true, hasStory: false },
  { id: 2, user: 'alex_chen', image: 'https://i.pravatar.cc/150?img=12', hasStory: true },
  { id: 3, user: 'sarah.j', image: 'https://i.pravatar.cc/150?img=32', hasStory: true },
  { id: 4, user: 'mike.travels', image: 'https://i.pravatar.cc/150?img=47', hasStory: true },
  { id: 5, user: 'emma_w', image: 'https://i.pravatar.cc/150?img=5', hasStory: true },
  { id: 6, user: 'david.dev', image: 'https://i.pravatar.cc/150?img=8', hasStory: true },
];

const initialPosts = [
  {
    id: 1,
    user: 'alex_chen',
    userImage: 'https://i.pravatar.cc/150?img=12',
    location: 'Seattle, Washington',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop',
    likes: 1234,
    caption: 'Exploring the beautiful Pacific Northwest! 🌲✨',
    comments: 42,
    time: '2 HOURS AGO',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 2,
    user: 'sarah.j',
    userImage: 'https://i.pravatar.cc/150?img=32',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop',
    likes: 892,
    caption: 'Café hopping in Le Marais ☕️🥐',
    comments: 15,
    time: '5 HOURS AGO',
    isLiked: true,
    isSaved: true,
  }
];

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleSave = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isSaved: !post.isSaved } : post
    ));
  };

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto scrollbar-hide pb-20">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-12 pb-3 border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-sm z-20">
        <h1 className="text-2xl font-semibold font-serif italic tracking-tight">ConnectDucAnh</h1>
        <div className="flex gap-5 items-center">
          <button onClick={() => setIsNotificationsOpen(true)} className="relative">
            <Bell className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              5
            </div>
          </button>
          <button onClick={() => navigate('/chats')} className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </div>
          </button>
        </div>
      </div>

      {/* Stories */}
      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-800">
        {stories.map(story => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-1 shrink-0"
            onClick={() => story.isUser ? navigate('/create') : navigate(`/story/${story.id}`)}
          >
            <div className={cn(
              "p-[2px] rounded-full",
              story.hasStory ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600" : "bg-transparent",
              story.isUser && "cursor-pointer"
            )}>
              <div className="bg-black p-[2px] rounded-full relative">
                <img src={story.image} alt={story.user} className="w-[68px] h-[68px] rounded-full object-cover" />
                {story.isUser && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-black">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-300 truncate w-[72px] text-center">
              {story.user}
            </span>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="flex flex-col">
        {posts.map(post => (
          <div key={post.id} className="pb-4 border-b border-gray-800">
            {/* Post Header */}
            <div className="flex justify-between items-center px-3 py-3">
              <div className="flex items-center gap-2">
                <img src={post.userImage} alt={post.user} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold">{post.user}</span>
                  {post.location && <span className="text-[11px] text-gray-400">{post.location}</span>}
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-300" />
            </div>
            
            {/* Post Image */}
            <img src={post.image} alt="Post content" className="w-full aspect-square object-cover" />
            
            {/* Post Actions */}
            <div className="flex justify-between items-center px-3 py-3">
              <div className="flex gap-4 items-center">
                <button onClick={() => toggleLike(post.id)}>
                  <Heart className={cn("w-6 h-6 transition-colors", post.isLiked ? "text-red-500 fill-red-500" : "text-white")} />
                </button>
                <button onClick={() => setActiveCommentPostId(post.id)}>
                  <MessageCircle className="w-6 h-6 text-white" />
                </button>
                <button>
                  <Send className="w-6 h-6 text-white" />
                </button>
              </div>
              <button onClick={() => toggleSave(post.id)}>
                <Bookmark className={cn("w-6 h-6 transition-colors", post.isSaved ? "text-white fill-white" : "text-white")} />
              </button>
            </div>
            
            {/* Likes & Caption */}
            <div className="px-3">
              <p className="text-[13px] font-semibold mb-1">{post.likes.toLocaleString()} likes</p>
              <p className="text-[13px] leading-tight">
                <span className="font-semibold mr-2">{post.user}</span>
                {post.caption}
              </p>
              <p 
                className="text-[13px] text-gray-400 mt-1.5 cursor-pointer"
                onClick={() => setActiveCommentPostId(post.id)}
              >
                View all {post.comments} comments
              </p>
              <p className="text-[10px] text-gray-500 mt-1.5">{post.time}</p>
            </div>
          </div>
        ))}
      </div>

      <CommentsModal 
        isOpen={activeCommentPostId !== null} 
        onClose={() => setActiveCommentPostId(null)} 
      />

      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}
