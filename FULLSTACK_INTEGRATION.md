# Full Stack Integration Guide

**AutoMeta** is now a complete full-stack application with frontend and backend fully integrated!

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend (React)                          │
│                  http://localhost:3001                        │
│                                                               │
│  • Dashboard with browser viewer                             │
│  • Content generation UI                                     │
│  • LLM provider management                                   │
│  • Analytics and metrics                                     │
└────────────┬─────────────────────────────────────────────────┘
             │
             │  API Calls via Nginx Proxy
             │
       ┌─────┴────────┬────────────────┬────────────────┐
       │              │                │                │
   ┌───▼────┐   ┌────▼─────┐    ┌────▼─────┐   ┌─────▼──────┐
   │  LLM   │   │Puppeteer │    │   MCP    │   │  Chrome    │
   │Gateway │   │  Runner  │    │  Server  │   │ DevTools   │
   │ :8000  │   │  :3000   │    │  :3003   │   │  :9222     │
   └───┬────┘   └────┬─────┘    └────┬─────┘   └────────────┘
       │             │                 │
   ┌───▼─────────────▼─────────────────▼──────┐
   │  Multi-Provider LLM Integration           │
   │  • Groq                                   │
   │  • Gemini                                 │
   │  • OpenRouter                             │
   │  • LM Studio (local)                      │
   └───────────────────────────────────────────┘
```

## Services

### 1. Frontend (Port 3001)
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Features**:
  - Real-time browser viewer
  - Content generation interface
  - LLM provider status monitoring
  - Social media platform integration
  - Analytics dashboard
- **API Communication**: All backend requests proxied through Nginx

### 2. LLM Gateway (Port 8000)
- **Technology**: Python + FastAPI
- **Features**:
  - Multi-provider LLM routing
  - Auto-fallback on provider failure
  - Health monitoring
  - CORS enabled for frontend
- **Endpoints**:
  - `POST /generate` - Generate content
  - `GET /health` - Provider health status

### 3. Puppeteer Runner (Port 3000)
- **Technology**: Node.js + Puppeteer + Express
- **Features**:
  - Browser automation
  - Social media posting
  - Remote debugging
  - Extended REST API
- **Endpoints**:
  - `POST /run` - Run automation job
  - `POST /navigate` - Navigate browser
  - `POST /screenshot` - Take screenshot
  - `GET /state` - Get browser state
  - `POST /execute` - Execute JavaScript
  - `POST /interact` - Interact with elements

### 4. MCP Server (Port 3003)
- **Technology**: Docker MCP Server
- **Features**:
  - Workflow orchestration
  - Tool coordination
  - Job management

### 5. Chrome DevTools (Port 9222)
- **Feature**: Remote debugging
- **Access**: chrome://inspect or http://localhost:9222

## Quick Start

### Prerequisites
- Docker and Docker Compose
- At least one LLM API key (Groq, Gemini, OpenRouter, or LM Studio)

### 1. Clone and Configure

```bash
git clone <repository-url>
cd AutoMeta
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your API keys
nano .env
```

### 3. Start Full Stack

```bash
cd docker
docker compose up -d
```

This will start:
- ✅ Frontend at http://localhost:3001
- ✅ LLM Gateway at http://localhost:8000
- ✅ Puppeteer at http://localhost:3000
- ✅ MCP Server at http://localhost:3003
- ✅ Chrome DevTools at http://localhost:9222

### 4. Access the Application

Open your browser to: **http://localhost:3001**

## Development Workflow

### Frontend Development

For hot-reload frontend development:

```bash
# Terminal 1: Start backend services
cd docker
docker compose up llm-gateway puppeteer-runner mcp-server

# Terminal 2: Start frontend dev server
npm install
npm run dev
```

Frontend dev server will run on http://localhost:5173 with hot reload.

### Backend Development

Backend services auto-reload on file changes when running via Docker Compose with volume mounts.

## API Flow

### Content Generation Flow

```
Frontend
  ↓ POST /api/llm/generate
LLM Gateway
  ↓ Routes to provider
Groq/Gemini/OpenRouter/LM Studio
  ↓ Returns content
LLM Gateway (handles fallback)
  ↓ Response
Frontend (displays content)
```

### Browser Automation Flow

```
Frontend
  ↓ POST /api/puppeteer/run
