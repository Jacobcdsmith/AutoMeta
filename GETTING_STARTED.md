# Getting Started with AutoMeta

This guide will help you set up and run AutoMeta in under 5 minutes.

## Step 1: Prerequisites

Ensure you have installed:
- **Docker Desktop** (v20.10 or later)
- **Docker Compose** (v2.0 or later)

Optional:
- LM Studio (for local LLM inference)
- API keys from LLM providers

## Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/AutoMeta.git
cd AutoMeta
```

## Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env  # or vim, code, etc.
```

### Minimum Configuration

For testing without API keys, just use LM Studio:

```bash
# Install LM Studio from https://lmstudio.ai
# Download a model (e.g., llama-3.1-8b)
# Start the local server (default port 1234)
```

The stack will try LM Studio first, so you can test without any cloud API keys!

### With Cloud Providers

Add at least one of these to your `.env`:

```bash
# Groq (recommended for testing - fast and generous free tier)
GROQ_API_KEY=gsk_your_api_key_here

# OR Gemini (good free tier)
GEMINI_API_KEY=your_api_key_here

# OR OpenRouter (pay per use, access to many models)
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

## Step 4: Start the Stack

```bash
cd docker
docker-compose up -d
```

This will start:
- **LLM Gateway** on port 8000
- **Puppeteer Runner** on port 3000 (API) and 9222 (debugging)
- **MCP Server** on port 3003

## Step 5: Verify Services

```bash
# Check all services are running
docker-compose ps

# Check LLM Gateway health
curl http://localhost:8000/health

# Check which providers are available
curl http://localhost:8000/health | jq
```

Expected output:
```json
{
  "status": "healthy",
  "providers": {
    "groq": true,
    "gemini": false,
    "openrouter": false,
    "lmstudio": true
  }
}
```

## Step 6: Test Content Generation

```bash
# Generate a tweet
curl -X POST http://localhost:8000/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a tweet about the benefits of automation",
    "platform": "twitter"
  }' | jq
```

Expected output:
```json
{
  "content": "Automation isn't about replacing humans—it's about freeing us from repetitive tasks so we can focus on what truly matters: creativity, strategy, and innovation. Let the machines handle the mundane! 🤖✨ #Automation #Productivity",
  "provider": "groq",
  "model": "llama-3.1-70b-versatile"
}
```

## Step 7: Test Browser Automation (Optional)

**Note**: The automation currently has placeholder selectors. You'll need to implement actual platform-specific selectors for real posting.

```bash
curl -X POST http://localhost:3000/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobId": "test-001",
    "platforms": ["twitter"],
    "prompt": "Write about AI advances",
    "credentials": {
      "twitter": {
        "username": "your_username",
        "password": "your_password"
      }
    }
  }'
```

## Step 8: Monitor and Debug

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f llm-gateway
docker-compose logs -f puppeteer-runner
```

### Remote Browser Debugging

Connect Chrome DevTools to the Puppeteer instance:

1. Open Chrome
2. Navigate to `chrome://inspect`
3. Click "Configure" and add `localhost:9222`
4. You'll see the remote Chrome instance appear

Or directly: http://localhost:9222

## Common Tasks

### Restart a Service

```bash
docker-compose restart llm-gateway
```

### Stop All Services

```bash
docker-compose down
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build
```

### Check Resource Usage

```bash
docker stats
```

## Next Steps

1. **Customize workflows** in `src/mcp/workflows.json`
2. **Add platform selectors** in `src/automation/poster.js`
3. **Build the frontend** in the `figma-make/` directory
4. **Set up scheduling** via MCP workflows
5. **Add more LLM providers** as needed

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs [service-name]

# Rebuild
docker-compose up -d --build
```

### LLM Gateway returns 503

All providers are down or misconfigured. Check:
- API keys in `.env`
- LM Studio is running (if using local)
- Network connectivity

```bash
curl http://localhost:8000/health
```

### Puppeteer crashes

Increase shared memory:

```yaml
# In docker-compose.yml (already configured)
shm_size: '2gb'
```

### Can't connect to LM Studio

On Mac/Windows, use:
```bash
LMSTUDIO_URL=http://host.docker.internal:1234/v1
```

On Linux, use:
```bash
LMSTUDIO_URL=http://172.17.0.1:1234/v1
```

## Getting Help

- Check logs: `docker-compose logs -f`
- Verify configuration: `cat .env`
- Test providers individually: `curl http://localhost:8000/health`
- Open an issue: https://github.com/yourusername/AutoMeta/issues

## What's Next?

You now have a working automation stack! Time to:
- Design your workflows
- Build the frontend UI
- Automate your social media presence
- Scale your content creation

Happy automating!
