# MCP Integration Documentation

This document outlines all the backend integration points for the Agentic Media Poster application. All services are ready to connect to real backend implementations.

## Architecture Overview

The application connects to multiple backend services:

1. **MCP Server** (port 3003) - Model Context Protocol for tool orchestration
2. **Puppeteer Service** (port 9222) - Browser automation via Chrome DevTools Protocol  
3. **LLM Gateway** (port 8000) - FastAPI service for analytics, social media, and activity logging
4. **LLM Providers** - Direct connections to Groq, Gemini, OpenAI, etc.

## Service Implementations

### 1. MCP Service (`/services/mcp-service.ts`)

**WebSocket Connection:**
- Endpoint: `ws://localhost:3003/ws`
- Real-time tool execution updates
- Event-driven architecture

**REST API Endpoints:**
```
GET  /api/status          - Get server status and available tools
GET  /api/tools           - List all available MCP tools
POST /api/tools/execute   - Execute a specific tool
POST /api/workflows/{id}/execute - Execute a workflow
```

**Events Emitted:**
- `connection` - Connection status changes
- `error` - Error events
- Custom events from tool executions

### 2. Puppeteer Service (`/services/puppeteer-service.ts`)

**WebSocket Connection:**
- Endpoint: Retrieved from `http://localhost:9222/json/version`
- Chrome DevTools Protocol for real-time browser events
- Page navigation, loading events

**REST API Endpoints:**
```
POST   /api/navigate          - Navigate to URL
POST   /api/screenshot        - Capture screenshot
GET    /api/state             - Get current browser state
POST   /api/interact          - Interact with page elements
POST   /api/execute           - Execute JavaScript
GET    /api/tabs              - Get all tabs
POST   /api/tabs              - Create new tab
POST   /api/tabs/{id}/activate - Switch to tab
DELETE /api/tabs/{id}         - Close tab
```

**Expected Response Formats:**

**Screenshot Response:**
```json
{
  "screenshot": "base64_encoded_image_data"
}
```

**Browser State Response:**
```json
{
  "url": "https://twitter.com",
  "title": "Twitter",
  "isLoading": false,
  "tabs": [
    {
      "id": "tab_123",
      "title": "Tab Title",
      "url": "https://example.com",
      "favicon": "https://example.com/favicon.ico"
    }
  ],
  "activeTabId": "tab_123"
}
```

### 3. Analytics Service (`/services/analytics-service.ts`)

**WebSocket Connection:**
- Endpoint: `ws://localhost:8000/ws/analytics`
- Real-time metrics updates

**REST API Endpoints:**
```
GET /api/analytics/engagement           - Get engagement metrics
GET /api/analytics/timeseries          - Get time series data
GET /api/analytics/platforms           - Get platform metrics
GET /api/analytics/posts/top           - Get top performing posts
GET /api/analytics/audience/growth     - Get audience growth data
GET /api/analytics/demographics        - Get demographic data
GET /api/analytics/content/performance - Get content type performance
GET /api/analytics/posting-times       - Get best posting times
GET /api/analytics/export              - Export analytics data
```

**Query Parameters:**
- `start` - Start timestamp (milliseconds)
- `end` - End timestamp (milliseconds)
- `platform` - Filter by platform (twitter, linkedin, facebook)
- `metric` - Specific metric to query
- `granularity` - Data granularity (hour, day, week, month)
- `limit` - Result limit
- `offset` - Pagination offset
- `format` - Export format (json, csv)

**Expected Response Formats:**

**Engagement Metrics:**
```json
{
  "likes": 12400,
  "comments": 2847,
  "shares": 1923,
  "impressions": 145000,
  "reach": 89200,
  "engagementRate": 5.8
}
```

**Time Series Data:**
```json
[
  {
    "timestamp": 1704067200000,
    "value": 245,
    "metric": "likes"
  }
]
```

**Platform Metrics:**
```json
[
  {
    "platform": "twitter",
    "engagement": 4.8,
    "reach": 12500,
    "posts": 45,
    "followers": 4589
  }
]
```

**Top Posts:**
```json
[
  {
    "id": "post_123",
    "platform": "twitter",
    "content": "Post content here...",
    "timestamp": 1704067200000,
    "metrics": {
      "likes": 1247,
      "comments": 89,
      "shares": 156,
      "impressions": 12450,
      "reach": 8900,
      "engagementRate": 8.4
    },
    "hashtags": ["AI", "Tech"]
  }
]
```

### 4. Social Media Service (`/services/social-media-service.ts`)

**WebSocket Connection:**
- Endpoint: `ws://localhost:8000/ws/social`
- Real-time post status updates

**REST API Endpoints:**
```
GET    /api/social/posts                    - Get posts
POST   /api/social/posts                    - Create post
GET    /api/social/posts/{id}               - Get specific post
PATCH  /api/social/posts/{id}               - Update post
DELETE /api/social/posts/{id}               - Delete post
POST   /api/social/posts/{id}/publish       - Publish post
POST   /api/social/posts/{id}/schedule      - Schedule post
GET    /api/social/connections              - Get platform connections
POST   /api/social/connections/{platform}   - Connect platform
DELETE /api/social/connections/{platform}   - Disconnect platform
GET    /api/social/connections/{platform}/test - Test connection
GET    /api/social/schedule                 - Get posting schedule
PATCH  /api/social/schedule                 - Update schedule
POST   /api/social/media/upload             - Upload media
```

