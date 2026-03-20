import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger the password reset flow
    alert('Password reset link sent to your email/phone!');
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 font-sans">
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[850px] sm:rounded-[40px] sm:border-[8px] sm:border-gray-800 overflow-y-auto scrollbar-hide relative flex flex-col items-center bg-gradient-to-br from-[#7e22ce] via-[#ec4899] to-[#f97316]">
        
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

        {/* Top Navigation */}
        <div className="w-full pt-[calc(env(safe-area-inset-top,40px)+16px)] px-4 flex items-center z-10">
          <button 
            onClick={() => navigate('/login')} 
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-7 h-7 text-white drop-shadow-md" />
          </button>
        </div>

        <div className="flex flex-col items-center w-full px-8 z-10 my-auto py-8 pb-32">
          {/* Lock Icon */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center relative shadow-lg border border-white/30">
              <LockKeyhole className="w-12 h-12 text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-sm">Trouble logging in?</h2>
            <p className="text-white/80 text-[15px] leading-relaxed px-2">
              Enter your email, phone, or username and we'll send you a link to get back into your account.
            </p>
          </div>

          <form onSubmit={handleReset} className="w-full space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Email, Phone, or Username"
                className="w-full px-6 py-4 bg-white/20 border border-white/40 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-4 bg-white text-purple-700 rounded-full font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
            >
              Send Login Link <ArrowUpRight className="w-5 h-5 text-pink-500" strokeWidth={3} />
            </button>
          </form>

          <div className="mt-10 w-full flex items-center justify-center">
            <div className="h-px bg-white/30 flex-1"></div>
            <span className="px-4 text-white/80 text-sm font-medium">OR</span>
            <div className="h-px bg-white/30 flex-1"></div>
          </div>

          <div className="mt-8">
            <button onClick={() => navigate('/signup')} className="font-bold text-white hover:underline text-[15px]">
              Create New Account
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 w-full border-t border-white/20 bg-white/5 backdrop-blur-md pb-[calc(env(safe-area-inset-bottom,20px)+16px)] pt-4 flex justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="font-bold text-white hover:underline text-[15px]"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
