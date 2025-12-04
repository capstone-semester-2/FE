import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

const extractErrorMessage = async (
  response,
  fallbackMessage = '북마크 요청에 실패했습니다. 잠시 후 다시 시도해주세요.',
) => {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return payload.message;
    }
  } catch (error) {
    console.error('Failed to parse bookmark error payload', error);
  }
  return fallbackMessage;
};

export const toggleDictionaryBookmark = async (dictionaryId) => {
  assertApiBaseUrl();

  if (typeof dictionaryId === 'undefined' || dictionaryId === null) {
    throw new Error('dictionaryId가 필요합니다.');
  }

  const url = new URL('dictionary/bookmark', API_BASE_URL);
  url.searchParams.set('dictionaryId', dictionaryId);

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url.toString(), {
    method: 'PUT',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      '북마크 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.',
    );
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return payload?.result ?? {};
};

export const fetchBookmarkList = async ({ lastId, size = 20 } = {}) => {
  assertApiBaseUrl();

  const url = new URL('bookmark/list', API_BASE_URL);

  if (lastId !== undefined && lastId !== null) {
    url.searchParams.set('lastId', lastId);
  }

  if (size !== undefined && size !== null) {
    url.searchParams.set('size', size);
  }

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      '북마크 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload?.result) ? payload.result : [];
};
