import { useState, useEffect, useRef } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import logo from './assets/logo.png';
import RecordingControls from './features/recording/RecordingControls';
import HistoryScreen from './features/history/HistoryScreen';
import BookmarkScreen from './features/bookmarks/BookmarkScreen';
import EncyclopediaScreen from './features/encyclopedia/EncyclopediaScreen';
import { BookmarkProvider } from './store/BookmarkContext';


function App() {
  const [activeTab, setActiveTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

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
          <Header onSettingsClick={() => {}} logoSrc={logo} />
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
        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </BookmarkProvider>
  )
}

export default App
