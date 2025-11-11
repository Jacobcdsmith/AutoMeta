import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { llmService } from '../services/llm-service';
import { configService } from '../services/config-service';

export function TestLLMConnection() {
  const [results, setResults] = useState<Record<string, { success: boolean; time: number; error?: string }>>({});
  const [testing, setTesting] = useState(false);

  const testProviders = async () => {
    setTesting(true);
    setResults({});

    const config = configService.getConfig();
    llmService.configure({
      groqApiKey: config.llm.groqApiKey,
      geminiApiKey: config.llm.geminiApiKey,
    });

    const providers: Array<'groq' | 'gemini'> = ['groq'];

    for (const provider of providers) {
      const result = await llmService.testConnection(provider);
      setResults(prev => ({ ...prev, [provider]: result }));
    }

    setTesting(false);
  };

  return (
    <Card className="p-6 space-y-4 bg-zinc-900/50 border-zinc-800">
      <div>
        <h3 className="text-lg mb-2">Test LLM Connections</h3>
        <p className="text-sm text-zinc-400">Verify your API keys are working</p>
      </div>

      <Button onClick={testProviders} disabled={testing} className="w-full">
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          'Test All Providers'
        )}
      </Button>

      <div className="space-y-2">
        {Object.entries(results).map(([provider, result]) => (
          <div key={provider} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <div className="text-sm capitalize">{provider}</div>
                {result.error && <div className="text-xs text-red-400">{result.error}</div>}
              </div>
            </div>
            <div className="text-xs text-zinc-500">{result.time}ms</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
