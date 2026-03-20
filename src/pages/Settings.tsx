import { ChevronLeft, Search, UserCircle, Bookmark, Archive, Clock, Bell, Lock, Users, Ban, EyeOff, MessageCircle, AtSign, MessageSquare, Share2, Smartphone, Database, Shield, PlusCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const accountCenterItems = [
    { id: 'account-center', icon: UserCircle, label: 'Trung tâm tài khoản', description: 'Mật khẩu, bảo mật, thông tin cá nhân, quảng cáo' },
  ];

  const usageItems = [
    { id: 'saved', icon: Bookmark, label: 'Đã lưu' },
    { id: 'archive', icon: Archive, label: 'Lưu trữ' },
    { id: 'activity', icon: Clock, label: 'Hoạt động của bạn' },
    { id: 'notifications', icon: Bell, label: 'Thông báo' },
    { id: 'time-spent', icon: Clock, label: 'Thời gian sử dụng' },
  ];

  const visibilityItems = [
    { id: 'account-privacy', icon: Lock, label: 'Quyền riêng tư của tài khoản', value: 'Công khai' },
    { id: 'close-friends', icon: Users, label: 'Bạn thân' },
    { id: 'blocked', icon: Ban, label: 'Đã chặn' },
    { id: 'hide-story', icon: EyeOff, label: 'Ẩn tin và buổi phát trực tiếp' },
  ];

  const interactionItems = [
    { id: 'messages', icon: MessageCircle, label: 'Tin nhắn và lượt phản hồi tin' },
    { id: 'tags', icon: AtSign, label: 'Thẻ và lượt nhắc' },
    { id: 'comments', icon: MessageSquare, label: 'Bình luận' },
    { id: 'sharing', icon: Share2, label: 'Chia sẻ và remix' },
  ];

  const appMediaItems = [
    { id: 'device-permissions', icon: Smartphone, label: 'Quyền của thiết bị' },
    { id: 'data-usage', icon: Database, label: 'Mức sử dụng dữ liệu và chất lượng file phương tiện' },
  ];

  const familyItems = [
    { id: 'supervision', icon: Shield, label: 'Giám sát' },
  ];

  const renderItem = (item: any) => (
    <button 
      key={item.id}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <item.icon className="w-6 h-6 text-white" />
        <div className="flex flex-col items-start text-left">
          <span className="text-[16px] text-white">{item.label}</span>
          {item.description && <span className="text-[12px] text-gray-400 mt-0.5">{item.description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.value && <span className="text-[14px] text-gray-400">{item.value}</span>}
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>
    </button>
  );

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center px-4 pb-4 pt-12 border-b border-white/10 sticky top-0 bg-[#121212]/95 z-10 backdrop-blur-md shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-semibold ml-4">Cài đặt và quyền riêng tư</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
        {/* Search Bar */}
        <div className="p-4">
          <div className="bg-white/10 rounded-xl flex items-center px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm" 
              className="bg-transparent text-white outline-none w-full text-[15px] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Account Center */}
        <div className="mb-2">
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Tài khoản của bạn</h3>
            <span className="text-[12px] text-blue-400 font-semibold">Meta</span>
          </div>
          <div className="flex flex-col">
            {accountCenterItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* How you use */}
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Cách bạn dùng ConnectDucAnh</h3>
          <div className="flex flex-col">
            {usageItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* Who can see your content */}
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Ai có thể xem nội dung của bạn</h3>
          <div className="flex flex-col">
            {visibilityItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* How others can interact */}
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Cách người khác có thể tương tác với bạn</h3>
          <div className="flex flex-col">
            {interactionItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* App and media */}
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Ứng dụng và file phương tiện của bạn</h3>
          <div className="flex flex-col">
            {appMediaItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* For Families */}
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Dành cho gia đình</h3>
          <div className="flex flex-col">
            {familyItems.map(renderItem)}
          </div>
        </div>

        <div className="h-1.5 bg-black/50 w-full my-2" />

        {/* Logins */}
        <div className="mb-6">
          <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Đăng nhập</h3>
          <div className="flex flex-col">
            <button className="w-full flex items-center gap-4 py-3 px-4 hover:bg-white/5 transition-colors text-blue-500">
              <PlusCircle className="w-6 h-6" />
              <span className="text-[16px] font-medium">Thêm tài khoản</span>
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-4 py-3 px-4 hover:bg-red-500/10 transition-colors text-red-500"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[16px] font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
