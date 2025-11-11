import { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}
import { 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Users, 
  Calendar,
  Clock,
  Award,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Target,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { analyticsService } from '../services/analytics-service';
import type { EngagementMetrics as EngagementMetricsType, PlatformMetrics as PlatformMetricsType, PostPerformance } from '../services/analytics-service';

export function EngagementMetrics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetricsType | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetricsType[]>([]);
  const [topPosts, setTopPosts] = useState<PostPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const timeRanges: Record<typeof timeRange, number> = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        'all': 365 * 24 * 60 * 60 * 1000,
      };

      const startDate = now - timeRanges[timeRange];

      const [metrics, platforms, posts, timeseries] = await Promise.all([
        analyticsService.getEngagementMetrics({ startDate, endDate: now }),
        analyticsService.getPlatformMetrics({ startDate, endDate: now }),
        analyticsService.getTopPosts(10, { startDate, endDate: now }),
        analyticsService.getTimeSeriesData({ 
          startDate, 
          endDate: now, 
          metric: 'engagement',
          granularity: timeRange === '7d' ? 'hour' : 'day'
        }),
      ]);

      setEngagementMetrics(metrics);
      setPlatformMetrics(platforms);
      setTopPosts(posts);
      setTimeSeriesData(timeseries);
    } catch (error) {
      // Use fallback demo data when service not available
      setEngagementMetrics({
        likes: 12400,
        comments: 2847,
        shares: 1923,
        impressions: 145000,
        reach: 89200,
        engagementRate: 5.8
      });
      setPlatformMetrics([
        { platform: 'Twitter', engagement: 4.8, reach: 12500, posts: 45, followers: 4589 },
        { platform: 'LinkedIn', engagement: 3.2, reach: 8900, posts: 28, followers: 3245 },
        { platform: 'Facebook', engagement: 2.1, reach: 5600, posts: 18, followers: 2891 },
      ]);
      setTopPosts([
        {
          id: '1',
          platform: 'twitter',
          content: 'Just launched our new AI-powered automation platform! 🚀 Check it out at...',
          timestamp: Date.now() - 3600000,
          metrics: {
            likes: 1247,
            comments: 89,
            shares: 156,
            impressions: 12450,
            reach: 8900,
            engagementRate: 8.4
          },
          hashtags: ['AI', 'Automation', 'Tech']
        },
        {
          id: '2',
          platform: 'linkedin',
          content: 'The future of content creation: How AI is transforming social media...',
          timestamp: Date.now() - 7200000,
          metrics: {
            likes: 892,
            comments: 67,
            shares: 124,
            impressions: 9870,
            reach: 7200,
            engagementRate: 7.2
          },
          hashtags: ['ContentCreation', 'AI']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Demo/fallback data
  const demoEngagementOverTime = [
    { date: 'Jan 1', likes: 245, comments: 34, shares: 12, impressions: 3420 },
    { date: 'Jan 3', likes: 312, comments: 45, shares: 18, impressions: 4150 },
    { date: 'Jan 5', likes: 289, comments: 38, shares: 15, impressions: 3890 },
    { date: 'Jan 7', likes: 456, comments: 67, shares: 28, impressions: 5670 },
    { date: 'Jan 9', likes: 398, comments: 52, shares: 22, impressions: 4980 },
    { date: 'Jan 11', likes: 534, comments: 78, shares: 35, impressions: 6340 },
    { date: 'Jan 13', likes: 478, comments: 65, shares: 30, impressions: 5820 },
    { date: 'Jan 15', likes: 612, comments: 89, shares: 42, impressions: 7230 },
  ];

  const postPerformance = [
    { time: '6am', engagement: 2.3 },
    { time: '9am', engagement: 4.8 },
    { time: '12pm', engagement: 6.2 },
    { time: '3pm', engagement: 5.4 },
    { time: '6pm', engagement: 7.8 },
    { time: '9pm', engagement: 4.1 },
  ];

  const contentTypePerformance = [
    { type: 'Image', engagement: 6.5, posts: 45 },
    { type: 'Video', engagement: 8.2, posts: 23 },
    { type: 'Text', engagement: 4.1, posts: 67 },
    { type: 'Link', engagement: 3.8, posts: 34 },
    { type: 'Poll', engagement: 7.3, posts: 12 },
  ];

  const demoAudienceGrowth = [
    { month: 'Jul', followers: 2340 },
    { month: 'Aug', followers: 2567 },
    { month: 'Sep', followers: 2891 },
    { month: 'Oct', followers: 3245 },
    { month: 'Nov', followers: 3678 },
    { month: 'Dec', followers: 4123 },
    { month: 'Jan', followers: 4589 },
  ];

  // Use real data if available, otherwise use demo data
  const engagementOverTime = timeSeriesData.length > 0 ? timeSeriesData : demoEngagementOverTime;
  const platformComparison = platformMetrics.length > 0 ? platformMetrics : [
    { platform: 'Twitter', engagement: 4.8, reach: 12500, posts: 45, followers: 4589 },
    { platform: 'LinkedIn', engagement: 3.2, reach: 8900, posts: 28, followers: 3245 },
    { platform: 'Facebook', engagement: 2.1, reach: 5600, posts: 18, followers: 2891 },
  ];
  const audienceGrowth = demoAudienceGrowth;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Engagement Metrics</h1>
            <p className="text-zinc-400">Comprehensive analytics and performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <TimeRangeButton active={timeRange === '7d'} onClick={() => setTimeRange('7d')}>7 Days</TimeRangeButton>
            <TimeRangeButton active={timeRange === '30d'} onClick={() => setTimeRange('30d')}>30 Days</TimeRangeButton>
            <TimeRangeButton active={timeRange === '90d'} onClick={() => setTimeRange('90d')}>90 Days</TimeRangeButton>
            <TimeRangeButton active={timeRange === 'all'} onClick={() => setTimeRange('all')}>All Time</TimeRangeButton>
          </div>
        </div>

        {/* Key Metrics Overview */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : engagementMetrics ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <EngagementMetricCard
              icon={<Heart className="w-5 h-5" />}
              label="Total Likes"
              value={formatNumber(engagementMetrics.likes)}
              change={18.2}
              color="text-red-400"
            />
            <EngagementMetricCard
              icon={<MessageCircle className="w-5 h-5" />}
              label="Comments"
              value={formatNumber(engagementMetrics.comments)}
              change={12.8}
              color="text-blue-400"
            />
            <EngagementMetricCard
              icon={<Share2 className="w-5 h-5" />}
              label="Shares"
              value={formatNumber(engagementMetrics.shares)}
              change={24.5}
              color="text-green-400"
            />
            <EngagementMetricCard
              icon={<Eye className="w-5 h-5" />}
              label="Impressions"
              value={formatNumber(engagementMetrics.impressions)}
              change={15.3}
              color="text-purple-400"
            />
            <EngagementMetricCard
              icon={<Users className="w-5 h-5" />}
              label="Reach"
              value={formatNumber(engagementMetrics.reach)}
              change={21.7}
              color="text-cyan-400"
            />
            <EngagementMetricCard
              icon={<Target className="w-5 h-5" />}
              label="Engagement Rate"
              value={`${engagementMetrics.engagementRate}%`}
              change={8.4}
              color="text-yellow-400"
            />
          </div>
        ) : null}

        {/* Engagement Over Time */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Engagement Trends
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={engagementOverTime}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="likes" stroke="#ef4444" fillOpacity={1} fill="url(#colorLikes)" />
              <Area type="monotone" dataKey="comments" stroke="#3b82f6" fillOpacity={1} fill="url(#colorComments)" />
              <Area type="monotone" dataKey="shares" stroke="#10b981" fillOpacity={1} fill="url(#colorShares)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Platform Comparison & Audience Growth */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h3 className="mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Platform Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="platform" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#f4f4f5'
                  }} 
                />
                <Legend />
                <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <h3 className="mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Audience Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={audienceGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#f4f4f5'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="timing" className="space-y-6">
          <TabsList className="bg-zinc-900">
            <TabsTrigger value="timing">Best Times</TabsTrigger>
            <TabsTrigger value="content">Content Types</TabsTrigger>
            <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="timing" className="space-y-6">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Optimal Posting Times
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={postPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#f4f4f5'
                    }} 
                  />
                  <Bar dataKey="engagement" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <TimeSlotCard time="12:00 PM" engagement="6.2%" label="Peak Time" />
                <TimeSlotCard time="6:00 PM" engagement="7.8%" label="Best Time" />
                <TimeSlotCard time="9:00 AM" engagement="4.8%" label="Morning Peak" />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Content Type Performance
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentTypePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" stroke="#71717a" />
                    <YAxis dataKey="type" type="category" stroke="#71717a" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        color: '#f4f4f5'
                      }} 
                    />
                    <Bar dataKey="engagement" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {contentTypePerformance.map((item) => (
                    <ContentTypeCard
                      key={item.type}
                      type={item.type}
                      engagement={item.engagement}
                      posts={item.posts}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="top-posts" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {topPosts.length > 0 ? (
                topPosts.slice(0, 4).map((post, index) => (
                  <TopPostCard
                    key={post.id}
                    rank={index + 1}
                    platform={post.platform}
                    content={post.content}
                    likes={post.metrics.likes}
                    comments={post.metrics.comments}
                    shares={post.metrics.shares}
                    impressions={post.metrics.impressions}
                    engagement={post.metrics.engagementRate}
                  />
                ))
              ) : (
                <>
                  <TopPostCard
                    rank={1}
                    platform="Twitter"
                    content="Just launched our new AI-powered automation platform! 🚀 Check it out at..."
                    likes={1247}
                    comments={89}
                    shares={156}
                    impressions={12450}
                    engagement={8.4}
                  />
                  <TopPostCard
                    rank={2}
                    platform="LinkedIn"
                    content="The future of content creation: How AI is transforming social media..."
                    likes={892}
                    comments={67}
                    shares={124}
                    impressions={9870}
                    engagement={7.2}
                  />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h3 className="mb-6">Audience Demographics</h3>
                <div className="space-y-4">
                  <DemographicBar label="Age 18-24" percentage={18} color="bg-purple-500" />
                  <DemographicBar label="Age 25-34" percentage={42} color="bg-blue-500" />
                  <DemographicBar label="Age 35-44" percentage={28} color="bg-green-500" />
                  <DemographicBar label="Age 45-54" percentage={9} color="bg-yellow-500" />
                  <DemographicBar label="Age 55+" percentage={3} color="bg-orange-500" />
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h3 className="mb-6">Geographic Distribution</h3>
                <div className="space-y-3">
                  <GeographicItem country="United States" percentage={45} flag="🇺🇸" />
                  <GeographicItem country="United Kingdom" percentage={18} flag="🇬🇧" />
                  <GeographicItem country="Canada" percentage={12} flag="🇨🇦" />
                  <GeographicItem country="Germany" percentage={8} flag="🇩🇪" />
                  <GeographicItem country="Australia" percentage={7} flag="🇦🇺" />
                  <GeographicItem country="Other" percentage={10} flag="🌍" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

function TimeRangeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
        active 
          ? 'bg-purple-500 text-white' 
          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
      }`}
    >
      {children}
    </button>
  );
}

interface EngagementMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  color: string;
}

function EngagementMetricCard({ icon, label, value, change, color }: EngagementMetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className={`flex items-center gap-2 ${color} mb-3`}>
        {icon}
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl text-zinc-100 mb-1">{value}</div>
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        <span>{Math.abs(change)}%</span>
        <span className="text-zinc-500 ml-1">vs last period</span>
      </div>
    </Card>
  );
}

function TimeSlotCard({ time, engagement, label }: { time: string; engagement: string; label: string }) {
  return (
    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
      <div className="text-sm text-zinc-400 mb-1">{label}</div>
      <div className="text-xl text-zinc-100 mb-1">{time}</div>
      <div className="text-sm text-green-400">{engagement} engagement</div>
    </div>
  );
}

function ContentTypeCard({ type, engagement, posts }: { type: string; engagement: number; posts: number }) {
  return (
    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
      <div>
        <div className="text-sm text-zinc-100 mb-1">{type}</div>
        <div className="text-xs text-zinc-500">{posts} posts</div>
      </div>
      <div className="text-right">
        <div className="text-lg text-purple-400">{engagement}%</div>
        <div className="text-xs text-zinc-500">engagement</div>
      </div>
    </div>
  );
}

interface TopPostCardProps {
  rank: number;
  platform: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagement: number;
}

function TopPostCard({ rank, platform, content, likes, comments, shares, impressions, engagement }: TopPostCardProps) {
  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">#{rank}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-400">{platform}</span>
            <span className="text-xs text-green-400">{engagement}% engagement</span>
          </div>
          <p className="text-sm text-zinc-300 mb-4">{content}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Likes</div>
          <div className="text-sm text-zinc-100">{likes.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Comments</div>
          <div className="text-sm text-zinc-100">{comments}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Shares</div>
          <div className="text-sm text-zinc-100">{shares}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Impressions</div>
          <div className="text-sm text-zinc-100">{impressions.toLocaleString()}</div>
        </div>
      </div>
    </Card>
  );
}

function DemographicBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-100">{percentage}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function GeographicItem({ country, percentage, flag }: { country: string; percentage: number; flag: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <span className="text-sm text-zinc-100">{country}</span>
      </div>
      <span className="text-sm text-zinc-400">{percentage}%</span>
    </div>
  );
}
