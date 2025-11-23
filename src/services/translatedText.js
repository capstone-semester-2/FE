import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

const extractErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return payload.message;
    }
  } catch (error) {
    console.error('Failed to parse translated text error payload', error);
  }
  return fallbackMessage;
};

export const fetchTranslatedTextTop3 = async () => {
  assertApiBaseUrl();

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const url = new URL('text/top3', API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      '번역 텍스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload?.result) ? payload.result : [];
};
