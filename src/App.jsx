import { useState, useEffect, useRef, useCallback } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import logo from './assets/logo.png';
import RecordingControls from './features/recording/RecordingControls';
import HistoryScreen from './features/history/HistoryScreen';
import BookmarkScreen from './features/bookmarks/BookmarkScreen';
import EncyclopediaScreen from './features/encyclopedia/EncyclopediaScreen';
import SettingsModal from './features/settings/SettingsModal';
import { BookmarkProvider } from './store/BookmarkContext';
import useVoiceRecorder from './hooks/useVoiceRecorder';
import { requestPresignedUrl, uploadToPresignedUrl } from './services/fileUpload';
import { connectVoiceStream, notifyUploadComplete } from './services/voiceAnalysis';


function App() {
  const [activeTab, setActiveTab] = useState('record');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [clarifiedText, setClarifiedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recorderError, setRecorderError] = useState('');
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const [activeMode, setActiveMode] = useState('voice'); // 'voice' | 'listen'

  const {
    error,
    isRecording,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

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

  const handleStartRecording = async () => {
    setActiveMode('voice');
    setClarifiedText('');
    setRecorderError('');
    setIsPreparingRecording(true);
    try {
      await startRecording();
    } catch (err) {
      setRecorderError(err.message || '마이크를 시작할 수 없습니다.');
    } finally {
      setIsPreparingRecording(false);
    }
  };

  const handleListenPress = async () => {
    // 녹음 중인데 보정용(voice) 모드일 때는 무시
    if (isRecording && activeMode !== 'listen') {
      return;
    }

    // 듣기 모드로 녹음 중이면 정지
    if (isRecording && activeMode === 'listen') {
      await handleStopRecording();
      return;
    }

    // 듣기 모드로 새로 시작
    setActiveMode('listen');
    setClarifiedText('');
    setRecorderError('');
    setIsPreparingRecording(true);
    try {
      await startRecording();
    } catch (err) {
      setRecorderError(err.message || '마이크를 시작할 수 없습니다.');
    } finally {
      setIsPreparingRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await stopRecording();
      if (!blob) {
        return;
      }
      setIsProcessing(true);
      const wavFile = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });

      const { emitterId, waitForResult, cancel } = await connectVoiceStream();

      try {
        const { preSignedUrl, objectKey } = await requestPresignedUrl('wav');
        await uploadToPresignedUrl(preSignedUrl, wavFile);
        await notifyUploadComplete({ objectKey, emitterId });
        const analysisResult = await waitForResult;
        const text =
          analysisResult?.text ||
          analysisResult?.message ||
          '분석 결과를 받아오지 못했습니다.';
        setClarifiedText(text);
      } finally {
        cancel?.();
      }
      setIsProcessing(false);
      setIsPreparingRecording(false);
      setRecorderError('');
    } catch (err) {
      console.error(err);
      setRecorderError(err.message || '녹음 처리 중 문제가 발생했습니다.');
      setIsProcessing(false);
      setIsPreparingRecording(false);
    }
  };

  const handleDeleteRecording = (id) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
  };

  const stopSpeaking = useCallback(() => {
    if (!window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback((text) => {
    if (!text || !window.speechSynthesis) {
      return;
    }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [stopSpeaking]);

  const handlePlayClarified = () => {
    if (isSpeaking) {
      return;
    }
    speakText(clarifiedText);
  };

  const handleSelectQuickPhrase = (text) => {
    setClarifiedText(text);
    speakText(text);
  };

  useEffect(() => () => {
    stopSpeaking();
  }, [stopSpeaking]);

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
                  isPreparing={isPreparingRecording}
                  recordingTime={recordingTime}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                  displayText={clarifiedText}
                  isProcessing={isProcessing}
                  onPlayClarified={handlePlayClarified}
                  isSpeaking={isSpeaking}
                  errorMessage={recorderError || error}
                  activeMode={activeMode}
                  onListenPress={handleListenPress}
                  onSelectQuickPhrase={handleSelectQuickPhrase}
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
