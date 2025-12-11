import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Brain, Check, Ear, Mic } from 'lucide-react';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';

const TRAINING_SENTENCES = [
  '안녕하세요, 오늘은 제 목소리로 개인 어댑터를 연습하는 날이에요. 이 문장이 제대로 인식되는지, 나중에 결과를 꼭 확인해 주세요.',
  '오늘 날짜는 이천이십오년 십일월 이십삼 일이에요. 내일이나 모레 중에 시간이 비는 칸을 캘린더에서 찾아 볼 거예요.',
  '노트북에서 모델을 다시 학습시키고, 로그 파일을 꼼꼼히 확인하고 있어요. 인퍼런스를 돌릴 때는 지연 시간이 얼마나 나오는지도 꼭 확인해야 해요.',
  '밥을 안 먹어서 그런지, 지금은 입맛이 전혀 없어요. 신라호텔 로비에는 조용한 음악이 흘러나와서 마음이 조금 편안해집니다.',
  '버스를 탈지 지하철을 탈지, 출근할 때마다 잠깐씩 고민하게 돼요. 비가 오는 날에는 우산이랑 여벌 옷을 꼭 가방 안에 챙겨 넣습니다.',
  '요즘에는 필요한 물건을 대부분 인터넷으로 주문하고 있어요. 택배 상자를 열었더니, 생각보다 크기가 작아서 살짝 실망했어요.',
  '저는 전화 통화보다는 카톡이나 메신저로 연락하는 게 더 편해요. 단체 채팅방 알림이 너무 많으면, 잠시 알림을 꺼 두고 쉬고 싶어져요.',
  '오래 앉아 있다 보면 허리가 아파서, 의자에서 자주 일어나 스트레칭을 합니다. 잠이 부족하면 말이 자꾸 꼬여서, 발음이 흐려지는 느낌이 들어요.',
  '오늘 해야 할 일은 세 가지로 정리할 수 있어요. 첫 번째는 오전 아홉 시까지 끝내야 하는 급한 작업입니다.',
  '갑자기 바나나 맛 국밥이 신메뉴로 나와서, 모두가 고개를 갸웃거렸어요. 파란 우산을 쓴 펭귄이 버스 정류장에서 조용히 줄을 서 있는 상상을 했어요.',
  '같이 점심을 먹자고 했다가, 갑자기 약속이 취소돼서 혼자 밥을 먹었어요. 국물을 남기기 아까워서, 마지막 한 숟갈까지 싹 다 떠먹었습니다.',
  '서울시 종로구 삼청로 사십사 길 사 층 회의실로, 내일 아침에 와 주세요. 택시 기사님께는 건물 이름과 근처 편의점을 같이 말씀드리는 편입니다.',
  '관리 기록을 꼼꼼하게 남겨 두면, 나중에 문제가 생겨도 금방 원인을 찾을 수 있어요. 몰래 준비했던 생일 케이크가 들킬까 봐, 다들 말을 아끼고 있었어요.',
  '혹시 이 문장이 이상하게 들렸다면, 제가 다시 한 번 또렷하게 읽어 볼게요. 이런 연습 문장들을 모아서, 제 발음에 맞는 개인 모델을 만들고 있습니다.',
  '가끔은 별다른 이유가 없어도 갑자기 기분이 좋아질 때가 있어요. 작은 성취라도 있으면, 스스로를 많이 칭찬해 주는 편이에요.',
  '저는 시끄러운 술집보다는, 조용한 카페 구석 자리를 훨씬 더 좋아해요. 창가 쪽 자리에 앉으면, 기분이 괜히 더 좋아지는 것 같아요.',
  '제 휴대폰 번호는 공일공, 구칠팔팔, 삼이팔구라고 천천히 말해 볼게요. 계좌 번호를 말할 때는, 중간마다 끊어서 또박또박 읽으려고 합니다.',
  '저희 서비스는 말이 잘 나오지 않는 사람들의 의사소통을 돕기 위해 만들어지고 있어요. 상대방 음성을 빠르게 문자로 변환해서, 화면에 크게 띄워 주는 기능도 중요해요.',
  '딥러닝 모델 어댑터를 이용해서, 제 발음에 맞게 파라미터를 미세 조정하고 있어요. 인식 결과를 로그 파일로 저장해서, 나중에 어떤 문장이 자주 틀리는지도 분석할 계획입니다.',
  '이 음성들이 잘 모이면, 제 말을 더 잘 이해하는 개인 인식기가 만들어지겠죠. 여기까지 제 목소리를 들어 주셔서, 진심으로 감사드립니다.',
];

