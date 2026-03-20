import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 pt-12 border-b border-white/10 sticky top-0 bg-[#121212]/95 z-10 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-semibold">Edit profile</h1>
        <button onClick={() => navigate(-1)} className="text-[15px] font-semibold text-pink-500 hover:text-pink-400 transition-colors">
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
        {/* Photo Section */}
        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-[#2A2A2A]">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
          <button className="mt-4 text-[15px] font-semibold text-white hover:text-gray-300 transition-colors">
            Change photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="px-4 space-y-6">
          <div className="flex flex-col border-b border-white/10 pb-3">
            <label className="text-[13px] text-gray-400 mb-1.5 font-medium">Name</label>
            <input 
              type="text" 
              defaultValue="Alex Chen" 
              className="bg-transparent text-white outline-none text-[16px] placeholder-gray-600" 
            />
          </div>
          
          <div className="flex flex-col border-b border-white/10 pb-3">
            <label className="text-[13px] text-gray-400 mb-1.5 font-medium">Username</label>
            <input 
              type="text" 
              defaultValue="alexchen" 
              className="bg-transparent text-white outline-none text-[16px] placeholder-gray-600" 
            />
            <span className="text-[12px] text-gray-500 mt-2">tiktok.com/@alexchen</span>
          </div>
          
          <div className="flex flex-col border-b border-white/10 pb-3">
            <label className="text-[13px] text-gray-400 mb-1.5 font-medium">Bio</label>
            <textarea 
              defaultValue="Digital Creator | Sharing life's moments | Seattle 📍" 
              className="bg-transparent text-white outline-none text-[16px] resize-none h-16 placeholder-gray-600" 
              maxLength={80} 
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="px-4 mt-8 space-y-6">
          <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Social</h2>
          
          <div className="flex flex-col border-b border-white/10 pb-3">
            <label className="text-[13px] text-gray-400 mb-1.5 font-medium">Instagram</label>
            <input 
              type="text" 
              placeholder="Add Instagram to your profile" 
              className="bg-transparent text-white outline-none text-[16px] placeholder-gray-600" 
            />
          </div>
          
          <div className="flex flex-col border-b border-white/10 pb-3">
            <label className="text-[13px] text-gray-400 mb-1.5 font-medium">YouTube</label>
            <input 
              type="text" 
              placeholder="Add YouTube to your profile" 
              className="bg-transparent text-white outline-none text-[16px] placeholder-gray-600" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
