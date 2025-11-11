// LLM Service - Handles communication with multiple LLM providers

interface LLMConfig {
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey?: string;
  lmStudioEndpoint?: string;
}

interface GenerateRequest {
  prompt: string;
  provider?: 'groq' | 'gemini' | 'openrouter' | 'openai' | 'lmstudio';
  maxTokens?: number;
  temperature?: number;
}

interface GenerateResponse {
  content: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class LLMService {
  private config: LLMConfig = {
    groqApiKey: '',
    geminiApiKey: '',
  };

  private providerPriority: Array<'groq' | 'gemini' | 'openrouter' | 'openai' | 'lmstudio'> = [
    'groq',
  ];

  configure(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const provider = request.provider || this.providerPriority[0];

    try {
      switch (provider) {
        case 'groq':
          return await this.generateWithGroq(request);
        case 'gemini':
          return await this.generateWithGemini(request);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      
      // Auto-fallback to next available provider
      const nextProvider = this.getNextProvider(provider);
      if (nextProvider) {
        console.log(`Falling back to ${nextProvider}`);
        return await this.generate({ ...request, provider: nextProvider });
      }
      
      throw error;
    }
  }

  private async generateWithGroq(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      provider: 'groq',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async generateWithGemini(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens || 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  private getNextProvider(currentProvider: string): string | null {
    const currentIndex = this.providerPriority.indexOf(currentProvider as any);
    if (currentIndex >= 0 && currentIndex < this.providerPriority.length - 1) {
      return this.providerPriority[currentIndex + 1];
    }
    return null;
  }

  async testConnection(provider: 'groq' | 'gemini'): Promise<{ success: boolean; responseTime: number; error?: string }> {
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
      linkedin: 'Professional tone, can be longer (up to 3000 chars). Focus on insights and value.',
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
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    return ideas;
  }
}

export const llmService = new LLMService();
export type { LLMConfig, GenerateRequest, GenerateResponse };
