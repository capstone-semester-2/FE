import { useState } from 'react';
import App from './App.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Login from './pages/Login.jsx';

const Root = () => {
  const [stage, setStage] = useState('onboarding');

  if (stage === 'onboarding') {
    return <Onboarding onNext={() => setStage('login')} />;
  }

  if (stage === 'login') {
    return <Login onLogin={() => setStage('app')} />;
  }

  return <App />;
};

export default Root;
