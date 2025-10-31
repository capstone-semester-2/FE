import { Mic, Clock, Star, BookOpen } from 'lucide-react';

const BottomNavBar = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'record', icon: Mic, label: '음성 변환', color: 'bg-blue-500' },
        { id: 'history', icon: Clock, label: '기록', color: 'bg-orange-400' },
        { id: 'bookmark', icon: Star, label: '북마크', color: 'bg-green-500' },
        { id: 'encyclopedia', icon: BookOpen, label: '백과사전', color: 'bg-purple-500' }
      ];
  
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white">
          <div className="flex justify-around items-center px-4 py-2 w-full max-w-[430px] mx-auto border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex flex-col items-center justify-center 
                    py-2 px-4 rounded-2xl min-w-[85px]
                    transition-all duration-300 ease-in-out
                    ${isActive 
                      ? `${item.color} text-white scale-105 shadow-lg` 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className={`
                    transition-transform duration-300
                    ${isActive ? 'scale-110 -translate-y-1' : ''}
                  `}>
                    <Icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className={`
                    text-xs mt-1 font-medium
                    transition-all duration-300
                    ${isActive ? 'font-semibold' : ''}
                  `}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      );
    };

export default BottomNavBar;