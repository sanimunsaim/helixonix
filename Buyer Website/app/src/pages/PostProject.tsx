import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ['Branding', 'Video Production', 'Motion Graphics', 'Web Design', 'Illustration', '3D Design', 'AI Automation'];
const budgetTypes = ['Fixed', 'Hourly'];

export default function PostProject() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: '', title: '', description: '', brief: '', budgetType: 'Fixed', budgetMin: 100, budgetMax: 1000, deadline: '', urgent: false,
  });

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const canNext = () => {
    if (step === 1) return form.category && form.title.length > 0 && form.description.length >= 20;
    if (step === 2) return form.brief.length > 0;
    if (step === 3) return form.deadline;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-3xl mx-auto">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">Post a Project</h1>
        <p className="text-[#8892B0] mb-8">Describe your project and get proposals from top creators</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-all', step >= s ? 'bg-[#00D4FF] text-[#050815]' : 'bg-[#0D1233] text-[#8892B0] border border-[rgba(0,212,255,0.15)]')}>
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 4 && <div className={cn('flex-1 h-0.5 rounded-full', step > s ? 'bg-[#00D4FF]' : 'bg-[#0D1233]')} />}
            </div>
          ))}
        </div>

        <div className="glass-surface rounded-card-lg p-6 md:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-xl text-white">Project Basics</h2>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => update('category', c)} className={cn('px-4 py-2 rounded-button text-sm transition-all', form.category === c ? 'bg-[#00D4FF] text-[#050815]' : 'glass-surface text-[#8892B0] hover:text-white')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Title</label>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Brand Identity for Tech Startup" className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Brief Description <span className="text-[#8892B0]">({form.description.length} chars, min 20)</span></label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Short summary of what you need..." className="w-full px-4 py-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-xl text-white">Requirements</h2>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Detailed Brief</label>
                <textarea value={form.brief} onChange={(e) => update('brief', e.target.value)} rows={6} placeholder="Describe your project in detail..." className="w-full px-4 py-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Reference Files</label>
                <div className="border-2 border-dashed border-[rgba(0,212,255,0.15)] rounded-card p-8 text-center hover:border-[rgba(0,212,255,0.5)] transition-colors cursor-pointer">
                  <Upload size={24} className="text-[#8892B0] mx-auto mb-2" />
                  <p className="text-sm text-[#8892B0]">Drag & drop files here, or click to browse</p>
                  <p className="text-xs text-[#8892B0] mt-1">Up to 5 files, 50MB each</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-xl text-white">Budget & Timeline</h2>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Budget Type</label>
                <div className="flex gap-2">
                  {budgetTypes.map((t) => (
                    <button key={t} onClick={() => update('budgetType', t)} className={cn('flex-1 py-3 rounded-button text-sm font-heading font-semibold transition-all', form.budgetType === t ? 'bg-[#00D4FF] text-[#050815]' : 'glass-surface text-[#8892B0]')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Budget Range</label>
                <div className="flex items-center gap-4">
                  <input type="number" value={form.budgetMin} onChange={(e) => update('budgetMin', Number(e.target.value))} className="flex-1 h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white font-mono focus:border-[#00D4FF] outline-none" />
                  <span className="text-[#8892B0]">to</span>
                  <input type="number" value={form.budgetMax} onChange={(e) => update('budgetMax', Number(e.target.value))} className="flex-1 h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white font-mono focus:border-[#00D4FF] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white focus:border-[#00D4FF] outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.urgent} onChange={(e) => update('urgent', e.target.checked)} className="accent-[#00D4FF]" />
                <span className="text-sm text-white">This is urgent — I need it ASAP</span>
              </label>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-xl text-white">Review & Post</h2>
              <div className="glass-surface rounded-card p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-[#8892B0]">Category</span><span className="text-white">{form.category}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#8892B0]">Title</span><span className="text-white">{form.title}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#8892B0]">Budget</span><span className="text-white">{form.budgetType === 'Fixed' ? `$${form.budgetMin}-$${form.budgetMax}` : `$${form.budgetMin}/hr`}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#8892B0]">Deadline</span><span className="text-white">{form.deadline}</span></div>
              </div>
              <button className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-bold btn-glow hover:brightness-110">
                Post Project
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(0,212,255,0.1)]">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-1 px-4 py-2 glass-surface rounded-button text-sm text-[#8892B0] disabled:opacity-30 hover:text-white disabled:hover:text-[#8892B0]">
              <ChevronLeft size={16} /> Back
            </button>
            {step < 4 && (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="flex items-center gap-1 px-6 py-2 bg-[#00D4FF] text-[#050815] rounded-button text-sm font-heading font-semibold disabled:opacity-30 hover:brightness-110">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
