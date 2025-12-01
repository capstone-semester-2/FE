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

  const raw = localStorage.getItem("revoice_auth_tokens");
  if (!raw) return Promise.reject("로그인이 필요합니다.");

  const parsed = JSON.parse(raw);
  const accessToken = parsed?.result?.accessToken;


  if (!accessToken) {
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  if (typeof window === 'undefined' || !window.EventSource) {
    return Promise.reject(new Error('이 브라우저는 실시간 분석을 지원하지 않습니다.'));
  }

  const url = new URL('voices/stream', API_BASE_URL);
  url.searchParams.append("accessToken", accessToken);
  console.log("[sse] connecting to stream", {
    url: url.toString(),
    hasToken: Boolean(accessToken),
  });


  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(url.toString(), { withCredentials: true });
    let isResolved = false;
    let hasErrored = false;

    const cleanup = () => {
      eventSource.close();
    };

    const resultPromise = new Promise((resolveResult, rejectResult) => {
      eventSource.addEventListener('complete', (event) => {
        const data = parseJson(event.data);
        console.log(data)
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

      console.log("sse 연결완료");

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

    eventSource.addEventListener('error', () => {
      console.warn("[sse] stream error event fired");
      if (hasErrored || isResolved) {
        return;
      }
      hasErrored = true;
      cleanup();
      reject(new Error('AI 분석 채널에 연결하지 못했습니다. 네트워크 상태를 확인해주세요.'));
    });
  });
};

export const notifyUploadComplete = async ({ objectKey, emitterId }) => {
  assertApiBaseUrl();

  const raw = localStorage.getItem("revoice_auth_tokens");
  if (!raw) return Promise.reject("로그인이 필요합니다.");

  const parsed = JSON.parse(raw);
  const accessToken = parsed?.result?.accessToken;


  if (!accessToken) {
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  if (!objectKey || !emitterId) {
    throw new Error('업로드 완료 알림에 필요한 정보가 누락되었습니다.');
  }

  const response = await fetch(`${API_BASE_URL}voices/upload-complete`, {    
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ objectKey, emitterId }),
  });


  // raw response
  console.log("raw response:", response);

// body 확인
  const json = await response.clone().json().catch(() => ({}));

  console.log("parsed json:", json);
  console.log("upload-complete message:", json?.result?.message)

  if (!response.ok) {
    throw new Error('AI 분석을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  return response.json().catch(() => undefined);
};

export const fetchVoiceList = async ({ lastId, size = 5 } = {}) => {
  assertApiBaseUrl();

  const raw = localStorage.getItem("revoice_auth_tokens");
  if (!raw) return Promise.reject("로그인이 필요합니다.");

  const parsed = JSON.parse(raw);
  const accessToken = parsed?.result?.accessToken;

  if (!accessToken) {
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  const url = new URL('voices', API_BASE_URL);
  if (lastId !== undefined && lastId !== null) {
    url.searchParams.set('lastId', lastId);
  }
  if (size !== undefined && size !== null) {
    url.searchParams.set('size', size);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = '음성 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    try {
      const errorPayload = await response.json();
      if (errorPayload?.message) {
        message = errorPayload.message;
      }
    } catch (error) {
      console.error('Failed to parse voice list error payload', error);
    }
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  const result = payload?.result ?? {};
  return {
    totalCount: result.totalCount ?? 0,
    voices: Array.isArray(result.voices) ? result.voices : [],
  };
};

export const deleteVoiceRecord = async (voiceId) => {
  assertApiBaseUrl();

  if (voiceId === undefined || voiceId === null) {
    throw new Error('voiceId가 필요합니다.');
  }

  const raw = localStorage.getItem("revoice_auth_tokens");
  if (!raw) return Promise.reject("로그인이 필요합니다.");

  const parsed = JSON.parse(raw);
  const accessToken = parsed?.result?.accessToken;

  if (!accessToken) {
    return Promise.reject(new Error("로그인이 필요합니다."));
  }

  const url = new URL(`voices/${voiceId}`, API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = '음성 기록 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.';

    try {
      const errorPayload = await response.json();
      if (errorPayload?.message) {
        message = errorPayload.message;
      }
    } catch (error) {
      console.error('Failed to parse delete voice error payload', error);
    }

    throw new Error(message);
  }

  return true;
};
