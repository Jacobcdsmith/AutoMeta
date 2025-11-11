// LLM Service - Handles communication with backend LLM Gateway
import { apiClient } from './api-client';

interface LLMConfig {
  // Configuration is now handled by backend via environment variables
  // This is kept for compatibility
  groqApiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  lmStudioEndpoint?: string;
}

interface GenerateRequest {
  prompt: string;
  provider?: 'groq' | 'gemini' | 'openrouter' | 'lmstudio';
  maxTokens?: number;
  temperature?: number;
  platform?: string;
}

interface GenerateResponse {
  content: string;
  provider: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class LLMService {
  private config: LLMConfig = {};

  configure(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
    console.log('LLM config updated (backend handles actual API keys)');
  }

  /**
   * Generate content using the backend LLM gateway
   * The gateway handles provider selection, fallback, and API key management
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await apiClient.llmGenerate({
        prompt: request.prompt,
        platform: request.platform,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        provider: request.provider,
      });

      return response as GenerateResponse;
    } catch (error) {
      console.error('LLM generation error:', error);
      throw error;
    }
  }

  /**
   * Check health of backend LLM gateway and available providers
   */
  async checkHealth(): Promise<{
    status: string;
    providers: Record<string, boolean>;
  }> {
    try {
      return (await apiClient.llmHealth()) as any;
    } catch (error) {
      console.error('LLM health check error:', error);
      return {
        status: 'disconnected',
        providers: {},
      };
    }
  }

  async testConnection(
    provider: 'groq' | 'gemini'
  ): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
      await this.generate({
        prompt: 'Say "OK" if you can read this.',
        provider,
        maxTokens: 10,
      });

      return {
        success: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateSocialPost(context: {
    topic?: string;
    platform: 'twitter' | 'linkedin';
    tone?: 'professional' | 'casual' | 'enthusiastic';
    includeHashtags?: boolean;
  }): Promise<string> {
    const platformGuidelines = {
      twitter: 'Keep it under 280 characters. Be concise and engaging.',
      linkedin:
        'Professional tone, can be longer (up to 3000 chars). Focus on insights and value.',
    };

    const prompt = `Generate a ${context.tone || 'engaging'} social media post for ${context.platform}.

${context.topic ? `Topic: ${context.topic}` : 'Topic: AI and automation trends'}

Guidelines:
- ${platformGuidelines[context.platform]}
${context.includeHashtags ? '- Include 2-3 relevant hashtags' : '- No hashtags'}
- Make it authentic and valuable
- ${context.platform === 'twitter' ? 'Use line breaks for readability' : 'Use professional formatting'}

Generate only the post content, nothing else.`;

    const response = await this.generate({
      prompt,
      platform: context.platform,
      temperature: 0.8,
      maxTokens: context.platform === 'twitter' ? 100 : 500,
    });

    return response.content.trim();
  }

  async generateContentIdeas(count: number = 5): Promise<string[]> {
    const prompt = `Generate ${count} engaging social media post ideas about AI, automation, and technology trends.

Make them specific, actionable, and interesting. Format as a simple numbered list.

Examples:
1. How AI is transforming customer service automation
2. The rise of local AI models and what it means for privacy
3. Comparing different LLM providers for business use

Generate ${count} new ideas:`;

    const response = await this.generate({
      prompt,
      temperature: 0.9,
      maxTokens: 500,
    });

    // Parse the response into an array
    const ideas = response.content
      .split('\n')
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    return ideas;
  }
}

export const llmService = new LLMService();
export type { LLMConfig, GenerateRequest, GenerateResponse };
