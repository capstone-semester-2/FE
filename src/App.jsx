import { useState } from 'react'
import './App.css'
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import logo from './assets/logo.png'; // Import the logo

function App() {
  const [activeTab, setActiveTab] = useState('record');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        <Header onSettingsClick={() => {}} logoSrc={logo} /> {/* Pass logoSrc prop */}
      </div>
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default App
