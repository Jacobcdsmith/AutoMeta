# Figma Make - Frontend UI

This directory is a placeholder for the Figma-designed frontend interface.

## Purpose

The Figma Make UI will provide a visual interface for:
- Configuring automation workflows
- Managing social media credentials
- Scheduling posts
- Monitoring job status
- Viewing analytics

## Backend Connection

The UI will connect to the backend services via:

### API Endpoints

**LLM Gateway** (`http://localhost:8000`)
- `POST /generate` - Generate content
- `GET /health` - Check provider status

**Puppeteer Runner** (`http://localhost:3000`)
- `POST /run` - Execute posting job
- `GET /health` - Check service health

**MCP Server** (`http://localhost:3003`)
- Workflow orchestration
- Job management
- Status monitoring

## Development Approach

"Building it back to front"
- Backend services are ready and running
- Frontend will be built in Figma and implemented to connect to these services
- API contracts are defined and stable

## Next Steps

1. Design UI/UX in Figma
2. Export Figma designs
3. Implement frontend (React/Vue/Svelte)
4. Connect to backend APIs
5. Add authentication
6. Deploy

## Tech Stack Suggestions

- **Framework**: React, Vue, or Svelte
- **Styling**: Tailwind CSS, styled-components
- **State Management**: Zustand, Pinia, or Context API
- **HTTP Client**: axios or fetch
- **Build Tool**: Vite
- **Deployment**: Vercel, Netlify, or Docker

## Mock API Integration

For frontend development before backend is fully ready:
```javascript
// Example API call structure
const generateContent = async (prompt, platform) => {
  const response = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, platform })
  });
  return response.json();
};

const postToSocial = async (config) => {
  const response = await fetch('http://localhost:3000/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
};
```
