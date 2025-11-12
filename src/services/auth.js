const TOKEN_STORAGE_KEY = 'revoice_auth_tokens';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

export const getAuthTokens = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(TOKEN_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error('Failed to parse stored auth tokens', error);
    storage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

export const saveAuthTokens = (tokens) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

export const clearAuthTokens = () => {
  const storage = getStorage();
  storage?.removeItem(TOKEN_STORAGE_KEY);
};

export const hasAuthTokens = () => {
  const tokens = getAuthTokens();
  if (!tokens) {
    return false;
  }

  if (typeof tokens === 'object') {
    if (tokens.accessToken) {
      return true;
    }

    if (tokens.result && Object.keys(tokens.result).length > 0) {
      return true;
    }
  }

  return Boolean(tokens);
};

export const getKakaoAuthorizeUrl = () => {
  const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('카카오 로그인 환경 변수가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

export const exchangeKakaoCode = async ({ code, redirectUri }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API 기본 주소가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    accessCode: code,
    redirectUri,
  });

  const response = await fetch(`${baseUrl}/auth/kakao?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    let message = '카카오 로그인에 실패했습니다.';

    try {
      const errorPayload = await response.json();
      if (errorPayload?.message) {
        message = errorPayload.message;
      }
    } catch (error) {
      console.error('Failed to parse error payload', error);
    }

    throw new Error(message);
  }

  return response.json();
};
