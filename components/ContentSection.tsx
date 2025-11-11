import { ScrollArea } from './ui/scroll-area';
import { ActivityFeed } from './ActivityFeed';
import { ContentGenerator } from './ContentGenerator';
import { TestLLMConnection } from './TestLLMConnection';
import { IdeasGenerator } from './IdeasGenerator';
import { Card } from './ui/card';
import { MessageSquare, Calendar, TrendingUp, Hash } from 'lucide-react';

export function ContentSection() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-8 p-6 pb-12">
        {/* Generator Tools */}
        <section>
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Content Generation
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TestLLMConnection />
              <ContentGenerator />
            </div>
            <div className="space-y-6">
              <IdeasGenerator />
              <QuickStatsCard />
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section>
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Recent Activity
          </h2>
          <ActivityFeed />
        </section>

        {/* Scheduled Posts */}
        <section>
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Scheduled Posts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScheduledPostCard 
              platform="Twitter"
              scheduledFor="Today, 3:00 PM"
              content="🚀 Just launched our new AI-powered content generation system! Check out how we're using multi-LLM orchestration to create engaging social media posts."
              hashtags={['AI', 'Automation', 'ContentCreation']}
            />
            <ScheduledPostCard 
              platform="LinkedIn"
              scheduledFor="Today, 5:30 PM"
              content="Exploring the intersection of AI and social media automation. Here's what we've learned about scaling content creation with multiple LLM providers..."
              hashtags={['ArtificialIntelligence', 'SocialMedia']}
            />
            <ScheduledPostCard 
              platform="Twitter"
              scheduledFor="Tomorrow, 10:00 AM"
              content="💡 Pro tip: Combining Groq's speed with intelligent prompt engineering can dramatically improve your content workflow. Here's how we're doing it..."
              hashtags={['Productivity', 'AI', 'DevTools']}
            />
            <ScheduledPostCard 
              platform="LinkedIn"
              scheduledFor="Tomorrow, 2:00 PM"
              content="The future of content creation is here. Our agentic system browses, analyzes, and posts to social media—all autonomously. Thread 🧵"
              hashtags={['Innovation', 'Tech', 'Future']}
            />
            <ScheduledPostCard 
              platform="Twitter"
              scheduledFor="Tomorrow, 6:00 PM"
              content="Behind the scenes: How we built a real-time browser automation system with Puppeteer + LLM integration 🔧"
              hashtags={['WebDev', 'Automation']}
            />
            <ScheduledPostCard 
              platform="LinkedIn"
              scheduledFor="Wednesday, 9:00 AM"
              content="Case study: Reducing content creation time by 85% with AI-powered automation. The data might surprise you..."
              hashtags={['CaseStudy', 'Efficiency']}
            />
          </div>
        </section>

        {/* Content Ideas Queue */}
        <section>
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5 text-yellow-400" />
            Content Ideas Queue
          </h2>
          <div className="space-y-3">
            <IdeaCard 
              idea="Comparing different LLM providers for social media automation"
              category="Technical"
              priority="high"
            />
            <IdeaCard 
              idea="The ethics of AI-generated social media content"
              category="Opinion"
              priority="medium"
            />
            <IdeaCard 
              idea="How to set up your own agentic posting system in 2025"
              category="Tutorial"
              priority="high"
            />
            <IdeaCard 
              idea="Weekly AI news roundup and analysis"
              category="News"
              priority="medium"
            />
            <IdeaCard 
              idea="Cost analysis: Groq vs OpenAI vs local models"
              category="Analysis"
              priority="low"
            />
            <IdeaCard 
              idea="Building a content calendar with AI assistance"
              category="How-to"
              priority="medium"
            />
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

function QuickStatsCard() {
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800">
      <h4 className="text-sm mb-3 text-zinc-400">Quick Stats</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Posts today:</span>
          <span className="text-zinc-100">37</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Ideas generated:</span>
          <span className="text-zinc-100">128</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Avg. response time:</span>
          <span className="text-zinc-100">420ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Success rate:</span>
          <span className="text-green-400">98.6%</span>
        </div>
      </div>
    </Card>
  );
}

interface ScheduledPostCardProps {
  platform: string;
  scheduledFor: string;
  content: string;
  hashtags: string[];
}

function ScheduledPostCard({ platform, scheduledFor, content, hashtags }: ScheduledPostCardProps) {
  const platformColor = platform === 'Twitter' ? 'text-blue-400' : 'text-blue-600';
  
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm ${platformColor}`}>{platform}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-zinc-500">{scheduledFor}</span>
        </div>
      </div>
      <p className="text-sm text-zinc-300 mb-3 line-clamp-3">{content}</p>
      <div className="flex flex-wrap gap-1.5">
        {hashtags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded bg-zinc-800 text-purple-400">
            #{tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

interface IdeaCardProps {
  idea: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

function IdeaCard({ idea, category, priority }: IdeaCardProps) {
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-zinc-100 mb-2">{idea}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
              {category}
            </span>
            <span className={`text-xs px-2 py-1 rounded border ${priorityColors[priority]}`}>
              {priority}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
