import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Send, Download, RotateCcw, Wand2, Zap, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIToolWorkspace() {
  const { tool: toolId } = useParams<{ tool: string }>();
  const { data: tool } = useQuery({ queryKey: ['tool', toolId], queryFn: () => mockApi.tools.getById(toolId || ''), enabled: !!toolId });
  const { data: generations } = useQuery({ queryKey: ['generations'], queryFn: () => mockApi.generations.getAll() });
  const { user } = useAuthStore();

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: (data: { toolType: string; prompt: string; parameters: Record<string, unknown> }) => mockApi.generations.create(data),
  });

  useEffect(() => {
    if (tool?.parameters) {
      const defaults: Record<string, string> = {};
      tool.parameters.forEach((p) => { if (p.default !== undefined) defaults[p.name] = String(p.default); });
      setParams(defaults);
    }
  }, [tool]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !toolId) return;
    setStatus('generating');
    setProgress(0);
    setOutput(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await generateMutation.mutateAsync({
        toolType: toolId,
        prompt,
        parameters: { ...params, negativePrompt: negativePrompt || undefined },
      });
      clearInterval(interval);
      setProgress(100);
      setStatus('complete');
      setOutput(result.outputUrl);
    } catch {
      clearInterval(interval);
      setStatus('idle');
    }
  };

  const toolGenerations = generations?.filter((g) => g.toolType === toolId).slice(0, 5) || [];

  const renderParamControl = (param: NonNullable<typeof tool>['parameters'][0]) => {
    switch (param.type) {
      case 'select':
        return (
          <select
            value={params[param.name] || ''}
            onChange={(e) => setParams((p) => ({ ...p, [param.name]: e.target.value }))}
            className="w-full h-10 px-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-button text-sm text-white focus:border-[#00D4FF] outline-none"
          >
            {param.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'slider':
        return (
          <div className="flex items-center gap-3">
            <input
              type="range" min={param.min} max={param.max}
              value={Number(params[param.name] || param.default || 0)}
              onChange={(e) => setParams((p) => ({ ...p, [param.name]: e.target.value }))}
              className="flex-1 accent-[#00D4FF]"
            />
            <span className="text-sm font-mono text-[#00D4FF] w-10 text-right">{params[param.name] || param.default}</span>
          </div>
        );
      case 'number':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={params[param.name] || ''}
              onChange={(e) => setParams((p) => ({ ...p, [param.name]: e.target.value }))}
              placeholder={param.description}
              className="flex-1 h-10 px-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-button text-sm text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none"
            />
            <button onClick={() => setParams((p) => ({ ...p, [param.name]: String(Math.floor(Math.random() * 1000000)) }))} className="px-3 h-10 glass-surface rounded-button text-[#8892B0] hover:text-white">
              <Wand2 size={14} />
            </button>
          </div>
        );
      case 'toggle':
        return (
          <button
            onClick={() => setParams((p) => ({ ...p, [param.name]: String(p[param.name] !== 'true') }))}
            className={cn('w-12 h-6 rounded-full transition-colors relative', params[param.name] === 'true' ? 'bg-[#00D4FF]' : 'bg-[#8892B0]/30')}
          >
            <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', params[param.name] === 'true' ? 'left-6' : 'left-0.5')} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F2E]">
      <div className="page-gutter pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/ai-studio" className="p-2 glass-surface rounded-button text-[#8892B0] hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-white">{tool?.name || 'AI Tool'}</h1>
            <p className="text-xs text-[#8892B0]">{tool?.description}</p>
          </div>
          {user && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 glass-surface rounded-full">
              <Zap size={14} className="text-[#00D4FF]" />
              <span className="text-sm font-mono text-[#00D4FF]">{user.credits}</span>
            </div>
          )}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Prompt */}
            <div className="glass-surface rounded-card p-4">
              <label className="block text-sm font-heading font-semibold text-white mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-sm text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none resize-none"
              />
              <div className="flex justify-between mt-1">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-[#8892B0] hover:text-[#00D4FF]">
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
                <span className="text-xs text-[#8892B0]">{prompt.length} chars</span>
              </div>
            </div>

            {/* Negative Prompt */}
            {showAdvanced && (
              <div className="glass-surface rounded-card p-4">
                <label className="block text-sm font-heading font-semibold text-white mb-2">Negative Prompt</label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Describe what you want to avoid..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-sm text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none resize-none"
                />
              </div>
            )}

            {/* Parameters */}
            {tool?.parameters.map((param) => (
              <div key={param.name} className="glass-surface rounded-card p-4">
                <label className="block text-sm font-heading font-semibold text-white mb-2">{param.label}</label>
                {renderParamControl(param)}
                {param.description && param.type !== 'number' && <p className="text-xs text-[#8892B0] mt-1">{param.description}</p>}
              </div>
            ))}

            {/* Credit Cost & Generate */}
            <div className="glass-surface rounded-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8892B0]">Cost</span>
                <span className="text-sm font-mono text-[#E040FB]">{tool?.creditCost || 10} credits</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || status === 'generating'}
                className={cn(
                  'w-full py-3 rounded-button font-heading font-bold transition-all flex items-center justify-center gap-2',
                  status === 'generating'
                    ? 'bg-[#0D1233] text-[#8892B0] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-white btn-glow hover:brightness-110'
                )}
              >
                {status === 'generating' ? <><Loader2 size={18} className="animate-spin" /> Generating... {Math.round(progress)}%</>
                  : <><Send size={18} /> Generate</>}
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="glass-surface rounded-card p-6 flex flex-col min-h-[500px]">
            {status === 'idle' && !output && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#0D1233] flex items-center justify-center mb-4">
                  <ImagePlus size={28} className="text-[#8892B0]" />
                </div>
                <p className="text-[#8892B0]">Your creation will appear here</p>
                <p className="text-xs text-[#8892B0] mt-1">Enter a prompt and click Generate</p>
              </div>
            )}

            {status === 'generating' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md mb-6">
                  <div className="h-2 bg-[#0D1233] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-center text-sm text-[#8892B0] mt-3">Processing... {Math.round(progress)}%</p>
                </div>
                <div className="w-12 h-12 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {status === 'complete' && output && (
              <div className="flex-1">
                <div className="aspect-[4/3] rounded-card overflow-hidden mb-4">
                  <img src={output} alt="Generated output" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-semibold flex items-center justify-center gap-2 hover:brightness-110">
                    <Download size={16} /> Download
                  </button>
                  <button onClick={handleGenerate} className="flex-1 py-2.5 glass-surface rounded-button text-[#8892B0] hover:text-white flex items-center justify-center gap-2">
                    <RotateCcw size={16} /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {toolGenerations.length > 0 && (
          <div className="mt-8">
            <h3 className="font-heading font-bold text-white mb-4">History</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {toolGenerations.map((gen) => (
                <div key={gen.id} className="flex-shrink-0 w-32 glass-surface rounded-card overflow-hidden cursor-pointer hover:border-[rgba(0,212,255,0.5)] transition-all">
                  <img src={gen.thumbnail} alt="" className="w-full aspect-square object-cover" />
                  <p className="text-[10px] text-[#8892B0] p-2 line-clamp-1">{gen.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
