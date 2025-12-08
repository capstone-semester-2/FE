import { getAccessToken } from './auth';
import { uploadToPresignedUrl } from './fileUpload';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. (.env의 VITE_API_BASE_URL 확인)');
  }
};

const normalizeVoiceModel = (baseModel) => {
  if (baseModel === 'cp' || baseModel === 'CP') return 'CP';
  if (baseModel === 'korean' || baseModel === 'KOREAN') return 'KOREAN';
  if (baseModel === 'custom' || baseModel === 'CUSTOM') return 'CUSTOM';
  return 'HEARING';
};

const parsePresignedList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const requestTrainingPresignedUrls = async ({ baseModel = 'hearing' } = {}) => {
  assertApiBaseUrl();

  const voiceModel = normalizeVoiceModel(baseModel);
  const url = new URL('presigned/put/multiple', API_BASE_URL);
  url.searchParams.set('voiceModel', voiceModel);

  const headers = new Headers();
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
    throw new Error('학습용 업로드 URL을 발급받지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  const payload = await response.json().catch(() => ({}));
  const list = parsePresignedList(payload);

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('서버에서 올바른 업로드 URL 정보를 받지 못했습니다.');
  }

  return list.map((item, index) => ({
    preSignedUrl: item.preSignedUrl || item.presignedUrl,
    objectKey: item.objectKey,
    objectKeyId: item.objectKeyId ?? item.id ?? index + 1,
    expiresAt: item.expiresAt,
    index,
  }));
};

export const uploadCustomVoiceTrainingSet = async ({
  baseModel = 'hearing',
  recordings = [],
  sentences = [],
  onProgress,
} = {}) => {
  if (!recordings.length) {
    throw new Error('업로드할 녹음이 없습니다.');
  }

  const normalizeRecordingIndex = (value, fallback) => {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      return Math.floor(num);
    }
    return fallback;
  };

  const normalizedRecordings = recordings
    .filter(Boolean)
    .map((recording, i) => ({
      ...recording,
      index: normalizeRecordingIndex(recording?.index, i + 1),
    }))
    .sort((a, b) => a.index - b.index);

  if (!normalizedRecordings.length) {
    throw new Error('업로드할 녹음이 없습니다.');
  }

  const presignedList = await requestTrainingPresignedUrls({ baseModel });

  if (presignedList.length < normalizedRecordings.length) {
    throw new Error('서버에서 받은 업로드 URL 수가 부족합니다. 다시 시도해주세요.');
  }

  const uploads = [];
  for (let i = 0; i < normalizedRecordings.length; i += 1) {
    const recording = normalizedRecordings[i];
    const presigned = presignedList[i];
    const blob = recording?.blob;

    if (!blob) {
      throw new Error(`녹음 ${i + 1}번 파일이 없습니다.`);
    }

    const index = normalizeRecordingIndex(recording?.index, i + 1);
    const sentenceIndex = index - 1;
    const file = new File(
      [blob],
      `custom-training-${index}.wav`,
      { type: blob.type || 'audio/wav' },
    );

    await uploadToPresignedUrl(presigned.preSignedUrl, file);

    uploads.push({
      objectKey: presigned.objectKey,
      objectKeyId: presigned.objectKeyId ?? index,
      expiresAt: presigned.expiresAt,
      index,
      sentence: sentences[sentenceIndex] ?? null,
    });

    if (onProgress) {
      onProgress((i + 1) / normalizedRecordings.length);
    }
  }

  return {
    voiceModel: normalizeVoiceModel(baseModel),
    uploads,
  };
};
