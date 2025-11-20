import { useCallback, useState } from 'react';
import App from './App.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Login from './pages/Login.jsx';
import KakaoCallback from './pages/KakaoCallback.jsx';
import { hasAuthTokens } from './services/auth.js';

const Root = () => {
  const [stage, setStage] = useState('onboarding');
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthTokens());

  const handleOnboardingNext = useCallback(() => {
    setStage(isAuthenticated ? 'app' : 'login');
  }, [isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setStage('app');
  }, []);

  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;

  if (currentPath === '/auth/login/kakao') {
    return <KakaoCallback onSuccess={handleAuthSuccess} />;
  }

  if (stage === 'onboarding') {
    return <Onboarding onNext={handleOnboardingNext} />;
  }

  if (stage === 'login') {
    return <Login />;
  }

  return <App />;
};

export default Root;
