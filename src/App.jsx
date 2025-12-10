import { useState, useEffect, useRef, useCallback } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import Toast from './components/Toast';
import logo from './assets/logo.png';
import RecordingControls from './features/recording/RecordingControls';
import HistoryScreen from './features/history/HistoryScreen';
import BookmarkScreen from './features/bookmarks/BookmarkScreen';
import EncyclopediaScreen from './features/encyclopedia/EncyclopediaScreen';
import SettingsModal from './features/settings/SettingsModal';
import CustomVoiceTraining from './features/settings/CustomVoiceTraining';
import SignVideoModal from './components/SignVideoModal';
import { BookmarkProvider } from './store/BookmarkContext';
import useVoiceRecorder from './hooks/useVoiceRecorder';
import { requestGetPresignedUrl, requestPresignedUrl, uploadToPresignedUrl } from './services/fileUpload';
import {
  connectVoiceStream,
  deleteVoiceRecord,
  fetchVoiceList,
  notifyUploadComplete,
  requestAiLearning,
  checkCustomVoiceLearned,
  resetCustomVoiceLearning,
} from './services/voiceAnalysis';
import { uploadCustomVoiceTrainingSet } from './services/customVoiceTraining';


function App() {
  const [activeTab, setActiveTab] = useState('record');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [clarifiedText, setClarifiedText] = useState('');
  const [textMappings, setTextMappings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recorderError, setRecorderError] = useState('');
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const [activeMode, setActiveMode] = useState('voice'); // 'voice' | 'listen'
  const [voiceRecords, setVoiceRecords] = useState([]);
  const [voiceCursor, setVoiceCursor] = useState(null);
  const [voiceHasMore, setVoiceHasMore] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceTotalCount, setVoiceTotalCount] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const [ttsSettings, setTtsSettings] = useState({
    voiceSpeed: 1,
    fontSize: 20,
    aiModel: 'hearing',
  });
  const [customVoiceStatus, setCustomVoiceStatus] = useState('idle'); // idle | training | ready | failed
  const [isUploadingTraining, setIsUploadingTraining] = useState(false);
  const [isResettingCustomVoice, setIsResettingCustomVoice] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const trainingPayloadRef = useRef(null);
  const prevCustomVoiceStatusRef = useRef('idle');
  const [signVideoModal, setSignVideoModal] = useState({
    isOpen: false,
    isLoading: false,
    videoUrl: '',
    error: '',
    item: null,
  });

  const {
    error,
    isRecording,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleStartRecording = async () => {
    setActiveMode('voice');
    setClarifiedText('');
    setTextMappings([]);
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
    setTextMappings([]);
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
      console.log('[recording] stop captured blob', {
        size: blob.size,
        type: blob.type,
      });
      setIsProcessing(true);
      const wavFile = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
      console.log('[recording] created wav file', {
        name: wavFile.name,
        size: wavFile.size,
        type: wavFile.type,
      });

      const { emitterId, waitForResult, cancel } = await connectVoiceStream();
      console.log('[recording] voice stream connected', { emitterId });

      try {
        const { preSignedUrl, objectKey } = await requestPresignedUrl('wav');
        console.log('[recording] presigned url received', { objectKey });
        await uploadToPresignedUrl(preSignedUrl, wavFile);
        console.log('[recording] upload done, notifying server', { objectKey, emitterId });
        const voiceModel =
          activeMode === 'listen'
            ? 'KOREAN'
            : ttsSettings.aiModel === 'cp'
              ? 'CP'
              : ttsSettings.aiModel === 'custom'
                ? 'CUSTOM'
                : 'HEARING';

        await notifyUploadComplete({ objectKey, emitterId, voiceModel });
        const analysisResult = await waitForResult;
        console.log('[recording] analysis result received', analysisResult);
        const mappings =
          analysisResult?.textMappings ||
          analysisResult?.result?.textMappings ||
          analysisResult?.data?.textMappings ||
          [];
        const normalizedMappings = Array.isArray(mappings) ? mappings : [];
        const mappingText = normalizedMappings
          .map((item) => (item?.word || '').trim())
          .filter(Boolean)
          .join(' ');

        const textCandidates = [
          analysisResult?.text,
          analysisResult?.result?.text,
          analysisResult?.data?.text,
          analysisResult?.translatedText,
          analysisResult?.result?.translatedText,
          analysisResult?.data?.translatedText,
          mappingText,
          analysisResult?.message,
          analysisResult?.result?.message,
        ]
          .map((val) => (typeof val === 'string' ? val.trim() : ''))
          .filter(Boolean);

        const resolvedText = textCandidates[0] || '분석 결과를 받아오지 못했습니다.';

        setClarifiedText(resolvedText);
        setTextMappings(normalizedMappings);
        if (resolvedText) {
          speakText(resolvedText);
        }
      } finally {
        cancel?.();
        console.log('[recording] voice stream closed');
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
    setVoiceRecords((prev) => prev.filter((rec) => rec.id !== id));
  };

  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudioId(null);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setPlayingAudioId((current) => (current && current.startsWith('clarified-') ? null : current));
  }, []);

  const playAudioByObjectKey = useCallback(
    async ({ objectKey, id, type }) => {
      if (!objectKey) {
        throw new Error('재생할 오디오 objectKey가 없습니다.');
      }
      stopSpeaking();
      stopAudioPlayback();
      const { preSignedUrl } = await requestGetPresignedUrl(objectKey);
      const audio = new Audio(preSignedUrl);
      audioRef.current = audio;
      setPlayingAudioId(`${type}-${id}`);
      audio.onended = () => {
        stopAudioPlayback();
      };
      audio.onerror = () => {
        stopAudioPlayback();
        showToast('오디오를 재생하지 못했습니다.', 'error');
      };
      await audio.play();
    },
    [stopAudioPlayback, stopSpeaking],
  );

  const pickVoice = useCallback(() => {
    if (!window.speechSynthesis?.getVoices) {
      return null;
    }
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const keywords = ['yuna', 'hana', 'mijin', 'seoyeon', 'jisoo', 'taesoo', 'taeyang', 'salli'];

    const koVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('ko'));
    const byKeyword = (list) =>
      list.find((v) =>
        keywords.some((kw) => v.name.toLowerCase().includes(kw.toLowerCase()))
      );

    return byKeyword(koVoices) || koVoices[0] || byKeyword(voices) || voices[0];
  }, []);

  const speakText = useCallback((text, options = {}) => {
    const { playingId } = options;
    if (!text || !window.speechSynthesis) {
      return;
    }
    stopSpeaking();
    stopAudioPlayback();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = ttsSettings.voiceSpeed || 1;
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
    }
    if (playingId) {
      setPlayingAudioId(playingId);
    }
    setIsSpeaking(true);
    const clearSpeakingState = () => {
      setIsSpeaking(false);
      if (playingId) {
        setPlayingAudioId((current) => (current === playingId ? null : current));
      }
    };
    utterance.onend = clearSpeakingState;
    utterance.onerror = clearSpeakingState;
    window.speechSynthesis.speak(utterance);
  }, [pickVoice, stopAudioPlayback, stopSpeaking, ttsSettings.voiceSpeed]);

  const handlePlayClarified = () => {
    if (isSpeaking) {
      return;
    }
    speakText(clarifiedText);
  };

  const handleApplySettings = (settings) => {
    setTtsSettings(settings);
    setIsSettingsOpen(false);
  };

  const handleSelectQuickPhrase = (text) => {
    setClarifiedText(text);
    setTextMappings([]); // 빠른 문구를 선택하면 이전 분석 매핑을 지워 텍스트 영역에 바로 표시
    speakText(text);
  };

  const handleCustomTrainingSubmit = async (payload) => {
    if (isUploadingTraining) return;

    trainingPayloadRef.current = payload;
    setIsTrainingOpen(false);
    setCustomVoiceStatus('training');
    let trainingStream = null;
    const baseLabel =
      payload?.baseModel === 'cp'
        ? '뇌성마비'
        : payload?.baseModel === 'korean'
          ? '한국어 일반'
          : '언어청각장애';
    showToast(`AI 모델 학습을 시작했어요. ${baseLabel} 어댑터로 진행하며 완료되면 알려드릴게요.`, 'info');

    try {
      setIsUploadingTraining(true);
      trainingStream = await connectVoiceStream();
      const { emitterId, waitForResult } = trainingStream || {};
      if (!emitterId || !waitForResult) {
        throw new Error('실시간 학습 채널을 준비하지 못했습니다. 다시 시도해주세요.');
      }

      const uploadResult = await uploadCustomVoiceTrainingSet({
        baseModel: payload?.baseModel,
        recordings: payload?.recordings,
        sentences: payload?.sentences,
      });
      trainingPayloadRef.current = { ...payload, uploadResult };
      const learningVoiceModel =
        uploadResult?.voiceModel ||
        (payload?.baseModel === 'cp'
          ? 'CP'
          : payload?.baseModel === 'korean'
            ? 'KOREAN'
            : 'HEARING');

      const objectKeyInfos = (uploadResult?.uploads || []).map((item, index) => ({
        objectKeyId: item?.objectKeyId ?? item?.id ?? item?.index ?? index + 1,
        objectKey: item?.objectKey,
        index: item?.index ?? index + 1,
      }));

      await requestAiLearning({
        voiceModel: learningVoiceModel,
        objectKeyInfos,
        emitterId,
      });

      showToast('학습용 음성 업로드를 완료했고, 모델 학습을 요청했어요.', 'success');

      const trainingResult = await waitForResult;
      console.log('[custom voice] training result received', trainingResult);
      const statusText = (
        trainingResult?.status ||
        trainingResult?.result?.status ||
        trainingResult?.data?.status ||
        trainingResult?.state ||
        trainingResult?.result?.state ||
        trainingResult?.data?.state ||
        trainingResult?.message ||
        ''
      ).toString().toLowerCase();
      const hasError =
        Boolean(trainingResult?.error || trainingResult?.result?.error) ||
        statusText.includes('fail') ||
        statusText.includes('error');

      if (hasError) {
        setCustomVoiceStatus('failed');
        showToast('모델 학습 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        return;
      }

      setCustomVoiceStatus('ready');
    } catch (err) {
      console.error('[custom voice] upload or learning request failed', err);
      setCustomVoiceStatus('failed');
      showToast(err.message || '학습용 음성 업로드/요청에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsUploadingTraining(false);
      trainingStream?.cancel?.();
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCustomVoiceState = async () => {
      try {
        const { isLearned } = await checkCustomVoiceLearned();
        if (!isMounted) return;
        setCustomVoiceStatus((current) => {
          if (current === 'training') return current;
          return isLearned ? 'ready' : 'idle';
        });
        if (!isLearned) {
          setTtsSettings((prev) => (prev.aiModel === 'custom' ? { ...prev, aiModel: 'hearing' } : prev));
        }
      } catch (err) {
        console.error('[custom voice] failed to check learned state', err);
      }
    };
    fetchCustomVoiceState();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => () => {
    stopSpeaking();
  }, [stopSpeaking]);

  useEffect(() => {
    const prevStatus = prevCustomVoiceStatusRef.current;
    if (customVoiceStatus === 'ready') {
      setTtsSettings((prev) => ({ ...prev, aiModel: 'custom' }));
      if (prevStatus === 'training') {
        showToast('내 목소리 모델이 준비되어 자동 적용했어요.', 'success');
      }
    }
    prevCustomVoiceStatusRef.current = customVoiceStatus;
  }, [customVoiceStatus]);

  const closeSignVideoModal = () => {
    setSignVideoModal({
      isOpen: false,
      isLoading: false,
      videoUrl: '',
      error: '',
      item: null,
    });
  };

  const handlePlaySignVideo = useCallback(
    async (mapping) => {
      if (!mapping?.exists) {
        return;
      }

      setSignVideoModal({
        isOpen: true,
        isLoading: true,
        videoUrl: '',
        error: '',
        item: mapping,
      });

      try {
        if (!mapping?.objectKey) {
          throw new Error('영상 objectKey가 없습니다.');
        }
        const { preSignedUrl } = await requestGetPresignedUrl(mapping.objectKey);
        setSignVideoModal((prev) => ({
          ...prev,
          videoUrl: preSignedUrl,
          isLoading: false,
          error: '',
        }));
      } catch (err) {
        setSignVideoModal((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || '영상 재생 주소를 불러오지 못했습니다.',
        }));
      }
    },
    [],
  );

  const normalizeVoiceRecord = (item) => ({
    id: item?.voiceId ?? item?.id,
    clarifiedText: item?.translatedText ?? '',
    createdAt: item?.createdAt,
    objectKey: item?.objectKey,
    translatedTextObjectKey: item?.translatedText_objectKey ?? item?.translatedTextObjectKey,
  });

  const loadVoiceRecords = useCallback(async () => {
    if (voiceLoading || !voiceHasMore) return;
    setVoiceLoading(true);
    try {
      const { totalCount, voices } = await fetchVoiceList({
        lastId: voiceCursor ?? undefined,
        size: 5,
      });

      const normalized = Array.isArray(voices) ? voices.map(normalizeVoiceRecord).filter((v) => v.id) : [];

      setVoiceRecords((prev) => {
        const existing = new Set(prev.map((v) => v.id));
        const deduped = normalized.filter((v) => !existing.has(v.id));
        return [...prev, ...deduped];
      });

      setVoiceTotalCount(totalCount ?? 0);

      if (!normalized.length) {
        setVoiceHasMore(false);
        return;
      }

      const nextCursor = normalized[normalized.length - 1]?.id ?? null;
      if (nextCursor === null || nextCursor === voiceCursor) {
        setVoiceHasMore(false);
      } else {
        setVoiceCursor(nextCursor);
      }
    } catch (err) {
      console.error('Failed to load voice history', err);
      setVoiceHasMore(false); // 더 이상 자동 재시도하지 않도록 중단
    } finally {
      setVoiceLoading(false);
    }
  }, [voiceCursor, voiceHasMore, voiceLoading]);

  useEffect(() => {
    if (activeTab !== 'history') {
      historyLoadedRef.current = false;
      return;
    }
    if (!historyLoadedRef.current && !voiceLoading) {
      historyLoadedRef.current = true;
      loadVoiceRecords();
    }
  }, [activeTab, loadVoiceRecords, voiceLoading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  useEffect(() => {
    if (isSettingsOpen || isTrainingOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isSettingsOpen, isTrainingOpen]);

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

  const handleResetCustomVoice = async () => {
    if (isResettingCustomVoice || customVoiceStatus === 'training') return;
    setIsResettingCustomVoice(true);
    try {
      const { isLearned } = await resetCustomVoiceLearning();
      setCustomVoiceStatus(isLearned ? 'ready' : 'idle');
      setTtsSettings((prev) => ({ ...prev, aiModel: 'hearing' }));
      showToast('내 목소리 모델을 초기화했어요. 기본 모델로 전환합니다.', 'success');
    } catch (err) {
      console.error('[custom voice] reset failed', err);
      showToast(err.message || '내 목소리 모델 초기화에 실패했습니다.', 'error');
    } finally {
      setIsResettingCustomVoice(false);
    }
  };

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
                fontSize={ttsSettings.fontSize}
                textMappings={textMappings}
                onSignWordClick={handlePlaySignVideo}
              />
            </div>
          </div>
        )}
          {activeTab === 'history' && (
            <HistoryScreen 
              recordings={voiceRecords}
              onDelete={async (id) => {
                try {
                  await deleteVoiceRecord(id);
                  handleDeleteRecording(id);
                } catch (err) {
                  console.error(err);
                  showToast(err.message || '기록 삭제에 실패했습니다.', 'error');
                }
              }}
              onPlayOriginal={async (id) => {
                try {
                  const target = voiceRecords.find((v) => v.id === id);
                  if (!target?.objectKey) {
                    throw new Error('원본 오디오가 없습니다.');
                  }
                  await playAudioByObjectKey({ objectKey: target.objectKey, id, type: 'original' });
                } catch (err) {
                  console.error(err);
                  showToast(err.message || '오디오를 재생하지 못했습니다.', 'error');
                }
              }}
              onPlayClarified={(id) => {
                try {
                  const target = voiceRecords.find((v) => v.id === id);
                  const textToSpeak =
                    target?.clarifiedText ||
                    target?.translatedText ||
                    target?.text ||
                    '';
                  if (!window.speechSynthesis) {
                    throw new Error('이 브라우저는 음성 합성을 지원하지 않습니다.');
                  }
                  if (!textToSpeak) {
                    throw new Error('변환된 텍스트가 없습니다.');
                  }
                  speakText(textToSpeak, { playingId: `clarified-${id}` });
                } catch (err) {
                  console.error(err);
                  showToast(err.message || '오디오를 재생하지 못했습니다.', 'error');
                }
              }}
              playingId={playingAudioId}
              totalCount={voiceTotalCount}
              onLoadMore={loadVoiceRecords}
              isLoading={voiceLoading}
              hasMore={voiceHasMore}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-[360px]">
              <SettingsModal
                onClose={() => setIsSettingsOpen(false)}
                onApply={handleApplySettings}
                settings={ttsSettings}
                customVoiceStatus={customVoiceStatus}
                isResettingCustomVoice={isResettingCustomVoice}
                onStartTraining={() => setIsTrainingOpen(true)}
                onResetCustomVoice={handleResetCustomVoice}
              />
            </div>
          </div>
        )}
        {isTrainingOpen && (
          <CustomVoiceTraining
            onClose={() => setIsTrainingOpen(false)}
            onSubmit={handleCustomTrainingSubmit}
          />
        )}
        <SignVideoModal
          isOpen={signVideoModal.isOpen}
          isLoading={signVideoModal.isLoading}
          videoUrl={signVideoModal.videoUrl}
          word={signVideoModal.item?.word}
          error={signVideoModal.error}
          onClose={closeSignVideoModal}
          onRetry={signVideoModal.item ? () => handlePlaySignVideo(signVideoModal.item) : undefined}
        />
        <Toast message={toast?.message} type={toast?.type} />
        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </BookmarkProvider>
  )
}

export default App
