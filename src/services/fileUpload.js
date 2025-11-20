import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

export const requestPresignedUrl = async (extension = 'wav') => {
  assertApiBaseUrl();

  const url = new URL('/api/generate-presigned-url', API_BASE_URL);
  url.searchParams.set('extension', extension);

  const headers = new Headers();
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
    throw new Error('업로드 URL을 발급받지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  const data = await response.json();
  const result = data?.result;

  if (!result?.preSignedUrl || !result?.objectKey) {
    throw new Error('서버에서 올바른 presigned URL 정보를 받지 못했습니다.');
  }

  return {
    preSignedUrl: result.preSignedUrl,
    objectKey: result.objectKey,
    expiresAt: result.expiresAt,
  };
};

export const uploadToPresignedUrl = async (preSignedUrl, file) => {
  const response = await fetch(preSignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('녹음 파일 업로드에 실패했습니다. 네트워크 상태를 확인해주세요.');
  }
};
