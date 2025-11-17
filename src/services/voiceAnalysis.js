const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

const parseJson = (raw) => {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const connectVoiceStream = () => {
  assertApiBaseUrl();

  if (typeof window === 'undefined' || !window.EventSource) {
    return Promise.reject(new Error('이 브라우저는 실시간 분석을 지원하지 않습니다.'));
  }

  const url = new URL('/voice/stream', API_BASE_URL);

  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(url.toString(), { withCredentials: true });
    let isResolved = false;

    const cleanup = () => {
      eventSource.close();
    };

    const resultPromise = new Promise((resolveResult, rejectResult) => {
      eventSource.addEventListener('complete', (event) => {
        const data = parseJson(event.data);
        cleanup();
        resolveResult(data);
      });

      eventSource.addEventListener('error', () => {
        cleanup();
        rejectResult(new Error('AI 분석 결과를 가져오는 중 오류가 발생했습니다.'));
      });
    });

    eventSource.addEventListener('connected', (event) => {
      if (isResolved) {
        return;
      }
      const data = parseJson(event.data);
      const emitterId = data.emitterId || data.id || data.emitterID || event.data;
      if (!emitterId) {
        cleanup();
        reject(new Error('SSE 연결에서 emitterId를 받지 못했습니다.'));
        return;
      }
      isResolved = true;
      resolve({ emitterId, waitForResult: resultPromise, cancel: cleanup });
    });
  });
};

export const notifyUploadComplete = async ({ objectKey, emitterId }) => {
  assertApiBaseUrl();

  if (!objectKey || !emitterId) {
    throw new Error('업로드 완료 알림에 필요한 정보가 누락되었습니다.');
  }

  const response = await fetch(`${API_BASE_URL}/voice/upload-complete`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objectKey, emitterId }),
  });

  if (!response.ok) {
    throw new Error('AI 분석을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  return response.json().catch(() => undefined);
};
