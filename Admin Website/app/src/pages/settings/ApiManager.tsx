import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useApiConfigStore, type ApiEndpoint } from "@/stores/apiConfigStore";
import { Server, Activity, Plus, Save, RotateCcw, Edit2, CheckCircle2, Globe, Cpu } from "lucide-react";

export default function ApiManager() {
  const { coreApiUrl, brainApiUrl, webSocketUrl, endpoints, updateBaseUrl, updateEndpoint, resetToDefaults } = useApiConfigStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPath, setEditPath] = useState("");
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSaveEndpoint = (id: string) => {
    updateEndpoint(id, editPath);
    setEditingId(null);
    showSavedStatus();
  };

  const showSavedStatus = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'POST': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PUT':
      case 'PATCH': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const categories = Array.from(new Set(endpoints.map(e => e.category)));

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader 
        title="API Manager" 
        subtitle="Manage unified system endpoints and base connections visually." 
        badge="System"
      />

      {/* Global Base URLs */}
      <div className="mb-6 rounded-xl border border-[#1E293B] bg-[#111827] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Globe className="h-4 w-4 text-hx-cyan" /> Environment Base URLs
          </h2>
          <button 
            onClick={() => { resetToDefaults(); showSavedStatus(); }}
            className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> Core API URL
            </label>
            <input 
              value={coreApiUrl}
              onChange={(e) => updateBaseUrl('core', e.target.value)}
              onBlur={showSavedStatus}
              className="w-full rounded-lg border border-[#1E293B] bg-[#080C18] px-3 py-2 text-sm text-slate-200 outline-none focus:border-hx-cyan/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> HELIX-BRAIN URL
            </label>
            <input 
              value={brainApiUrl}
              onChange={(e) => updateBaseUrl('brain', e.target.value)}
              onBlur={showSavedStatus}
              className="w-full rounded-lg border border-[#1E293B] bg-[#080C18] px-3 py-2 text-sm text-slate-200 outline-none focus:border-hx-cyan/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> WebSocket URL
            </label>
            <input 
              value={webSocketUrl}
              onChange={(e) => updateBaseUrl('ws', e.target.value)}
              onBlur={showSavedStatus}
              className="w-full rounded-lg border border-[#1E293B] bg-[#080C18] px-3 py-2 text-sm text-slate-200 outline-none focus:border-hx-cyan/50"
            />
          </div>
        </div>

        {savedStatus && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" /> Settings saved automatically
          </div>
        )}
      </div>

      {/* Endpoints Registry */}
      <h2 className="mb-4 text-sm font-semibold text-slate-200">Endpoint Registry</h2>
      
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category} className="rounded-xl border border-[#1E293B] bg-[#111827] overflow-hidden">
            <div className="bg-hx-surface border-b border-[#1E293B] px-4 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{category}</h3>
            </div>
            
            <div className="divide-y divide-[#1E293B]">
              {endpoints.filter(e => e.category === category).map((endpoint) => (
                <div key={endpoint.id} className="group flex items-center justify-between p-4 hover:bg-hx-surface-hover transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{endpoint.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{endpoint.description}</p>
                  </div>

                  <div className="flex-[1.5] flex items-center justify-end gap-3">
                    {editingId === endpoint.id ? (
                      <div className="flex w-full max-w-sm items-center gap-2">
                        <input
                          value={editPath}
                          onChange={(e) => setEditPath(e.target.value)}
                          className="w-full rounded border border-hx-cyan/50 bg-[#080C18] px-2 py-1.5 text-sm font-mono text-slate-200 outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEndpoint(endpoint.id)}
                        />
                        <button onClick={() => handleSaveEndpoint(endpoint.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded">
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <code className="rounded bg-[#080C18] px-2 py-1 text-sm text-slate-300 font-mono border border-[#1E293B]">
                          {endpoint.path}
                        </code>
                        <button 
                          onClick={() => { setEditingId(endpoint.id); setEditPath(endpoint.path); }}
                          className="p-1.5 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-hx-cyan transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
