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
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { LayoutDashboard, BarChart3, Keyboard } from 'lucide-react';
import { useServices } from './hooks/useServices';
import { useKeyboardShortcuts, getCommonShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'engagement'>('dashboard');
  const { status, isInitializing } = useServices();
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts(
    getCommonShortcuts(
      () => setIsConfigOpen(true),
      undefined,
      () => setCurrentView((prev) => (prev === 'dashboard' ? 'engagement' : 'dashboard'))
    ),
    !isConfigOpen // Disable when modal is open
  );

  // Add shortcut to show keyboard shortcuts help
  useKeyboardShortcuts(
    [
      {
        key: '?',
        shiftKey: true,
        callback: () => setShowShortcuts((prev) => !prev),
        description: 'Show Keyboard Shortcuts',
      },
    ],
    !isConfigOpen
  );

  useEffect(() => {
    // Show notification once about backend services
    if (!isInitializing && !hasShownNotification) {
      const allDisconnected = Object.values(status).every((s) => s === 'disconnected');
      if (allDisconnected) {
        toast.info('Running in demo mode', {
          description:
            'Backend services not detected. Connect your backend to enable full functionality.',
          duration: 5000,
        });
      } else {
        // Show success if services are connected
        const connectedServices = Object.entries(status)
          .filter(([, s]) => s === 'connected')
          .map(([name]) => name);

        if (connectedServices.length > 0) {
          toast.success('Connected to backend services', {
            description: `${connectedServices.join(', ')} ready!`,
            duration: 3000,
          });
        }
      }
      setHasShownNotification(true);
    }
  }, [isInitializing, status, hasShownNotification]);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Toaster />

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Keyboard className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 font-mono">
                    {shortcut.ctrlKey && 'Ctrl + '}
                    {shortcut.shiftKey && 'Shift + '}
                    {shortcut.altKey && 'Alt + '}
                    {shortcut.metaKey && 'Cmd + '}
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 border-t border-zinc-800 mt-2 pt-2">
                <span className="text-sm text-zinc-400">Show This Menu</span>
                <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 font-mono">
                  Shift + ?
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl text-white font-semibold">Agentic Media Poster</h1>
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
      <ConfigurationModal open={isConfigOpen} onOpenChange={setIsConfigOpen} />
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
        active
          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
