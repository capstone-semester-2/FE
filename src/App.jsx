import { useState, useEffect, useRef } from 'react';
import './App.css';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import logo from './assets/logo.png';
import RecordingControls from './features/recording/RecordingControls';
import HistoryScreen from './features/history/HistoryScreen';

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
    <div className="app-shell">
      <div className="app-content">
        <Header onSettingsClick={() => {}} logoSrc={logo} />
        <main className="flex-1 overflow-hidden">
          {activeTab === 'record' && (
            <RecordingControls 
              isRecording={isRecording}
              recordingTime={recordingTime}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen 
              recordings={recordings}
              onDelete={handleDeleteRecording}
            />
          )}
          {activeTab === 'bookmark' && (
            <div className="p-4">
              <h2 className="text-xl font-bold">북마크</h2>
              <p className="text-gray-500 mt-2">북마크 화면 (구현 예정)</p>
            </div>
          )}
          {activeTab === 'encyclopedia' && (
            <div className="p-4">
              <h2 className="text-xl font-bold">백과사전</h2>
              <p className="text-gray-500 mt-2">백과사전 화면 (구현 예정)</p>
            </div>
          )}
        </main>
      </div>
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default App