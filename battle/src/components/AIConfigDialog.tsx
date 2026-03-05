import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';

// API 预设配置
export const API_PRESETS = {
  moonshot: {
    name: 'Moonshot AI (Kimi)',
    apiUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    placeholder: 'sk-...'
  },
  claude: {
    name: 'Claude (Anthropic)',
    apiUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    placeholder: 'sk-ant-...'
  },
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    placeholder: 'sk-...'
  },
  google: {
    name: 'Google AI Studio',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-pro',
    placeholder: 'AIza...'
  },
  custom: {
    name: 'Custom',
    apiUrl: '',
    model: '',
    placeholder: ''
  }
};

export interface ApiConfig {
  preset: string;
  apiUrl: string;
  apiKey: string;
  model: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  preset: 'moonshot',
  apiUrl: 'https://api.moonshot.cn/v1',
  apiKey: '',
  model: 'moonshot-v1-8k'
};

interface AIConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ApiConfig;
  onConfigChange: (config: ApiConfig) => void;
}

export function AIConfigDialog({ open, onOpenChange, config, onConfigChange }: AIConfigDialogProps) {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handlePresetChange = (preset: string) => {
    const presetConfig = API_PRESETS[preset as keyof typeof API_PRESETS];
    setLocalConfig({
      ...localConfig,
      preset,
      apiUrl: presetConfig.apiUrl,
      model: presetConfig.model
    });
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Settings className="w-5 h-5 text-blue-400" />
            AI 配置
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">API Provider</Label>
            <Select
              value={localConfig.preset}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(API_PRESETS).map(([key, preset]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-slate-100 focus:bg-gray-700 focus:text-slate-100"
                  >
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">API URL</Label>
            <Input
              value={localConfig.apiUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
              placeholder={API_PRESETS[localConfig.preset as keyof typeof API_PRESETS]?.apiUrl || 'https://api.example.com/v1'}
              className="bg-gray-800 border-gray-700 text-slate-100 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Model</Label>
            <Input
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder={API_PRESETS[localConfig.preset as keyof typeof API_PRESETS]?.model || 'model-name'}
              className="bg-gray-800 border-gray-700 text-slate-100 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">API Key</Label>
            <Input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              placeholder={API_PRESETS[localConfig.preset as keyof typeof API_PRESETS]?.placeholder || 'your-api-key'}
              className="bg-gray-800 border-gray-700 text-slate-100 placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-slate-300 hover:bg-gray-800 hover:text-slate-100"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 加载保存的配置
export function loadSavedConfig(): ApiConfig {
  const saved = localStorage.getItem('battleApiConfig');
  if (saved) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse saved config:', e);
    }
  }
  return DEFAULT_CONFIG;
}

// 保存配置
export function saveConfig(config: ApiConfig) {
  try {
    localStorage.setItem('battleApiConfig', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}
