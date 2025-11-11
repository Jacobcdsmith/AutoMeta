import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Sparkles, Loader2, Copy, Check, Twitter, Linkedin } from 'lucide-react';
import { llmService } from '../services/llm-service';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toast } from 'sonner';

interface ContentGeneratorProps {
  onGenerated?: (content: string) => void;
}

export function ContentGenerator({ onGenerated }: ContentGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'twitter' | 'linkedin'>('twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'groq' | 'gemini' | 'openrouter'>(
    'groq'
  );
  const { copy, copiedText } = useCopyToClipboard();

  const handleGenerate = async () => {
    if (!topic.trim() && !generatedContent) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const content = await llmService.generateSocialPost({
        topic: topic || undefined,
        platform,
        tone: 'enthusiastic',
        includeHashtags: true,
      });

      setGeneratedContent(content);
      onGenerated?.(content);

      toast.success('Content generated!', {
        description: `Created with ${selectedProvider}`,
      });
    } catch (error) {
      toast.error('Failed to generate content', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    copy(generatedContent, '📋 Content copied!');
  };

  const isCopied = copiedText === generatedContent;

  return (
    <Card className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Content Generator</h3>
        <p className="text-sm text-zinc-400">Generate social media posts with AI</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic (optional)</Label>
          <Textarea
            id="topic"
            placeholder="e.g., AI automation in customer service, or leave blank for trending topics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-zinc-900 border-zinc-800 focus:border-purple-500 transition-colors min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleGenerate();
              }
            }}
          />
          <p className="text-xs text-zinc-500">Press Ctrl+Enter to generate</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={platform === 'twitter' ? 'default' : 'outline'}
                onClick={() => setPlatform('twitter')}
                className={`w-full transition-all ${
                  platform === 'twitter'
                    ? 'shadow-lg shadow-purple-500/20'
                    : ''
                }`}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant={platform === 'linkedin' ? 'default' : 'outline'}
                onClick={() => setPlatform('linkedin')}
                className={`w-full transition-all ${
                  platform === 'linkedin'
                    ? 'shadow-lg shadow-purple-500/20'
                    : ''
                }`}
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">LLM Provider</Label>
            <select
              id="provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="groq">Groq (Fastest)</option>
              <option value="openrouter">OpenRouter</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 min-h-[120px] hover:border-zinc-700 transition-colors">
              <p className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                {generatedContent}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Generated for {platform}</span>
              <span>•</span>
              <span>{generatedContent.length} characters</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
