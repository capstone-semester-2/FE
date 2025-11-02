import React, { useMemo, useState } from 'react';
import { Settings, Play, X } from 'lucide-react';

const speedMarks = { min: '느림', max: '빠름' };
const fontMarks = { min: '작게', max: '크게' };

const SettingsModal = ({ onClose }) => {
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [voiceGender, setVoiceGender] = useState('남성');

  const formattedSpeed = useMemo(() => `${voiceSpeed.toFixed(1)}x`, [voiceSpeed]);

  return (
    <div className="bg-white rounded-[28px] w-full p-6 relative space-y-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="설정 닫기"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#EEF0FF] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#6366F1]" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-semibold text-gray-900">설정</h2>
        </div>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              음성 속도 : <span className="font-semibold text-gray-900">{formattedSpeed}</span>
            </span>
            <span className="text-xs text-gray-400">{speedMarks.min} — {speedMarks.max}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={voiceSpeed}
            onChange={(event) => setVoiceSpeed(Number(event.target.value))}
            className="w-full accent-[#6366F1]"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              글자 크기 : <span className="font-semibold text-gray-900">{fontSize}px</span>
            </span>
            <span className="text-xs text-gray-400">{fontMarks.min} — {fontMarks.max}</span>
          </div>
          <input
            type="range"
            min="14"
            max="24"
            step="1"
            value={fontSize}
            onChange={(event) => setFontSize(Number(event.target.value))}
            className="w-full accent-[#6366F1]"
          />
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p className="text-sm text-gray-600">
            음성 성별 : <span className="font-semibold text-gray-900">{voiceGender}</span>
          </p>
          <div className="flex gap-3">
            {['남성', '여성'].map((gender) => {
              const isActive = voiceGender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setVoiceGender(gender)}
                  className={`flex-1 px-4 py-2 rounded-full font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#9D8BFF] text-white font-semibold hover:bg-[#8B79F5] transition-colors"
      >
        <Play className="w-4 h-4" />
        음성 테스트
      </button>
    </div>
  );
};

export default SettingsModal;
