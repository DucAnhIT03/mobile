import { ChevronLeft, Heart, MessageCircle, Tag, MessageSquare, Star, Trash2, Archive, Clock, Search, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActivityHistory() {
  const navigate = useNavigate();

  const interactionItems = [
    { id: 'likes', icon: Heart, label: 'Lượt thích', description: 'Xem, bỏ thích các bài viết, thước phim và bình luận.' },
    { id: 'comments', icon: MessageCircle, label: 'Bình luận', description: 'Xem, xóa bình luận của bạn.' },
    { id: 'tags', icon: Tag, label: 'Thẻ', description: 'Xem, ẩn hoặc xóa thẻ của bạn trên bài viết và bình luận.' },
    { id: 'story-replies', icon: MessageSquare, label: 'Phản hồi tin', description: 'Xem, xóa phản hồi tin của bạn.' },
    { id: 'reviews', icon: Star, label: 'Đánh giá', description: 'Xem, xóa đánh giá của bạn.' },
  ];

  const removedItems = [
    { id: 'recently-deleted', icon: Trash2, label: 'Đã xóa gần đây', description: 'Xem, khôi phục nội dung đã xóa.' },
    { id: 'archived', icon: Archive, label: 'Đã lưu trữ', description: 'Xem, khôi phục nội dung đã lưu trữ.' },
  ];

  const usageItems = [
    { id: 'time-spent', icon: Clock, label: 'Thời gian đã dùng', description: 'Quản lý thời gian bạn dùng ứng dụng.' },
    { id: 'search-history', icon: Search, label: 'Lịch sử tìm kiếm', description: 'Xem, xóa lịch sử tìm kiếm.' },
    { id: 'links-visited', icon: LinkIcon, label: 'Liên kết bạn đã truy cập', description: 'Xem các liên kết bạn đã truy cập gần đây.' },
  ];

  const renderItem = (item: any) => (
    <button 
      key={item.id}
      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5">
          <item.icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-[16px] font-semibold text-white">{item.label}</span>
          <span className="text-[13px] text-gray-400 mt-0.5">{item.description}</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </button>
  );

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center px-4 pb-4 pt-12 border-b border-white/10 sticky top-0 bg-[#121212]/95 z-10 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-semibold ml-4">Lịch sử hoạt động</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-1">Một nơi để quản lý hoạt động của bạn</h2>
          <p className="text-[14px] text-gray-400 mb-6">
            Chúng tôi đã thêm công cụ để bạn có thể xem xét và quản lý ảnh, video, tài khoản cũng như hoạt động của mình trên ConnectDucAnh.
          </p>
        </div>

        {/* Interactions */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold px-4 mb-2 text-white">Tương tác</h3>
          <div className="flex flex-col">
            {interactionItems.map(renderItem)}
          </div>
        </div>

        <div className="h-2 bg-black/50 w-full" />

        {/* Removed and Archived */}
        <div className="my-6">
          <h3 className="text-[15px] font-bold px-4 mb-2 text-white">Nội dung đã xóa và lưu trữ</h3>
          <div className="flex flex-col">
            {removedItems.map(renderItem)}
          </div>
        </div>

        <div className="h-2 bg-black/50 w-full" />

        {/* How you use the app */}
        <div className="my-6">
          <h3 className="text-[15px] font-bold px-4 mb-2 text-white">Cách bạn dùng ConnectDucAnh</h3>
          <div className="flex flex-col">
            {usageItems.map(renderItem)}
          </div>
        </div>
      </div>
    </div>
  );
}
