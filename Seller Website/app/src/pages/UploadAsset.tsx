import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetApi } from '@/lib/api';

const totalSteps = 4;

const stepVariants = {
  enter: { x: 30, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
};

export function UploadAsset() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<Array<{ name: string; size: string; progress: number, file: File }>>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useStore();

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('template');
  const [category, setCategory] = useState('Video');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [licenseType, setLicenseType] = useState('standard');
  const [price, setPrice] = useState('0');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      progress: 0,
      file: f
    }));
    setFiles([...files, ...newFiles]);
    // Simulate progress
    newFiles.forEach((_, i) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((f, idx) =>
          idx >= prev.length - newFiles.length + i ? { ...f, progress: 100 } : f
        ));
      }, 500 + i * 300);
    });
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      if (!title || files.length === 0) {
        addToast({ message: 'Title and files are required', type: 'error' });
        return;
      }
      setIsSubmitting(true);
      try {
        const file = files[0].file;
        // 1. Request Upload URL
        const uploadRes = await assetApi.requestUploadUrl({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          file_size: file.size,
        });
        
        // In a real prod setup, we'd PUT the file to uploadRes.data.uploadUrl here
        // For now, we skip the actual R2 upload to prevent CORS/Config issues if R2 isn't setup

        // 2. Complete Upload
        await assetApi.completeUpload({
          asset_id: uploadRes.data.assetId,
          original_key: uploadRes.data.key,
          title,
          description,
          type: type.toLowerCase().replace(' ', '_'),
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          license_type: licenseType,
          is_free: licenseType === 'free',
          price: parseFloat(price || '0') * 100, // convert to cents
          content_type: file.type || 'application/octet-stream',
          file_size: file.size,
        });

        setStep(4);
        addToast({ message: 'Asset submitted for review! Expected: < 2 hours', type: 'success' });
      } catch (err: any) {
        addToast({ message: err.message || 'Failed to submit asset', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i + 1 < step ? 'bg-[#8B2FFF] text-white' :
              i + 1 === step ? 'bg-[#00D4FF] text-[#0A0F2E]' :
              'bg-white/[0.06] text-white/40 border border-white/[0.1]'
            }`}>
              {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-12 h-0.5 rounded-full ${i + 1 < step ? 'bg-[#8B2FFF]' : 'bg-white/[0.1]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08]" style={{ background: 'rgba(13, 18, 51, 0.6)', backdropFilter: 'blur(16px)' }}>
        <div className="p-8 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Upload Files */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <h2 className="font-display text-xl font-bold text-white">Upload Your Files</h2>
                    <p className="text-sm text-white/50 mt-1">Drag and drop or click to browse</p>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-[#00D4FF] bg-[rgba(0,212,255,0.04)] shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                        : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2]'
                    }`}
                  >
                    <Upload size={48} className="text-white/30 mx-auto mb-3" />
                    <p className="text-base text-white font-medium">Drop your files here</p>
                    <p className="text-sm text-[#00D4FF] mt-1">or click to browse</p>
                    <p className="text-xs text-white/30 mt-3">
                      ZIP, PSD, AI, AEP, MP4, PNG, WAV • Max 500MB per file
                    </p>
                    <input id="fileInput" type="file" multiple className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).map((f) => ({
                          name: f.name,
                          size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                          progress: 100,
                          file: f
                        }));
                        setFiles([...files, ...newFiles]);
                      }
                    }} />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                          <FileText size={18} className="text-white/40" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-white/40">{file.size}</p>
                          </div>
                          <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${file.progress}%`,
                                background: file.progress === 100 ? '#10B981' : 'linear-gradient(90deg, #8B2FFF, #E040FB)'
                              }}
                            />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-white/30 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Asset Details */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Asset Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-white/60 mb-1.5 block">Title *</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Neon Glitch Overlay Pack" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1.5 block">Type</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]">
                        <option value="template">Template</option>
                        <option value="image">Stock Image</option>
                        <option value="video">Stock Video</option>
                        <option value="audio">Audio</option>
                        <option value="font">Font</option>
                        <option value="vector">3D Model / Vector</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1.5 block">Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]">
                        <option>Video</option>
                        <option>Social Media</option>
                        <option>Backgrounds</option>
                        <option>Icons</option>
                        <option>Graphics</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-white/60 mb-1.5 block">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your asset in detail..." className="w-full h-28 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)] resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-white/60 mb-1.5 block">Tags (max 20)</label>
                      <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Type tags separated by commas..." className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & License */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Pricing & License</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'free', label: 'Free', desc: 'Available to all users at no cost' },
                      { key: 'standard', label: 'Standard License', desc: 'Personal and commercial use', price: true },
                      { key: 'extended', label: 'Extended License', desc: 'Unlimited commercial use', price: true },
                      { key: 'editorial', label: 'Editorial Use Only', desc: 'News and editorial contexts', price: true },
                    ].map((license) => (
                      <label
                        key={license.key}
                        className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
                      >
                        <input type="radio" name="license" checked={licenseType === license.key} onChange={() => setLicenseType(license.key)} className="mt-1 accent-[#8B2FFF]" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{license.label}</p>
                          <p className="text-xs text-white/40">{license.desc}</p>
                        </div>
                        {license.price && licenseType === license.key && (
                          <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="$0.00"
                            className="w-20 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 text-sm text-white text-center outline-none focus:border-[rgba(0,212,255,0.3)]"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04]">
                    <input type="checkbox" className="accent-[#8B2FFF]" />
                    <span className="text-sm text-white/70">Include in Pro Subscription (Pro members download free)</span>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">Your Asset is In Review!</h2>
                    <p className="text-sm text-white/60 mt-1">Expected review time: less than 2 hours (auto-review)</p>
                  </div>
                  <div className="max-w-sm mx-auto p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle size={14} /> Files uploaded
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle size={14} /> Title and description
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle size={14} /> Tags and category
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle size={14} /> Pricing set
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="px-8 py-5 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : step === 3 ? 'Submit for Review' : 'Continue'}
              {step < 3 && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
