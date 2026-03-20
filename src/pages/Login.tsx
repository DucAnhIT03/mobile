import { useNavigate } from 'react-router-dom';
import { Lock, Smartphone, ArrowUpRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/feed');
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

        <div className="flex flex-col items-center w-full px-8 z-10 my-auto py-12">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative shadow-lg">
                <div className="absolute inset-2 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                  </div>
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-12 h-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">ConnectDucAnh</h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">Welcome Back!</h2>
            <p className="text-white/80 text-lg">Sign in to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="text"
                placeholder="Phone number or Email"
                className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/40 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-24 py-4 bg-white/20 border border-white/40 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                required
              />
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-white/90 font-medium text-sm hover:text-white"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-4 bg-white text-purple-700 rounded-full font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
            >
              Login <ArrowUpRight className="w-5 h-5 text-pink-500" strokeWidth={3} />
            </button>
          </form>

          <div className="mt-10 w-full flex items-center justify-center">
            <div className="h-px bg-white/30 flex-1"></div>
            <span className="px-4 text-white/80 text-sm">or continue with</span>
            <div className="h-px bg-white/30 flex-1"></div>
          </div>

          <div className="mt-8 flex justify-center gap-6">
            <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.93 3.57-.84 1.51.11 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.61 1.54-1.58 3.12-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
            <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          <div className="mt-10 text-white/90">
            Don't have an account? <button onClick={() => navigate('/signup')} className="font-bold hover:underline">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
