import { Card } from './ui/card';
import { CheckCircle2, Zap, Settings, Play } from 'lucide-react';

export function QuickStartGuide() {
  return (
    <Card className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800">
      <div>
        <h3 className="text-lg mb-2">Quick Start Guide</h3>
        <p className="text-sm text-zinc-400">Get started with the Agentic Media Poster</p>
      </div>

      <div className="space-y-4">
        <GuideStep
          number={1}
          icon={<Settings className="w-5 h-5" />}
          title="API Keys Configured"
          description="Your Groq, Gemini, and OpenRouter keys are already set up and ready to use."
          status="complete"
        />

        <GuideStep
          number={2}
          icon={<Zap className="w-5 h-5" />}
          title="Test Connections"
          description="Click 'Test All Providers' above to verify your API keys are working correctly."
          status="pending"
        />

        <GuideStep
          number={3}
          icon={<Play className="w-5 h-5" />}
          title="Generate Content"
          description="Use the Content Generator below to create social media posts with AI."
          status="pending"
        />
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <h4 className="text-sm mb-3 text-zinc-300">Features Available:</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <FeatureItem text="Multi-LLM support" />
          <FeatureItem text="Auto-fallback" />
          <FeatureItem text="Content generation" />
          <FeatureItem text="Idea generation" />
          <FeatureItem text="Real-time monitoring" />
          <FeatureItem text="Browser automation" />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          <strong>Note:</strong> The browser automation features connect to your local Puppeteer instance on port 9222. 
          Make sure your Docker services are running to enable full functionality.
        </p>
      </div>
    </Card>
  );
}

function GuideStep({ 
  number, 
  icon, 
  title, 
  description, 
  status 
}: { 
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'complete' | 'pending';
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        status === 'complete' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-zinc-800 text-zinc-400'
      }`}>
        {status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : icon}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-zinc-600">Step {number}</span>
          <h4 className="text-sm">{title}</h4>
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-purple-400" />
      <span className="text-zinc-400">{text}</span>
    </div>
  );
}