**Expected Response Formats:**

**Post Object:**
```json
{
  "id": "post_123",
  "platform": "twitter",
  "content": "Post content with #hashtags",
  "hashtags": ["AI", "Tech"],
  "media": [
    {
      "type": "image",
      "url": "https://cdn.example.com/image.jpg",
      "altText": "Description"
    }
  ],
  "scheduledFor": 1704067200000,
  "status": "scheduled",
  "postedAt": null,
  "metrics": {
    "likes": 0,
    "comments": 0,
    "shares": 0,
    "impressions": 0
  }
}
```

**Platform Connection:**
```json
{
  "platform": "twitter",
  "connected": true,
  "username": "example_user",
  "profileUrl": "https://twitter.com/example_user",
  "followerCount": 1234,
  "lastSync": 1704067200000
}
```

### 5. Activity Service (`/services/activity-service.ts`)

**WebSocket Connection:**
- Endpoint: `ws://localhost:8000/ws/activity`
- Real-time activity stream

**REST API Endpoints:**
```
GET    /api/activity/events    - Get activity events
POST   /api/activity/events    - Log new activity
DELETE /api/activity/events    - Clear activities
GET    /api/activity/metrics   - Get system metrics
GET    /api/activity/export    - Export activity log
```

**Expected Response Formats:**

**Activity Event:**
```json
{
  "id": "event_123",
  "timestamp": 1704067200000,
  "type": "success",
  "category": "llm",
  "message": "Generated content using Groq API",
  "metadata": {
    "provider": "groq",
    "tokensUsed": 450,
    "responseTime": 420
  }
}
```

**System Metrics:**
```json
{
  "cpu": 45.2,
  "memory": 62.8,
  "network": {
    "in": 1024000,
    "out": 512000
  },
  "activeConnections": 5,
  "requestsPerMinute": 142
}
```

### 6. LLM Service (`/services/llm-service.ts`)

Direct API connections to LLM providers:

**Groq:**
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile`
- Authentication: Bearer token

**Gemini:**
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Authentication: API key in URL parameter

## WebSocket Event Formats

### MCP Events
```json
{
  "type": "tool_execution",
  "toolId": "browser_navigate",
  "status": "completed",
  "result": { ... }
}
```

### Puppeteer Events
```json
{
  "method": "Page.loadEventFired",
  "params": { ... }
}
```

### Analytics Events
```json
{
  "type": "metrics_update",
  "metrics": {
    "engagement": 5.8,
    "timestamp": 1704067200000
  }
}
```

### Social Media Events
```json
{
  "type": "post_status",
  "postId": "post_123",
  "status": "published",
  "platform": "twitter"
}
```

### Activity Events
```json
{
  "type": "activity",
  "event": {
    "id": "event_123",
    "timestamp": 1704067200000,
    "type": "success",
    "category": "browser",
    "message": "Navigated to Twitter"
  }
}
```

## Configuration

All service endpoints can be configured via the Configuration Modal or directly in `config-service.ts`:

```typescript
{
  services: {
    puppeteerDebugPort: 9222,
    puppeteerHost: 'localhost',
    headlessMode: false,
    llmGatewayEndpoint: 'http://localhost:8000',
    mcpEndpoint: 'http://localhost:3003',
  }
}
```

## Error Handling

All services implement:
- Automatic reconnection for WebSocket connections
- Exponential backoff for failed requests
- Detailed error messages passed to UI
- Graceful degradation when services are unavailable

## Testing Connections

Use the Test LLM Connection component to verify:
- LLM provider connectivity
- API key validity
- Network accessibility

## Implementation Checklist

Backend developers should implement:

### MCP Server (port 3003)
- [ ] WebSocket server at `/ws`
- [ ] REST endpoints for tool management
- [ ] Tool execution engine
- [ ] Workflow orchestration

### Puppeteer Service (port 9222)
- [ ] Chrome DevTools Protocol integration
- [ ] Screenshot capture API
- [ ] Browser state management
- [ ] Tab management
- [ ] Element interaction API

### LLM Gateway (port 8000)
- [ ] Analytics data aggregation
- [ ] Social media post management
- [ ] Platform API integrations (Twitter, LinkedIn)
- [ ] Activity logging system
- [ ] Real-time WebSocket updates
- [ ] Data export functionality

## Security Considerations

- API keys stored in localStorage (not recommended for production)
- No authentication implemented on backend endpoints (add JWT/OAuth)
- CORS must be configured on backend services
- WebSocket connections should use wss:// in production
- Consider rate limiting on all endpoints

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement data persistence
- [ ] Add caching layer for analytics
- [ ] Support for additional social platforms
- [ ] Webhook support for external integrations
- [ ] Advanced workflow scheduling
- [ ] Multi-tenant support
