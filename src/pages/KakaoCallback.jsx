import { useEffect, useState } from 'react';
import { clearAuthTokens, exchangeKakaoCode, saveAuthTokens } from '../services/auth';

let kakaoLoginPromise = null; // Share the same exchange call across StrictMode double mounts.

const KakaoCallback = ({ onSuccess }) => {
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    if (!code) {
      setErrorMessage('카카오 인가 코드가 없습니다. 다시 시도해주세요.');
      setStatus('error');
      return;
    }

    if (!redirectUri) {
      setErrorMessage('리디렉션 주소가 설정되지 않았습니다.');
      setStatus('error');
      return;
    }

    if (!kakaoLoginPromise) {
      kakaoLoginPromise = exchangeKakaoCode({ code, redirectUri });
    }

    let isActive = true;

    const login = async () => {
      try {
        const tokens = await kakaoLoginPromise;
        if (!isActive) return;
        saveAuthTokens(tokens);
        window.history.replaceState(null, '', '/');
        onSuccess?.();
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error.message || '카카오 로그인에 실패했습니다.');
        setStatus('error');
        clearAuthTokens();
      }
    };

    login();
    return () => {
      isActive = false;
    };
  }, [onSuccess]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">로그인 처리 중입니다</p>
        <p className="text-sm text-gray-500">카카오 계정 인증 정보를 확인하고 있어요.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-lg font-semibold text-red-500 mb-2">로그인에 실패했습니다</p>
      <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
      <button
        type="button"
        onClick={() => {
          window.location.replace('/');
        }}
        className="px-6 py-3 rounded-full bg-gray-900 text-white font-semibold"
      >
        처음 화면으로 돌아가기
      </button>
    </div>
  );
};

export default KakaoCallback;
