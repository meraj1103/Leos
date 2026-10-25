import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatArea } from './components/ChatArea';
import { PromptBar } from './components/PromptBar';
import { AccountModal } from './components/AccountModal';
import { MCPModal } from './components/MCPModal';
import { VoiceModal } from './components/VoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { detectLocalModels } from './services/localLLMService';
import { useModelStore } from './stores/useModelStore';

export const App: React.FC = () => {
  // First time check: if no login session exists, open the Login page first
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('leos-logged-in') === 'true';
    }
    return false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { addLocalModels } = useModelStore();

  // Auto-detect local models on launch
  useEffect(() => {
    async function scanLocalHardware() {
      const localModels = await detectLocalModels();
      if (localModels.length > 0) {
        addLocalModels(localModels);
      }
    }
    scanLocalHardware();
  }, [addLocalModels]);

  const handleLogout = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('leos-logged-in');
    }
    setIsLoggedIn(false);
  };

  // If first time opening (not logged in), display the Login Page
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-leos-dark text-leos-text">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onOpenAccounts={() => setIsAccountModalOpen(true)}
        onOpenMCP={() => setIsMCPModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Cockpit Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-leos-dark">
        {/* Top Bar with Model Switcher & Status */}
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenAccounts={() => setIsAccountModalOpen(true)}
        />

        {/* Chat Stream Area */}
        <ChatArea />

        {/* Floating Minimalist Input Bar */}
        <PromptBar />
      </div>

      {/* Modals & Dialogs */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <MCPModal
        isOpen={isMCPModalOpen}
        onClose={() => setIsMCPModalOpen(false)}
      />

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default App;
