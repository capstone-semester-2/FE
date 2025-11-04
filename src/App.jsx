import { useState, useEffect, useRef } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import logo from './assets/logo.png';
import RecordingControls from './features/recording/RecordingControls';
import HistoryScreen from './features/history/HistoryScreen';
import BookmarkScreen from './features/bookmarks/BookmarkScreen';
import EncyclopediaScreen from './features/encyclopedia/EncyclopediaScreen';
import SettingsModal from './features/settings/SettingsModal';
import { BookmarkProvider } from './store/BookmarkContext';


function App() {
  const [activeTab, setActiveTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 녹음 기록 데이터
  const [recordings, setRecordings] = useState([
    { 
      id: 1, 
      clarifiedText: '안녕하세요, 반갑습니다.', 
      date: '2025.10.26 14:30', 
      bookmarked: false
    },
    { 
      id: 2, 
      clarifiedText: '좋습니다', 
      date: '2025.10.25 11:30', 
      bookmarked: false
    },
    { 
      id: 3, 
      clarifiedText: '화장실이 어디 있을까요?', 
      date: '2025.10.25 08:30', 
      bookmarked: false
    },
    { 
      id: 4, 
      clarifiedText: '네, 감사합니다', 
      date: '2025.10.25 08:30', 
      bookmarked: false
    },
  ]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleDeleteRecording = (id) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  useEffect(() => {
    if (isSettingsOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isRecording]);

  return (
    <BookmarkProvider>
      <div className="app-shell">
        <div className="app-content">
          <Header onSettingsClick={() => setIsSettingsOpen(true)} logoSrc={logo} />
          <main className="flex-1 overflow-hidden bg-gray-50">
          {activeTab === 'record' && (
            <div className="min-h-full overflow-auto pb-24">
              <div className="flex justify-center px-4 py-6 w-full">
                <RecordingControls 
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <HistoryScreen 
              recordings={recordings}
              onDelete={handleDeleteRecording}
            />
          )}
          {activeTab === 'bookmark' && (
            <BookmarkScreen />
          )}
          {activeTab === 'encyclopedia' && <EncyclopediaScreen />}
        </main>
      </div>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-white/70 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-[300px]">
              <SettingsModal onClose={() => setIsSettingsOpen(false)} />
            </div>
          </div>
        )}
        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </BookmarkProvider>
  )
}

export default App
