import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { configService } from '../services/config-service';
import type { AppConfig } from '../services/config-service';

interface ConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigurationModal({ open, onOpenChange }: ConfigurationModalProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<AppConfig>(configService.getConfig());

  useEffect(() => {
    if (open) {
      setConfig(configService.getConfig());
    }
  }, [open]);

  const handleSave = () => {
    configService.updateConfig(config);
    toast.success('Configuration saved', {
      description: 'Your settings have been updated',
    });
    onOpenChange(false);
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateLLMConfig = (key: keyof AppConfig['llm'], value: any) => {
    setConfig(prev => ({
      ...prev,
      llm: { ...prev.llm, [key]: value }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
          <DialogDescription>
            Configure LLM providers, services, and automation settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="llm" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="llm">LLM APIs</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-6 mt-6">
            <APIKeySection 
              title="Groq"
              description="Fast LLM inference"
              apiKeyId="groq"
              endpoint="https://api.groq.com/openai/v1"
              showKey={showKeys.groq}
              onToggleVisibility={() => toggleKeyVisibility('groq')}
              value={config.llm.groqApiKey}
              onChange={(value) => updateLLMConfig('groqApiKey', value)}
            />
            
            <Separator />
            
            <APIKeySection 
              title="Google Gemini"
              description="Gemini Pro models"
              apiKeyId="gemini"
              endpoint="https://generativelanguage.googleapis.com"
              showKey={showKeys.gemini}
              onToggleVisibility={() => toggleKeyVisibility('gemini')}
              value={config.llm.geminiApiKey}
              onChange={(value) => updateLLMConfig('geminiApiKey', value)}
            />
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h3 className="mb-1">LM Studio (Local)</h3>
                <p className="text-sm text-zinc-400">Local model inference</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lmstudio-endpoint">Endpoint</Label>
                <Input 
                  id="lmstudio-endpoint" 
                  placeholder="http://localhost:1234/v1" 
                  defaultValue="http://localhost:1234/v1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lmstudio-enabled">Enable LM Studio</Label>
                  <p className="text-sm text-zinc-400">Use local models for generation</p>
                </div>
                <Switch id="lmstudio-enabled" defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-1">Puppeteer Service</h3>
                <p className="text-sm text-zinc-400">Browser automation settings</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="puppeteer-debug">Debug Port</Label>
                  <Input id="puppeteer-debug" defaultValue="9222" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puppeteer-host">Host</Label>
                  <Input id="puppeteer-host" defaultValue="localhost" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="headless">Headless Mode</Label>
                  <p className="text-sm text-zinc-400">Run browser without GUI</p>
                </div>
                <Switch id="headless" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-1">LLM Gateway</h3>
                <p className="text-sm text-zinc-400">FastAPI service configuration</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gateway-endpoint">Gateway Endpoint</Label>
                <Input 
                  id="gateway-endpoint" 
                  placeholder="http://localhost:8000" 
                  defaultValue="http://localhost:8000"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-fallback">Auto Fallback</Label>
                  <p className="text-sm text-zinc-400">Automatically switch providers on failure</p>
                </div>
                <Switch id="auto-fallback" defaultChecked />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-1">MCP Server</h3>
                <p className="text-sm text-zinc-400">Tool orchestration service</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mcp-endpoint">MCP Endpoint</Label>
                <Input 
                  id="mcp-endpoint" 
                  placeholder="http://localhost:3003" 
                  defaultValue="http://localhost:3003"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <APIKeySection 
              title="Twitter/X"
              description="Twitter API v2 credentials"
              apiKeyId="twitter"
              endpoint="https://api.twitter.com/2"
              showKey={showKeys.twitter}
              onToggleVisibility={() => toggleKeyVisibility('twitter')}
              additionalFields={[
                { label: 'API Key', id: 'twitter-key' },
                { label: 'API Secret', id: 'twitter-secret' },
                { label: 'Access Token', id: 'twitter-token' },
                { label: 'Access Token Secret', id: 'twitter-token-secret' },
              ]}
            />

            <Separator />

            <APIKeySection 
              title="LinkedIn"
              description="LinkedIn API credentials"
              apiKeyId="linkedin"
              endpoint="https://api.linkedin.com/v2"
              showKey={showKeys.linkedin}
              onToggleVisibility={() => toggleKeyVisibility('linkedin')}
              additionalFields={[
                { label: 'Client ID', id: 'linkedin-client' },
                { label: 'Client Secret', id: 'linkedin-secret' },
              ]}
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-1">Posting Schedule</h3>
                <p className="text-sm text-zinc-400">Configure automated posting times</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-frequency">Post Frequency (hours)</Label>
                  <Input id="post-frequency" type="number" defaultValue="4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posts-per-day">Max Posts Per Day</Label>
                  <Input id="posts-per-day" type="number" defaultValue="6" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-post">Auto-posting</Label>
                  <p className="text-sm text-zinc-400">Automatically post generated content</p>
                </div>
                <Switch id="auto-post" defaultChecked />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-1">Content Generation</h3>
                <p className="text-sm text-zinc-400">AI content creation settings</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-provider">Primary Provider</Label>
                <select 
                  id="primary-provider" 
                  className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
                  defaultValue="groq"
                >
                  <option value="groq">Groq (Fastest)</option>
                  <option value="openai">OpenAI (Highest Quality)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="lmstudio">LM Studio (Local)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="research-mode">Research Mode</Label>
                  <p className="text-sm text-zinc-400">Browse web for content ideas</p>
                </div>
                <Switch id="research-mode" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hashtag-gen">Auto-generate Hashtags</Label>
                  <p className="text-sm text-zinc-400">Add relevant hashtags to posts</p>
                </div>
                <Switch id="hashtag-gen" defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-800">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface APIKeySectionProps {
  title: string;
  description: string;
  apiKeyId: string;
  endpoint?: string;
  showKey?: boolean;
  onToggleVisibility?: () => void;
  additionalFields?: Array<{ label: string; id: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

function APIKeySection({ 
  title, 
  description, 
  apiKeyId, 
  endpoint,
  showKey, 
  onToggleVisibility,
  additionalFields,
  value,
  onChange 
}: APIKeySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      
      {additionalFields ? (
        <div className="space-y-3">
          {additionalFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <div className="relative">
                <Input 
                  id={field.id}
                  type={showKey ? 'text' : 'password'}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
                <button
                  type="button"
                  onClick={onToggleVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`${apiKeyId}-key`}>API Key</Label>
          <div className="relative">
            <Input 
              id={`${apiKeyId}-key`}
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
            />
            <button
              type="button"
              onClick={onToggleVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      
      {endpoint && (
        <div className="space-y-2">
          <Label htmlFor={`${apiKeyId}-endpoint`}>Endpoint</Label>
          <Input 
            id={`${apiKeyId}-endpoint`}
            defaultValue={endpoint}
            placeholder="https://..."
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor={`${apiKeyId}-enabled`}>Enable {title}</Label>
          <p className="text-sm text-zinc-400">Use this provider for generation</p>
        </div>
        <Switch id={`${apiKeyId}-enabled`} defaultChecked />
      </div>
    </div>
  );
}