Puppeteer Runner
  ↓ Calls LLM Gateway for content
  ↓ Launches browser
  ↓ Navigates to platform
  ↓ Posts content
  ↓ Notifies MCP Server
Frontend (shows results)
```

## Environment Variables

### Backend (.env in project root)
```bash
GROQ_API_KEY=your_key
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
LMSTUDIO_URL=http://host.docker.internal:1234/v1
```

### Frontend (handled by Vite)
Development: Uses `.env.development`
Production: Uses `.env.production`

## Service Communication

### Frontend → Backend
All API calls go through **Nginx reverse proxy**:
- `/api/llm/*` → LLM Gateway (port 8000)
- `/api/puppeteer/*` → Puppeteer Runner (port 3000)
- `/api/mcp/*` → MCP Server (port 3003)

### Backend Services
Services communicate via **Docker network** using service names:
- `http://llm-gateway:8000`
- `http://puppeteer-runner:3000`
- `http://mcp-server:3003`

## Testing the Integration

### 1. Test LLM Gateway
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "providers": {
    "groq": true,
    "gemini": false,
    "openrouter": false,
    "lmstudio": false
  }
}
```

### 2. Test Content Generation
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a tweet about AI",
    "platform": "twitter"
  }'
```

### 3. Test Puppeteer
```bash
curl http://localhost:3000/health
```

### 4. Test Frontend
Open http://localhost:3001 in your browser

## Monitoring

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f llm-gateway
docker compose logs -f puppeteer-runner
```

### Service Health Checks
All services have health checks that run every 30 seconds:
```bash
docker compose ps
```

Look for "healthy" status for all services.

## Troubleshooting

### Frontend shows "disconnected"
1. Check backend services are running: `docker compose ps`
2. Check backend logs: `docker compose logs llm-gateway`
3. Verify environment variables are set in `.env`

### LLM Gateway fails
1. Check API keys in `.env`
2. Test provider directly (e.g., Groq API)
3. Check logs: `docker compose logs llm-gateway`

### Puppeteer fails
1. Increase shared memory: Already set to 2GB in docker-compose.yml
2. Check Chrome is running: `curl http://localhost:9222/json/version`
3. Check logs: `docker compose logs puppeteer-runner`

### Port conflicts
If ports are already in use, edit `docker-compose.yml` to change:
- Frontend: `3001:80` → `<your_port>:80`
- LLM Gateway: `8000:8000` → `<your_port>:8000`
- Puppeteer: `3000:3000` → `<your_port>:3000`

## Production Deployment

### Build for Production
```bash
# Build all services
docker compose build

# Start in detached mode
docker compose up -d
```

### Environment Configuration
1. Update `.env` with production API keys
2. Set appropriate CORS origins in `src/llm/gateway.py`
3. Configure proper domain/SSL in nginx configuration

### Security Checklist
- [ ] Use environment-specific .env files
- [ ] Never commit API keys
- [ ] Set specific CORS origins (not "*")
- [ ] Use HTTPS in production
- [ ] Rotate API keys regularly
- [ ] Implement rate limiting
- [ ] Add authentication for social media credentials

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| State Management | React Hooks |
| UI Components | Radix UI, Shadcn |
| Backend Gateway | Python, FastAPI, Uvicorn |
| Automation | Node.js, Puppeteer, Express |
| Orchestration | MCP Server, Docker |
| LLM Providers | Groq, Gemini, OpenRouter, LM Studio |
| Web Server | Nginx (reverse proxy) |
| Container | Docker, Docker Compose |

## Next Steps

1. **Implement Platform Selectors**: Update `src/automation/poster.js` with real Twitter/LinkedIn selectors
2. **Add Authentication**: Implement secure credential storage
3. **Expand Platforms**: Add Facebook, Instagram, etc.
4. **Add Scheduling**: Implement cron-based posting
5. **Analytics**: Enhance metrics and reporting
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Set up automated builds and deployments

## Support

- **Documentation**: See README.md and GETTING_STARTED.md
- **Issues**: Open an issue on GitHub
- **Architecture**: See MCP_INTEGRATION.md for MCP details

---

**Built with love using Claude Code! 🤖**
Full-stack in one repository - backend to frontend integrated!
