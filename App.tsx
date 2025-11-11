import { useState, useEffect } from 'react';
import { BrowserViewer } from './components/BrowserViewer';
import { LLMProviderPanel } from './components/LLMProviderPanel';
import { ContentSection } from './components/ContentSection';
import { MetricsPanel } from './components/MetricsPanel';
import { EngagementMetrics } from './components/EngagementMetrics';
import { ControlPanel } from './components/ControlPanel';
import { ConfigurationModal } from './components/ConfigurationModal';
import { StatusBar } from './components/StatusBar';
import { WelcomeBanner } from './components/WelcomeBanner';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { LayoutDashboard, BarChart3 } from 'lucide-react';
import { useServices } from './hooks/useServices';

export default function App() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'engagement'>('dashboard');
  const { status, isInitializing } = useServices();
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    // Show notification once about backend services
    if (!isInitializing && !hasShownNotification) {
      const allDisconnected = Object.values(status).every(s => s === 'disconnected');
      if (allDisconnected) {
        toast.info('Running in demo mode', {
          description: 'Backend services not detected. Connect your backend to enable full functionality.',
          duration: 5000,
        });
      }
      setHasShownNotification(true);
    }
  }, [isInitializing, status, hasShownNotification]);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl text-white">Agentic Media Poster</h1>
                <p className="text-sm text-zinc-400">Multi-LLM Browser Automation</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2 ml-6">
              <NavButton
                active={currentView === 'dashboard'}
                onClick={() => setCurrentView('dashboard')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
              />
              <NavButton
                active={currentView === 'engagement'}
                onClick={() => setCurrentView('engagement')}
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analytics"
              />
            </nav>
          </div>
          
          <ControlPanel onOpenConfig={() => setIsConfigOpen(true)} />
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' ? (
          <div className="flex">
            {/* Left Panel - Main Content Area */}
            <div className="flex-1 border-r border-zinc-800">
              <WelcomeBanner onOpenConfig={() => setIsConfigOpen(true)} />
              
              {/* Browser Panel - Fixed Height */}
              <div className="border-b border-zinc-800">
                <div className="p-6">
                  <BrowserViewer />
                </div>
              </div>

              {/* Scrollable Content Section */}
              <div className="min-h-screen">
                <ContentSection />
              </div>

              {/* Metrics and Analytics */}
              <div className="border-t border-zinc-800">
                <MetricsPanel />
              </div>
            </div>

            {/* Right Panel - LLM Providers & Logs - Sticky */}
            <div className="w-96 sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden">
              <LLMProviderPanel />
            </div>
          </div>
        ) : (
          /* Engagement Metrics View - Full Width */
          <div className="h-full">
            <EngagementMetrics />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Configuration Modal */}
      <ConfigurationModal 
        open={isConfigOpen} 
        onOpenChange={setIsConfigOpen} 
      />
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-purple-500 text-white'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
