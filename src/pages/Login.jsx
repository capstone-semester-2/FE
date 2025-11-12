import { MessageCircle } from 'lucide-react';
import logo from '../assets/Re-Voice.png';
import { getKakaoAuthorizeUrl } from '../services/auth';

const Login = () => {
  const handleKakaoLogin = () => {
    try {
      const authorizeUrl = getKakaoAuthorizeUrl();
      window.location.href = authorizeUrl;
    } catch (error) {
      console.error(error);
      alert('카카오 로그인 설정을 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col px-10 pt-24 pb-12">
        <div className="flex-1 flex items-center justify-center">
          <img src={logo} alt="Re-Voice 로고" className="w-80 h-80" />
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#FEE500] px-6 py-4 text-base font-semibold text-[#2B1B00] shadow-[0_10px_24px_rgba(254,229,0,0.35)] hover:bg-[#FDD800] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          카카오톡으로 로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
