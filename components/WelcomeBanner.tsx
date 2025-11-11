import { useState, useEffect } from 'react';
import { X, CheckCircle2, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { configService } from '../services/config-service';

interface WelcomeBannerProps {
  onOpenConfig: () => void;
}

export function WelcomeBanner({ onOpenConfig }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConfigured, setHasConfigured] = useState(false);

  useEffect(() => {
    const config = configService.getConfig();
    const configured = config.llm.groqApiKey && config.llm.geminiApiKey && config.llm.openrouterApiKey;
    setHasConfigured(!!configured);
    
    // Show banner if not dismissed before
    const dismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!dismissed && configured) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('welcomeBannerDismissed', 'true');
  };

  if (!isVisible || !hasConfigured) return null;

  return (
    <div className="mx-6 mt-4 mb-0 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm mb-1">API Keys Configured!</h3>
          <p className="text-sm text-zinc-400 mb-3">
            Your LLM providers are ready. Try generating content in the <strong>Generator</strong> tab or test your connections.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onOpenConfig}>
              <Settings className="w-4 h-4 mr-2" />
              View Settings
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
