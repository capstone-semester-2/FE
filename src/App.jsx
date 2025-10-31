import { useState } from 'react'
import './App.css'
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState('record');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      <Header onSettingsClick={() => {}} />
      <div style={{ height: 72 }} />
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  )
}

export default App
