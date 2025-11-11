import { TrendingUp, BarChart3, Clock, Zap, Activity, Users } from 'lucide-react';
import { Card } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function MetricsPanel() {
  const performanceData = [
    { name: 'Mon', posts: 4, engagement: 320 },
    { name: 'Tue', posts: 6, engagement: 450 },
    { name: 'Wed', posts: 5, engagement: 380 },
    { name: 'Thu', posts: 8, engagement: 620 },
    { name: 'Fri', posts: 7, engagement: 580 },
    { name: 'Sat', posts: 3, engagement: 240 },
    { name: 'Sun', posts: 4, engagement: 310 },
  ];

  const providerUsage = [
    { name: 'Groq', value: 85, color: '#8b5cf6' },
    { name: 'Gemini', value: 10, color: '#06b6d4' },
    { name: 'Fallback', value: 5, color: '#f59e0b' },
  ];

  const responseTimeData = [
    { time: '00:00', latency: 420 },
    { time: '04:00', latency: 380 },
    { time: '08:00', latency: 520 },
    { time: '12:00', latency: 650 },
    { time: '16:00', latency: 480 },
    { time: '20:00', latency: 390 },
  ];

  return (
    <div className="space-y-6 p-6 bg-zinc-950">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Posts Today"
          value="37"
          change="+12%"
          trend="up"
        />
        <MetricCard
          icon={<Activity className="w-4 h-4" />}
          label="Total Engagement"
          value="2.4K"
          change="+8%"
          trend="up"
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Avg Response"
          value="420ms"
          change="-15%"
          trend="down"
        />
        <MetricCard
          icon={<Zap className="w-4 h-4" />}
          label="Requests/hr"
          value="142"
          change="+22%"
          trend="up"
        />
        <MetricCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Success Rate"
          value="98.6%"
          change="+0.3%"
          trend="up"
        />
        <MetricCard
          icon={<Users className="w-4 h-4" />}
          label="Active Platforms"
          value="3"
          change="0%"
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Post Performance Chart */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Weekly Post Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5'
                }} 
              />
              <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="engagement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Response Time Chart */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            Response Time Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
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
                dataKey="latency" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Provider Distribution */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Provider Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={providerUsage}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {providerUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {providerUsage.map((provider) => (
              <div key={provider.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: provider.color }} />
                  <span className="text-zinc-400">{provider.name}</span>
                </div>
                <span className="text-zinc-100">{provider.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity Stats */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-sm mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <StatRow label="Total Requests" value="1,247" subtext="Last 24 hours" />
            <StatRow label="Failed Requests" value="18" subtext="1.4% failure rate" />
            <StatRow label="Avg. Processing" value="2.3s" subtext="Per request" />
            <StatRow label="Cache Hits" value="423" subtext="33.9% cache rate" />
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthIndicator label="API Status" status="operational" value="99.9%" />
            <HealthIndicator label="Browser Service" status="operational" value="Online" />
            <HealthIndicator label="LLM Gateway" status="operational" value="Active" />
            <HealthIndicator label="MCP Server" status="degraded" value="Slow" />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

function MetricCard({ icon, label, value, change, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-400';
  
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
      <div className="flex items-center gap-2 text-zinc-400 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl text-zinc-100">{value}</span>
        <span className={`text-xs ${trendColor}`}>{change}</span>
      </div>
    </Card>
  );
}

function StatRow({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm text-zinc-400">{label}</div>
        <div className="text-xs text-zinc-600 mt-0.5">{subtext}</div>
      </div>
      <div className="text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function HealthIndicator({ label, status, value }: { label: string; status: 'operational' | 'degraded' | 'down'; value: string }) {
  const statusColor = status === 'operational' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <span className="text-sm text-zinc-100">{value}</span>
    </div>
  );
}
