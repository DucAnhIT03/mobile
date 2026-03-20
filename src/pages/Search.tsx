import { Search as SearchIcon, Mic, X, Play } from 'lucide-react';
import { useState } from 'react';

const categories = ['For You', 'Trending', 'Music', 'Comedy', 'Gaming', 'Food', 'Dance', 'Beauty', 'Sports'];

const exploreItems = [
  { id: 1, type: 'video', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop', views: '1.2M' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1516280440502-62b210214eb7?q=80&w=1000&auto=format&fit=crop', views: '890K' },
  { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop', views: '2.4M' },
  { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop', views: '500K' },
  { id: 5, type: 'video', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', views: '3.1M' },
  { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1504609774734-ee3874f6ce4a?q=80&w=1000&auto=format&fit=crop', views: '120K' },
  { id: 7, type: 'video', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop', views: '4.5M' },
  { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', views: '670K' },
  { id: 9, type: 'video', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop', views: '900K' },
  { id: 10, type: 'image', url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop', views: '2.1M' },
  { id: 11, type: 'video', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', views: '3.3M' },
  { id: 12, type: 'image', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', views: '1.1M' },
  { id: 13, type: 'video', url: 'https://images.unsplash.com/photo-1516280440502-62b210214eb7?q=80&w=1000&auto=format&fit=crop', views: '890K' },
  { id: 14, type: 'image', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop', views: '2.4M' },
  { id: 15, type: 'video', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop', views: '500K' },
  { id: 16, type: 'image', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', views: '3.1M' },
  { id: 17, type: 'video', url: 'https://images.unsplash.com/photo-1504609774734-ee3874f6ce4a?q=80&w=1000&auto=format&fit=crop', views: '120K' },
  { id: 18, type: 'image', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop', views: '4.5M' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('For You');

  return (
    <div className="w-full h-full bg-[#000000] text-white flex flex-col font-sans">
      {/* Search Header */}
      <div className="px-4 pt-12 pb-3 sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center group">
            <SearchIcon className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#1A1A1A] text-white placeholder-gray-500 rounded-full py-3 pl-12 pr-10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all border border-transparent focus:border-white/20"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-300" />
              </button>
            )}
          </div>
          <button className="p-3 bg-[#1A1A1A] rounded-full hover:bg-[#2A2A2A] transition-colors shrink-0 border border-transparent">
            <Mic className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2.5 overflow-x-auto mt-4 pb-1 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-white text-black shadow-md scale-105' 
                  : 'bg-transparent border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Explore Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 bg-black">
        <div className="grid grid-cols-2 gap-0.5">
          {exploreItems.map((item) => {
            return (
              <div 
                key={item.id} 
                className="relative group cursor-pointer overflow-hidden bg-gray-900 aspect-[3/4]"
              >
                <img 
                  src={item.url} 
                  alt="Explore content" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                
                {/* View Count & Icon */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  {item.type === 'video' ? (
                    <Play className="w-3.5 h-3.5 text-white" fill="white" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  )}
                  <span className="text-[13px] font-semibold text-white drop-shadow-md">{item.views}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
