import { Settings } from 'lucide-react';

const Header = ({ onSettingsClick, logoSrc, logoAlt = 'App logo' }) => {
    return (
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="w-10 h-10"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg -ml-15">Re-Voice</h1>
              <p className="text-xs text-gray-500">명확한 음성을 위한 AI 도우미</p>
            </div>
          </div>
          <button 
            onClick={onSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>
    );
  };
  
export default Header;