const ADAPTER_OPTIONS = [
  {
    id: 'hearing',
    title: '언어청각장애',
    description: '소리 구별 어려움으로 인해 발음 명확도가 낮은 경우',
    icon: Ear,
  },
  {
    id: 'cp',
    title: '뇌성마비',
    description: '근육 조절 어려움으로 인해 말이 느리거나 끊어지는 경우',
    icon: Brain,
  },
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const createEmptyRecordings = (length) => Array(length).fill(null);

const CustomVoiceTraining = ({ onClose, onSubmit }) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const totalSentences = TRAINING_SENTENCES.length;
  const [recordings, setRecordings] = useState(() => createEmptyRecordings(totalSentences));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedAdapter, setSelectedAdapter] = useState(null);
  const [step, setStep] = useState('adapter'); // adapter | record
  const timerRef = useRef(null);

  const recordedCount = useMemo(
    () => recordings.filter(Boolean).length,
    [recordings],
  );

  const progressPercent = useMemo(
    () => Math.round((recordedCount / totalSentences) * 100),
    [recordedCount, totalSentences],
  );

  const currentAdapter = useMemo(
    () => ADAPTER_OPTIONS.find((option) => option.id === selectedAdapter),
    [selectedAdapter],
  );

  const currentSentence = TRAINING_SENTENCES[currentIndex];
  const isLastSentence = currentIndex === totalSentences - 1;
  const hasCurrentRecording = Boolean(recordings[currentIndex]);
  const canProceed = hasCurrentRecording && !isSaving && !isRecording;
  const isAdapterSelected = Boolean(selectedAdapter);

  const resetTrainingState = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRecordings(createEmptyRecordings(totalSentences));
    setCurrentIndex(0);
    setRecordingTime(0);
    setIsSaving(false);
    setShowExitConfirm(false);
    setSelectedAdapter(null);
    setStep('adapter');
  };

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      clearInterval(timerRef.current);
      timerRef.current = null;
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  useEffect(() => () => {
    stopRecording()?.catch(() => {});
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, [stopRecording]);

  const handleRecordToggle = async () => {
    if (isSaving) return;

    if (isRecording) {
      setIsSaving(true);
      const durationSec = recordingTime;
      const blob = await stopRecording();
      setIsSaving(false);

      if (blob) {
        const recordingIndex = currentIndex + 1; // 서버에 1부터 시작하는 순번을 전달하기 위해 +1
        setRecordings((prev) => {
          const next = [...prev];
          next[currentIndex] = { blob, duration: durationSec, index: recordingIndex };
          return next;
        });
      }
      return;
    }

    setRecordingTime(0);
    await startRecording();
  };

  const handleRequestClose = () => {
    if (isRecording || recordedCount > 0) {
      setShowExitConfirm(true);
      return;
    }
    onClose?.();
  };

  const handleConfirmExit = async () => {
    if (isRecording) {
      try {
        await stopRecording();
      } catch (err) {
        console.error(err);
      }
    }
    resetTrainingState();
    onClose?.();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleNextSentence = () => {
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedAdapter) {
      setStep('adapter');
      return;
    }
    if (!hasCurrentRecording || recordedCount < totalSentences) {
      return;
    }
    onSubmit?.({
      recordings,
      sentences: TRAINING_SENTENCES,
      baseModel: selectedAdapter,
    });
  };

  const handleConfirmAdapter = () => {
    if (!selectedAdapter) return;
    setStep('record');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleRequestClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-scale-in">
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={handleRequestClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-500">내 목소리</p>
            <h2 className="text-lg font-bold text-gray-900">AI 학습하기</h2>
          </div>
        </header>

        {step === 'adapter' && (
          <div className="px-5 py-6 flex flex-col gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-indigo-600">1단계 · 학습용 모델 선택</p>
              <h3 className="text-lg font-bold text-gray-900">어떤 유형에 더 가까운가요?</h3>
              <p className="text-sm text-gray-600">
                학습한 20개 문장과 함께 저장되어 더 정확한 어댑터를 적용할게요.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ADAPTER_OPTIONS.map(({ id, title, description, icon: Icon }) => {
                const isActive = selectedAdapter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedAdapter(id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    {isActive && (
                      <span className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 border border-dashed border-gray-200">
              <p className="text-sm text-gray-700 font-semibold mb-1">다음 단계</p>
              <p className="text-sm text-gray-600">
                선택한 유형 + 20개의 문장 녹음이 함께 업로드되어 맞춤 어댑터를 학습합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmAdapter}
              disabled={!isAdapterSelected}
              className={`w-full py-3 rounded-2xl text-white font-semibold shadow-md transition-colors ${
                !isAdapterSelected
                  ? 'bg-indigo-200 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              선택하고 녹음 시작하기
            </button>
          </div>
        )}

        {step === 'record' && (
          <>
            <div className="px-5 py-6 flex flex-col gap-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs">
                    {currentAdapter?.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('adapter')}
                    className="text-xs text-indigo-600 underline underline-offset-4 font-semibold"
                  >
                    유형 변경
                  </button>
                </div>
                <span className="font-semibold text-gray-800">{recordedCount} / {totalSentences}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 shadow-inner">
                <p className="text-center text-sm font-bold text-gray-900 leading-relaxed min-h-[80px] flex items-center justify-center">
                  {currentSentence}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-700 font-semibold">
                  버튼을 눌러 위 문장을 또렷하게 읽어주세요
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="h-6 text-sm font-semibold text-indigo-600">
                  {isRecording ? `녹음 중... ${formatTime(recordingTime)}` : hasCurrentRecording ? '녹음 완료' : '대기 중'}
                </div>
                <button
                  type="button"
                  onClick={handleRecordToggle}
                  disabled={isSaving}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isRecording ? (
                    <div className="w-10 h-10 bg-white rounded" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </button>
                {recorderError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{recorderError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-6">
              <button
                type="button"
                onClick={isLastSentence ? handleSubmit : handleNextSentence}
                disabled={!canProceed}
                className={`w-full py-3 rounded-2xl text-white font-semibold shadow-md transition-colors ${
                  !canProceed
                    ? 'bg-indigo-200 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                {isLastSentence ? '완료 및 제출' : '다음 문장'}
              </button>
              {!isLastSentence && (
                <p className="mt-2 text-center text-xs text-gray-500">현재 문장을 먼저 녹음하면 다음으로 이동할 수 있습니다.</p>
              )}
              {isLastSentence && (
                <p className="mt-2 text-center text-xs text-gray-500">20개 모두 녹음 후 제출하면 학습을 시작할 수 있어요.</p>
              )}
            </div>
          </>
        )}
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelExit} aria-hidden="true" />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 text-center">녹음을 중단하고 나갈까요?</h3>
            <p className="text-sm text-gray-600 text-center">지금까지 진행한 녹음이 모두 사라집니다.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelExit}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                계속하기
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVoiceTraining;
