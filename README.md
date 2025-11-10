# AutoMeta

**AI-powered social media automation stack with multi-provider LLM support**

AutoMeta is a containerized automation platform that generates content using various LLM providers and posts to social media platforms using browser automation.

## Architecture

```
┌─────────────────┐
│  Figma Make UI  │  ← Frontend (in development)
└────────┬────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                   │
┌───▼────────┐              ┌──────────▼─────┐
│ LLM Gateway│◄─────────────┤ MCP Server     │
│            │              │ (Orchestrator) │
│ • Groq     │              └────────┬───────┘
│ • Gemini   │                       │
│ • OpenRouter                       │
│ • LM Studio│              ┌────────▼────────┐
└────────────┘              │ Puppeteer Runner│
                            │                 │
                            │ • Twitter       │
                            │ • LinkedIn      │
                            └─────────────────┘
```

## Features

### LLM Gateway
- **Multi-provider support**: Groq, Gemini, OpenRouter, LM Studio
- **Auto-fallback**: Automatically switches providers if one fails
- **Priority routing**: Local-first, then cloud providers
- **Health monitoring**: Real-time provider status checking

### Puppeteer Runner
- **Browser automation**: Posts to social platforms
- **Remote debugging**: Chrome debugging on port 9222
- **Platform support**: Twitter, LinkedIn (extensible)
- **MCP integration**: Job status reporting

### MCP Server
- **Workflow orchestration**: Define multi-step automation workflows
- **Tool coordination**: Manages LLM and Puppeteer services
- **Scheduling**: Cron-based and webhook triggers

## Quick Start

### Prerequisites
- Docker and Docker Compose
- API keys for your chosen LLM providers (optional)
- Social media credentials (for posting)

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/AutoMeta.git
cd AutoMeta
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Services

```bash
cd docker
docker-compose up -d
```

### 4. Verify Services

```bash
# Check LLM Gateway
curl http://localhost:8000/health

# Check Puppeteer Runner
curl http://localhost:3000/health

# Check MCP Server
curl http://localhost:3003/health
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Groq Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# LM Studio (local)
LMSTUDIO_URL=http://host.docker.internal:1234/v1
LMSTUDIO_MODEL=local-model

# Other
LOG_LEVEL=info
```

### Provider Priority

By default, providers are tried in this order:
1. **LM Studio** (local, free)
2. **Groq** (fast, cheap)
3. **Gemini** (good quality)
4. **OpenRouter** (most flexible)

## API Usage

### Generate Content

```bash
curl -X POST http://localhost:8000/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write about the future of AI",
    "platform": "twitter",
    "max_tokens": 280
  }'
```

### Run Automation

```bash
curl -X POST http://localhost:3000/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobId": "test-001",
    "platforms": ["twitter"],
    "prompt": "Share an interesting tech fact",
    "credentials": {
      "twitter": {
        "username": "your_username",
        "password": "your_password"
      }
    }
  }'
```

## Development

### Project Structure

```
AutoMeta/
├── docker/
│   ├── docker-compose.yml      # Service orchestration
│   ├── puppeteer/              # Puppeteer container config
│   └── llm-gateway/            # LLM gateway container config
├── src/
│   ├── automation/
│   │   └── poster.js           # Puppeteer automation script
│   ├── llm/
│   │   └── gateway.py          # Multi-provider LLM gateway
│   └── mcp/
│       ├── workflows.json      # Workflow definitions
│       └── tools.json          # Tool configurations
└── figma-make/                 # Frontend UI (coming soon)
```

### Adding a New LLM Provider

1. Create a provider class in `src/llm/gateway.py`
2. Implement `generate()` and `check_health()` methods
3. Add to `providers` dict and `PROVIDER_PRIORITY`
4. Add environment variables to docker-compose.yml

### Adding a New Platform

1. Add platform credentials to config
2. Implement posting function in `src/automation/poster.js`
3. Add platform-specific selectors (update as platforms change)
4. Update platform context in LLM gateway

## Remote Debugging

Connect to Chrome DevTools at: `chrome://inspect` or `http://localhost:9222`

## Security Notes

- **Never commit credentials** - Use .env files (gitignored)
- **Rotate API keys** regularly
- **Use environment-specific configs** for production
- **Platform selectors change** - Update automation scripts as needed

## Monitoring

All services expose `/health` endpoints:
- LLM Gateway: http://localhost:8000/health
- Puppeteer: http://localhost:3000/health
- MCP Server: http://localhost:3003/health

## Troubleshooting

### LLM Gateway Issues
```bash
# Check provider status
curl http://localhost:8000/health

# View logs
docker logs autometa-llm-gateway
```

### Puppeteer Issues
```bash
# Check service health
curl http://localhost:3000/health

# Connect to remote debugging
open chrome://inspect

# View logs
docker logs autometa-puppeteer
```

### Provider Fallback
If your preferred provider fails, the gateway automatically tries the next available provider in priority order.

## Roadmap

- [ ] Add more social platforms (Facebook, Instagram, TikTok)
- [ ] Implement scheduling UI
- [ ] Add analytics and reporting
- [ ] Content moderation hooks
- [ ] Multi-account support
- [ ] A/B testing capabilities
- [ ] Figma Make frontend implementation

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests if applicable
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Issues: https://github.com/yourusername/AutoMeta/issues
- Docs: Coming soon

---

Built with:
- [Puppeteer](https://pptr.dev/) for browser automation
- [FastAPI](https://fastapi.tiangolo.com/) for the LLM gateway
- [Docker](https://www.docker.com/) for containerization
- [MCP](https://github.com/docker/mcp-server) for orchestration

**Building it back to front** - Backend ready, frontend coming from Figma!
