"""
LLM Gateway with multi-provider support
Supports: Groq, Gemini, OpenRouter, and LM Studio (local)
Auto-fallback on provider failure
"""

import os
import httpx
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AutoMeta LLM Gateway")


class Provider(str, Enum):
    GROQ = "groq"
    GEMINI = "gemini"
    OPENROUTER = "openrouter"
    LMSTUDIO = "lmstudio"


class GenerateRequest(BaseModel):
    prompt: str
    platform: Optional[str] = "twitter"
    max_tokens: Optional[int] = 500
    temperature: Optional[float] = 0.7
    provider: Optional[Provider] = None  # None = auto-select with fallback


class GenerateResponse(BaseModel):
    content: str
    provider: str
    model: str


class HealthResponse(BaseModel):
    status: str
    providers: Dict[str, bool]


class LLMProvider:
    """Base provider class"""

    def __init__(self, name: str):
        self.name = name
        self.enabled = False

    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> tuple[str, str]:
        """Generate content. Returns (content, model_name)"""
        raise NotImplementedError

    async def check_health(self) -> bool:
        """Check if provider is available"""
        raise NotImplementedError


class GroqProvider(LLMProvider):
    """Groq API provider"""

    def __init__(self):
        super().__init__("groq")
        self.api_key = os.getenv("GROQ_API_KEY")
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        self.enabled = bool(self.api_key)

    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> tuple[str, str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content, self.model

    async def check_health(self) -> bool:
        if not self.enabled:
            return False
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=5.0
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Groq health check failed: {e}")
            return False


class GeminiProvider(LLMProvider):
    """Google Gemini provider"""

    def __init__(self):
        super().__init__("gemini")
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.enabled = bool(self.api_key)

        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)

    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> tuple[str, str]:
        generation_config = {
            "max_output_tokens": max_tokens,
            "temperature": temperature
        }

        response = await self.model.generate_content_async(
            prompt,
            generation_config=generation_config
        )

        return response.text, self.model_name

    async def check_health(self) -> bool:
        if not self.enabled:
            return False
        try:
            # Simple test generation
            test_response = await self.model.generate_content_async("test")
            return bool(test_response.text)
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return False


class OpenRouterProvider(LLMProvider):
    """OpenRouter provider"""

    def __init__(self):
        super().__init__("openrouter")
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")
        self.enabled = bool(self.api_key)

    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> tuple[str, str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/autometa",
                    "X-Title": "AutoMeta"
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content, self.model

    async def check_health(self) -> bool:
        if not self.enabled:
            return False
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=5.0
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"OpenRouter health check failed: {e}")
            return False


class LMStudioProvider(LLMProvider):
    """LM Studio local server provider"""

    def __init__(self):
        super().__init__("lmstudio")
        self.base_url = os.getenv("LMSTUDIO_URL", "http://localhost:1234/v1")
        self.model = os.getenv("LMSTUDIO_MODEL", "local-model")
        self.enabled = True  # Always try local

    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> tuple[str, str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content, self.model

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    timeout=5.0
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"LM Studio health check failed: {e}")
            return False


# Initialize providers
providers = {
    Provider.GROQ: GroqProvider(),
    Provider.GEMINI: GeminiProvider(),
    Provider.OPENROUTER: OpenRouterProvider(),
    Provider.LMSTUDIO: LMStudioProvider()
}

# Priority order for auto-fallback
PROVIDER_PRIORITY = [
    Provider.LMSTUDIO,    # Try local first
    Provider.GROQ,        # Fast and cheap
    Provider.GEMINI,      # Good quality
    Provider.OPENROUTER   # Most flexible
]


async def generate_with_fallback(
    prompt: str,
    max_tokens: int,
    temperature: float,
    preferred_provider: Optional[Provider] = None
) -> GenerateResponse:
    """Try to generate content with automatic fallback"""

    # Determine provider order
    if preferred_provider:
        provider_order = [preferred_provider] + [
            p for p in PROVIDER_PRIORITY if p != preferred_provider
        ]
    else:
        provider_order = PROVIDER_PRIORITY

    last_error = None

    for provider_type in provider_order:
        provider = providers[provider_type]

        if not provider.enabled:
            logger.info(f"Provider {provider_type} is disabled, skipping")
            continue

        try:
            logger.info(f"Attempting generation with {provider_type}")
            content, model = await provider.generate(prompt, max_tokens, temperature)

            return GenerateResponse(
                content=content,
                provider=provider_type,
                model=model
            )

        except Exception as e:
            logger.error(f"Provider {provider_type} failed: {e}")
            last_error = e
            continue

    # All providers failed
    raise HTTPException(
        status_code=503,
        detail=f"All LLM providers failed. Last error: {str(last_error)}"
    )


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """Generate content using LLM with auto-fallback"""

    # Enhance prompt with platform context
    platform_context = {
        "twitter": "Create a concise, engaging tweet (max 280 characters)",
        "linkedin": "Create a professional LinkedIn post (max 3000 characters)",
        "facebook": "Create a friendly, engaging Facebook post"
    }

    enhanced_prompt = f"{platform_context.get(request.platform, '')}\\n\\n{request.prompt}"

    return await generate_with_fallback(
        prompt=enhanced_prompt,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
        preferred_provider=request.provider
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    """Check health of all providers"""

    provider_status = {}

    for provider_type, provider in providers.items():
        provider_status[provider_type] = await provider.check_health()

    any_healthy = any(provider_status.values())

    return HealthResponse(
        status="healthy" if any_healthy else "degraded",
        providers=provider_status
    )


@app.get("/")
async def root():
    return {
        "service": "AutoMeta LLM Gateway",
        "version": "1.0.0",
        "providers": list(Provider)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
