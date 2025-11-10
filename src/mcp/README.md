# MCP Integration

This directory contains configuration for the Model Context Protocol (MCP) server that orchestrates the AutoMeta automation stack.

## Files

- **workflows.json** - Defines automated workflows for social media posting
- **tools.json** - Tool definitions for LLM gateway and Puppeteer runner

## Workflows

### social-post-workflow
Simple workflow that generates content and posts to specified platforms.

### multi-platform-campaign
Advanced workflow that generates platform-specific content and posts in parallel.

## Tool Orchestration

The MCP server coordinates between:
1. **llm-gateway** - Content generation with multi-provider fallback
2. **puppeteer-runner** - Browser automation for posting

## Usage

Mount this directory as `/app/config` in the MCP server container (already configured in docker-compose.yml).

## Future Enhancements

- Add scheduling capabilities
- Implement retry logic
- Add analytics collection
- Support more platforms
- Add content moderation hooks
