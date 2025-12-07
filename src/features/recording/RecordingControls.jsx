import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Coffee,
  Ear,
  HandHeart,
  Landmark,
  LifeBuoy,
  Mic,
  MessageCircle,
  Pill,
  ShoppingBag,
  Utensils,
  Volume2,
  Hospital,
} from 'lucide-react';

const RecordingControls = ({
  isRecording,
  isPreparing,
  recordingTime,
  onStart,
  onStop,
  displayText,
  isProcessing,
  onPlayClarified,
  isSpeaking,
  errorMessage,
  activeMode = 'voice',
  onListenPress,
  onSelectQuickPhrase,
  fontSize = 18,
  textMappings = [],
  onSignWordClick,
}) => {
    const isListenMode = activeMode === 'listen';
    const isVoiceRecording = isRecording && activeMode === 'voice';
    const isListenRecording = isRecording && activeMode === 'listen';
    const voiceDisabled = (isPreparing || isSpeaking || isProcessing) || (isRecording && !isVoiceRecording);
    const listenDisabled = (isPreparing || isSpeaking || isProcessing) || (isRecording && !isListenRecording);

    const categories = [
      { id: 'bank', label: '은행', Icon: Landmark },
      { id: 'hospital', label: '병원', Icon: Hospital },
      { id: 'pharmacy', label: '약국', Icon: Pill },
      { id: 'cafe', label: '카페', Icon: Coffee },
      { id: 'restaurant', label: '식당', Icon: Utensils },
      { id: 'convenience', label: '편의점', Icon: ShoppingBag },
      { id: 'emergency', label: '긴급', Icon: AlertCircle },
      { id: 'greeting', label: '인사', Icon: HandHeart },
      { id: 'help', label: '도움', Icon: LifeBuoy },
    ];

    const phrasesByCategory = {
      bank: ['이것 좀 도와주시겠어요?', '통장을 만들고 싶어요.', '카드 재발급 해주세요.', '비밀번호를 잊어버렸어요.', '네, 맞습니다.'],
      hospital: ['머리가 너무 아파요.', '접수는 어디서 하나요?', '약국 위치를 알려주세요.', '진료 예약 확인부탁드려요.'],
      pharmacy: ['약을 처방받으려고 해요.', '약국이 어디인가요?', '처방전이 있습니다.', '증상에 맞는 약을 추천해주세요.'],
      cafe: ['아메리카노 따뜻한 거 한 잔이요.', '화장실 비밀번호가 뭔가요?', '와이파이 비밀번호 알려주세요.', '포장해 주세요.'],
      restaurant: ['2명 자리 있나요?', '메뉴 추천 부탁해요.', '덜 맵게 해주세요.', '계산서 주세요.'],
      convenience: ['물 한 병 주세요.', '이거 계산할게요.', '포인트 적립할 수 있나요?', '봉투는 필요 없어요.'],
      emergency: ['도와주세요!', '경찰을 불러주세요.', '119에 신고해주세요.', '보호자에게 연락해주세요.'],
      greeting: ['안녕하세요.', '반갑습니다.', '감사합니다.', '죄송합니다.', '잠시만 기다려주세요.'],
      help: ['도움을 요청하고 싶습니다.', '길을 좀 알려주시겠어요?', '직원을 불러주세요.', '안내 데스크는 어디인가요?'],
    };

    const [isQuickOpen, setIsQuickOpen] = useState(false);
    const [quickView, setQuickView] = useState('categories'); // 'categories' | 'phrases'
    const [activeCategory, setActiveCategory] = useState(categories[1]); // 기본: 병원
    const [isCategoryFromLocation, setIsCategoryFromLocation] = useState(false);

    const openCategories = () => {
      setIsQuickOpen(true);
      setQuickView('categories');
    };

    const openPhrases = () => {
      setIsQuickOpen(true);
      setQuickView('phrases');
    };

    const handleCategorySelect = (cat) => {
      setActiveCategory(cat);
      setIsCategoryFromLocation(false);
      setQuickView('phrases');
    };

    const handlePhraseSelect = (phrase) => {
      onSelectQuickPhrase?.(phrase);
      setIsQuickOpen(false);
    };

    useEffect(() => {
      if (!isQuickOpen) {
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
        return;
      }

      const preventScroll = (e) => e.preventDefault();

      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
        window.removeEventListener('wheel', preventScroll, { passive: false });
        window.removeEventListener('touchmove', preventScroll, { passive: false });
      };
    }, [isQuickOpen]);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderPlainText = () => {
      if (isPreparing) {
        return '마이크를 준비하는 중입니다...';
      }
      if (isProcessing) {
        return 'AI가 음성을 명확한 문장으로 정리하고 있어요...';
      }
      if (displayText) {
        return displayText;
      }
      if (isRecording) {
        return '음성을 듣고 있습니다...';
      }
      if (isListenMode) {
        return '듣기 모드가 켜져 있어요. 주변의 말을 들려주세요.';
      }
      return '변환된 텍스트가 여기에 표시됩니다.';
    };

    const hasMappings = Array.isArray(textMappings) && textMappings.length > 0;
    const renderWithMappings = () => {
      if (!hasMappings) {
        return renderPlainText();
      }

      return textMappings.map((item, index) => {
        const { word = '', exists } = item || {};
        if (!word) return null;
        const isClickable = exists && onSignWordClick;
        const className = isClickable
          ? 'text-indigo-600 font-semibold cursor-pointer hover:text-indigo-700 transition-colors'
          : 'text-gray-900';

        if (isClickable) {
          return (
            <button
              key={`${word}-${index}`}
              type="button"
              onClick={() => onSignWordClick?.(item)}
              className={`${className} bg-transparent p-0 border-none inline`}
            >
              {word}
              {' '}
            </button>
          );
        }

        return (
          <span key={`${word}-${index}`} className={className}>
            {word}
            {' '}
          </span>
        );
      });
    };
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* 상단 위치/빠른음성 바 */}
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCategories}
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="카테고리 열기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <button
              type="button"
              onClick={openPhrases}
              className="flex-1 h-12 rounded-2xl px-4 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white flex items-center justify-between shadow-[0_10px_25px_rgba(99,102,241,0.25)]"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span className="text-sm font-semibold flex items-center gap-2">
                  {activeCategory.label} {isCategoryFromLocation && <span className="text-white/90">(현재 위치)</span>}
                </span>
              </div>
              <span className="text-lg font-semibold">›</span>
            </button>
          </div>

          {isQuickOpen && (
            <div
              className="fixed inset-0 z-30 flex items-start justify-center pt-24 px-4"
              onClick={() => setIsQuickOpen(false)}
            >
              <div
                className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  {quickView === 'phrases' ? (
                    <button
                      type="button"
                      onClick={() => setQuickView('categories')}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-400"
                    >
                      ‹ 목록
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">카테고리 선택</span>
                  )}
                  <span className="text-base font-bold text-slate-800">
                    {quickView === 'phrases' ? activeCategory.label : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuickOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                    aria-label="닫기"
                  >
                    ×
                  </button>
                </div>

                {quickView === 'categories' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-2xl py-3 text-sm font-semibold text-slate-700 transition-colors"
                      >
                        <cat.Icon className="w-6 h-6 text-indigo-500" strokeWidth={2.4} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {(phrasesByCategory[activeCategory.id] || []).map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => handlePhraseSelect(phrase)}
                        className="text-left w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 hover:bg-indigo-50"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          className={`w-full max-w-sm rounded-3xl p-12 mb-8 bg-white flex flex-col items-center min-h-[280px] mx-auto border-4 ${
            isListenMode ? 'border-emerald-400' : 'border-blue-400'
          }`}
        >
          <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
            {!displayText && (
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle
                  className={`w-10 h-10 ${
                    isListenMode ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                />
              </div>
            )}
            <div className="w-full min-h-[96px] px-4 flex items-center justify-center">
              <div
                className={`w-full text-center font-medium break-words ${
                  displayText ? 'text-2xl text-gray-900 leading-relaxed' : 'text-base text-gray-700'
                }`}
                style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
              >
                {renderWithMappings()}
              </div>
            </div>
            {displayText && !isProcessing && (
              <button
                type="button"
                onClick={onPlayClarified}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? '명확한 음성을 재생 중' : '명확한 음성 듣기'}
              </button>
            )}
            {errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}
          </div>
          <div className="w-full h-6 flex items-center justify-center">
            <span
              className={`text-blue-600 font-semibold text-xl transition-opacity duration-150 ${
                isRecording ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
  
        <div className="flex items-end justify-center gap-8 mb-2">
          <div className="flex flex-col items-center gap-2">
            {!isVoiceRecording ? (
              <button
                type="button"
                onClick={onStart}
                disabled={voiceDisabled}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  voiceDisabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Mic className="w-10 h-10 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStop}
                className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-white rounded" />
              </button>
            )}
            <p className="text-sm font-semibold text-gray-800">내 목소리</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onListenPress}
              disabled={listenDisabled}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all active:scale-95 ${
                listenDisabled
                  ? 'border-emerald-200 bg-white text-emerald-300 cursor-not-allowed shadow-none'
                  : isListenRecording
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]'
                    : 'border-emerald-500 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(16,185,129,0.18)] hover:bg-emerald-50'
              }`}
            >
              {isListenRecording ? (
                <div className="w-6 h-6 bg-white rounded" />
              ) : (
                <Ear className="w-10 h-10" />
              )}
            </button>
            <p className="text-sm font-semibold text-gray-800">듣기</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="font-semibold mb-1">
            {isRecording ? '녹음 중입니다...' : '마이크를 눌러 말씀해주세요'}
          </p>
          <p className="text-sm text-gray-500">
            {isRecording ? '음성을 듣고 있습니다...' : '명확하고 또렷한 음성으로 변환해드립니다'}
          </p>
        </div>
      </div>
    );
  };

export default RecordingControls;
