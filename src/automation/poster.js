const puppeteer = require('puppeteer-core');
const axios = require('axios');
const express = require('express');

const LLM_GATEWAY_URL = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:8000';
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://mcp-server:3003';

/**
 * Initialize browser with remote debugging
 */
async function initBrowser() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=0.0.0.0'
    ]
  });

  console.log('Browser launched with remote debugging on port 9222');
  return browser;
}

/**
 * Generate content using LLM gateway
 */
async function generateContent(prompt, platform = 'twitter') {
  try {
    const response = await axios.post(`${LLM_GATEWAY_URL}/generate`, {
      prompt,
      platform,
      max_tokens: 500
    });

    return response.data.content;
  } catch (error) {
    console.error('Failed to generate content:', error.message);
    throw error;
  }
}

/**
 * Notify MCP server of job status
 */
async function notifyMCP(jobId, status, data = {}) {
  try {
    await axios.post(`${MCP_SERVER_URL}/job-status`, {
      jobId,
      status,
      timestamp: new Date().toISOString(),
      ...data
    });
  } catch (error) {
    console.error('Failed to notify MCP:', error.message);
  }
}

/**
 * Post to Twitter
 * Note: Selectors are placeholders - implement based on actual Twitter UI
 */
async function postToTwitter(browser, content, credentials) {
  const page = await browser.newPage();

  try {
    console.log('Navigating to Twitter...');
    await page.goto('https://twitter.com/login');

    // Login flow - implement with actual selectors
    console.log('Logging in...');
    // await page.type('[name="username"]', credentials.username);
    // await page.type('[name="password"]', credentials.password);
    // await page.click('[data-testid="LoginForm_Login_Button"]');
    // await page.waitForNavigation();

    // Post tweet - implement with actual selectors
    console.log('Posting tweet...');
    // await page.click('[data-testid="SideNav_NewTweet_Button"]');
    // await page.type('[data-testid="tweetTextarea_0"]', content);
    // await page.click('[data-testid="tweetButton"]');

    console.log('Tweet posted successfully');
    return { success: true, platform: 'twitter' };
  } catch (error) {
    console.error('Twitter posting failed:', error.message);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Post to LinkedIn
 * Note: Selectors are placeholders - implement based on actual LinkedIn UI
 */
async function postToLinkedIn(browser, content, credentials) {
  const page = await browser.newPage();

  try {
    console.log('Navigating to LinkedIn...');
    await page.goto('https://www.linkedin.com/login');

    // Login flow - implement with actual selectors
    console.log('Logging in...');
    // await page.type('#username', credentials.username);
    // await page.type('#password', credentials.password);
    // await page.click('[type="submit"]');
    // await page.waitForNavigation();

    // Post update - implement with actual selectors
    console.log('Posting to LinkedIn...');
    // await page.click('[data-control-name="share_article"]');
    // await page.type('.ql-editor', content);
    // await page.click('[data-control-name="share.post"]');

    console.log('LinkedIn post published successfully');
    return { success: true, platform: 'linkedin' };
  } catch (error) {
    console.error('LinkedIn posting failed:', error.message);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Main automation workflow
 */
async function runAutomation(config) {
  const { jobId, platforms, prompt, credentials } = config;

  let browser;

  try {
    await notifyMCP(jobId, 'started');

    // Generate content
    console.log('Generating content...');
    const content = await generateContent(prompt, platforms[0]);
    console.log('Generated content:', content);

    // Initialize browser
    browser = await initBrowser();

    const results = [];

    // Post to each platform
    for (const platform of platforms) {
      try {
        let result;

        if (platform === 'twitter' && credentials.twitter) {
          result = await postToTwitter(browser, content, credentials.twitter);
        } else if (platform === 'linkedin' && credentials.linkedin) {
          result = await postToLinkedIn(browser, content, credentials.linkedin);
        } else {
          console.log(`Skipping ${platform} - no credentials or unsupported`);
          continue;
        }

        results.push(result);
      } catch (error) {
        console.error(`Failed to post to ${platform}:`, error.message);
        results.push({ success: false, platform, error: error.message });
      }
    }

    await notifyMCP(jobId, 'completed', { results });

    return results;
  } catch (error) {
    console.error('Automation failed:', error.message);
    await notifyMCP(jobId, 'failed', { error: error.message });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Health check server
 */
function startHealthServer() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'puppeteer-runner' });
  });

  app.post('/run', async (req, res) => {
    try {
      const results = await runAutomation(req.body);
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const port = 3000;
  app.listen(port, () => {
    console.log(`Puppeteer runner listening on port ${port}`);
  });
}

// Start server
startHealthServer();

// Export for testing
module.exports = {
  initBrowser,
  generateContent,
  postToTwitter,
  postToLinkedIn,
  runAutomation
};
