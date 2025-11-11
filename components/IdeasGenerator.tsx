import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { llmService } from '../services/llm-service';
import { toast } from 'sonner@2.0.3';

export function IdeasGenerator() {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdeas = async () => {
    setIsGenerating(true);
    try {
      const newIdeas = await llmService.generateContentIdeas(5);
      setIdeas(newIdeas);
      toast.success('Content ideas generated!');
    } catch (error) {
      toast.error('Failed to generate ideas', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-zinc-900/50 border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg mb-1">Content Ideas</h3>
          <p className="text-sm text-zinc-400">AI-generated post topics</p>
        </div>
        <Button
          onClick={generateIdeas}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {ideas.length > 0 ? 'Refresh' : 'Generate'}
        </Button>
      </div>

      {ideas.length > 0 ? (
        <div className="space-y-2">
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300">{idea}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Click "Generate" to get content ideas</p>
        </div>
      )}
    </Card>
  );
}
