import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

const extractErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return payload.message;
    }
  } catch (error) {
    console.error('Failed to parse bookmark error payload', error);
  }
  return '북마크 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
};

export const createBookmark = async (dictionaryId) => {
  assertApiBaseUrl();

  if (typeof dictionaryId === 'undefined' || dictionaryId === null) {
    throw new Error('dictionaryId가 필요합니다.');
  }

  const url = new URL('/bookmark', API_BASE_URL);
  url.searchParams.set('dictionaryId', dictionaryId);

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return payload?.result ?? {};
};
