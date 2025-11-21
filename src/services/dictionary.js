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
    console.error('Failed to parse dictionary error payload', error);
  }
  return fallbackMessage;
};

export const searchDictionary = async (keyword) => {
  assertApiBaseUrl();

  const trimmed = keyword?.trim();
  if (!trimmed) {
    return [];
  }

  const url = new URL('dictionary/search', API_BASE_URL);
  url.searchParams.set('keyword', trimmed);

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
      '수화 사전 검색에 실패했습니다. 잠시 후 다시 시도해주세요.',
    );
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload?.result) ? payload.result : [];
};

export const fetchDictionaryList = async ({ lastId, size = 20 } = {}) => {
  assertApiBaseUrl();

  const url = new URL('dictionary/list', API_BASE_URL);

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
      '수화 사전 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload?.result) ? payload.result : [];
};
