import logo from '../assets/logo.png';

const Onboarding = ({ onNext }) => (
  <button
    type="button"
    onClick={onNext}
    className="min-h-screen w-full bg-white flex flex-col items-center justify-center gap-6 focus:outline-none"
  >
    <img src={logo} alt="Re-Voice 로고" className="w-28 h-28" />
    <div className="flex flex-col items-center gap-2 text-[#1F439A]">
      <span className="text-3xl font-semibold tracking-tight">Re-Voice</span>
      <span className="text-xs text-gray-400">터치하여 시작하세요</span>
    </div>
  </button>
);

export default Onboarding;
