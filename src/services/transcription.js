const MOCK_RESPONSES = [
  '안녕하세요, 얼마 동안 기다려 주셔서 감사합니다.',
  '화장실은 이 복도를 따라 끝까지 가신 후 오른쪽에 있습니다.',
  '말씀하신 내용을 명확하게 정리해 전달드릴게요.',
];

const pickRandomText = () => {
  const index = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[index];
};

export const requestTranscription = async (file) => {
  if (!file) {
    throw new Error('전송할 음성 파일이 없습니다.');
  }

  // TODO: 실제 API 엔드포인트가 준비되면 아래 fetch 코드로 교체합니다.
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/voice/transcribe`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // if (!response.ok) { throw new Error('음성 처리에 실패했습니다.'); }
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { text: pickRandomText() };
};
