import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ChevronRight, ChevronLeft, Plus, X,
  GripVertical, Upload, Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const totalSteps = 6;

const stepVariants = {
  enter: { x: 30, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
};

interface PackageTier {
  name: string;
  description: string;
  deliveryDays: number;
  revisions: string;
  price: number;
  features: string[];
}

export function CreateGig() {
  const [step, setStep] = useState(1);
  const [gigTitle, setGigTitle] = useState('');
  const [packages, setPackages] = useState<PackageTier[]>([
    { name: 'Basic', description: '', deliveryDays: 3, revisions: '1', price: 25, features: ['1080p delivery'] },
    { name: 'Standard', description: '', deliveryDays: 5, revisions: '3', price: 75, features: ['1080p delivery', 'Source files'] },
    { name: 'Premium', description: '', deliveryDays: 7, revisions: 'Unlimited', price: 150, features: ['4K delivery', 'Source files', 'Commercial license'] },
  ]);
  const [features, setFeatures] = useState(['Source file included', 'Commercial license', 'Rush delivery available', 'Background music', 'Voiceover included']);
  const [newFeature, setNewFeature] = useState('');
  const [requirements, setRequirements] = useState<Array<{ type: string; question: string; required: boolean }>>([]);
  const [galleryFiles, setGalleryFiles] = useState<Array<{ name: string }>>([]);
  const { addToast } = useStore();

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures([...features, newFeature]);
    setNewFeature('');
  };

  const togglePackageFeature = (pkgIdx: number, feature: string) => {
    const updated = [...packages];
    if (updated[pkgIdx].features.includes(feature)) {
      updated[pkgIdx].features = updated[pkgIdx].features.filter((f) => f !== feature);
    } else {
      updated[pkgIdx].features = [...updated[pkgIdx].features, feature];
    }
    setPackages(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, { type: 'text', question: '', required: true }]);
  };

  const handlePublish = () => {
    addToast({ message: 'Gig published successfully!', type: 'success' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              i + 1 < step ? 'bg-[#8B2FFF] text-white' :
              i + 1 === step ? 'bg-[#00D4FF] text-[#0A0F2E]' :
              'bg-white/[0.06] text-white/40 border border-white/[0.1]'
            }`}>
              {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-8 h-0.5 rounded-full ${i + 1 < step ? 'bg-[#8B2FFF]' : 'bg-white/[0.1]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08]" style={{ background: 'rgba(13, 18, 51, 0.6)', backdropFilter: 'blur(16px)' }}>
        <div className="p-8 min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Overview */}
              {step === 1 && (
                <div className="space-y-5 max-w-lg mx-auto">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Gig Overview</h2>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Gig Title *</label>
                    <input
                      value={gigTitle}
                      onChange={(e) => setGigTitle(e.target.value)}
                      placeholder="I will create a professional logo animation..."
                      className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]"
                    />
                    <p className="text-xs text-white/30 mt-1 text-right">{gigTitle.length}/80</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 mb-1.5 block">Category</label>
                      <select className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]">
                        <option>Video & Animation</option>
                        <option>Graphics & Design</option>
                        <option>Music & Audio</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1.5 block">Subcategory</label>
                      <select className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]">
                        <option>Logo Animation</option>
                        <option>Intro/Outro</option>
                        <option>Motion Graphics</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Search Tags</label>
                    <input placeholder="e.g., logo animation, motion graphics, intro" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                  </div>
                </div>
              )}

              {/* Step 2: Pricing - THREE COLUMN PACKAGE BUILDER */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Scope & Pricing</h2>

                  {/* Three Column Package Builder */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg, pkgIdx) => (
                      <div
                        key={pkgIdx}
                        className="rounded-xl border overflow-hidden"
                        style={{
                          background: 'rgba(13, 18, 51, 0.5)',
                          borderColor: pkgIdx === 0 ? 'rgba(255,255,255,0.08)' : pkgIdx === 1 ? 'rgba(0,212,255,0.3)' : 'rgba(224,64,251,0.3)',
                        }}
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-white/[0.06]" style={{
                          background: pkgIdx === 0 ? 'rgba(255,255,255,0.02)' : pkgIdx === 1 ? 'rgba(0,212,255,0.06)' : 'rgba(224,64,251,0.06)'
                        }}>
                          <input
                            value={pkg.name}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[pkgIdx].name = e.target.value;
                              setPackages(updated);
                            }}
                            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                          />
                        </div>

                        <div className="p-4 space-y-4">
                          <textarea
                            placeholder="Describe what's included..."
                            value={pkg.description}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[pkgIdx].description = e.target.value;
                              setPackages(updated);
                            }}
                            className="w-full h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)] resize-none"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-white/50 mb-1 block">Delivery</label>
                              <select
                                value={pkg.deliveryDays}
                                onChange={(e) => {
                                  const updated = [...packages];
                                  updated[pkgIdx].deliveryDays = parseInt(e.target.value);
                                  setPackages(updated);
                                }}
                                className="w-full h-8 rounded-md bg-white/[0.04] border border-white/[0.08] px-2 text-xs text-white outline-none"
                              >
                                {[1, 2, 3, 5, 7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-white/50 mb-1 block">Revisions</label>
                              <select
                                value={pkg.revisions}
                                onChange={(e) => {
                                  const updated = [...packages];
                                  updated[pkgIdx].revisions = e.target.value;
                                  setPackages(updated);
                                }}
                                className="w-full h-8 rounded-md bg-white/[0.04] border border-white/[0.08] px-2 text-xs text-white outline-none"
                              >
                                {['0', '1', '2', '3', 'Unlimited'].map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-white/50 mb-1 block">Price (min $5)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">$</span>
                              <input
                                type="number"
                                min={5}
                                value={pkg.price}
                                onChange={(e) => {
                                  const updated = [...packages];
                                  updated[pkgIdx].price = parseInt(e.target.value) || 0;
                                  setPackages(updated);
                                }}
                                className="w-full h-9 pl-6 pr-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="border-t border-white/[0.08] pt-4">
                    <h3 className="text-sm text-white font-medium mb-3">Feature Checklist</h3>
                    <div className="space-y-2">
                      {features.map((feature, fIdx) => (
                        <div key={fIdx} className="grid grid-cols-[1fr_repeat(3,auto)] gap-3 items-center">
                          <span className="text-xs text-white/70">{feature}</span>
                          {packages.map((pkg, pkgIdx) => (
                            <button
                              key={pkgIdx}
                              onClick={() => togglePackageFeature(pkgIdx, feature)}
                              className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                pkg.features.includes(feature)
                                  ? pkgIdx === 0 ? 'border-white/20 bg-white/10' : pkgIdx === 1 ? 'border-cyan-500/50 bg-cyan-500/20' : 'border-fuchsia-500/50 bg-fuchsia-500/20'
                                  : 'border-white/[0.08]'
                              }`}
                            >
                              {pkg.features.includes(feature) && <CheckCircle size={14} className={pkgIdx === 0 ? 'text-white/60' : pkgIdx === 1 ? 'text-cyan-400' : 'text-fuchsia-400'} />}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="+ Add custom feature"
                        className="flex-1 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-xs text-white placeholder:text-white/40 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button onClick={addFeature} className="px-3 h-9 rounded-lg gradient-purple text-white text-xs hover:opacity-90">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Description & FAQ */}
              {step === 3 && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Description & FAQ</h2>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Main Description *</label>
                    <textarea
                      placeholder="Describe your gig in detail..."
                      defaultValue="Welcome! I specialize in creating stunning logo animations that bring your brand to life."
                      className="w-full h-40 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)] resize-none"
                    />
                    <p className="text-xs text-white/30 mt-1 text-right">245 / 1200</p>
                  </div>

                  <div className="border-t border-white/[0.08] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm text-white font-medium">Frequently Asked Questions</h3>
                      <button
                        onClick={() => addToast({ message: 'FAQ added', type: 'info' })}
                        className="flex items-center gap-1 px-3 h-8 rounded-lg bg-white/[0.06] text-white/70 text-xs hover:bg-white/[0.1] transition-colors"
                      >
                        <Plus size={14} />
                        Add Question
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { q: 'What file formats do you deliver?', a: 'I deliver MP4, MOV, and GIF formats. Source files (AE) available with Standard and Premium packages.' },
                        { q: 'Can you match my brand colors?', a: 'Absolutely! Just provide your brand guidelines or hex codes.' },
                      ].map((faq, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                          <p className="text-sm text-white font-medium">{faq.q}</p>
                          <p className="text-xs text-white/50 mt-1">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Requirements */}
              {step === 4 && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Buyer Requirements</h2>
                  <p className="text-sm text-white/50 text-center">What information do you need from buyers before starting?</p>

                  <div className="space-y-3">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <GripVertical size={16} className="text-white/30 mt-1 cursor-move" />
                        <div className="flex-1 space-y-2">
                          <select
                            value={req.type}
                            onChange={(e) => {
                              const updated = [...requirements];
                              updated[i].type = e.target.value;
                              setRequirements(updated);
                            }}
                            className="w-full h-8 rounded-md bg-white/[0.04] border border-white/[0.08] px-2 text-xs text-white outline-none"
                          >
                            <option value="text">Free Text</option>
                            <option value="choice">Multiple Choice</option>
                            <option value="file">File Attachment</option>
                            <option value="yesno">Yes/No</option>
                          </select>
                          <input
                            value={req.question}
                            onChange={(e) => {
                              const updated = [...requirements];
                              updated[i].question = e.target.value;
                              setRequirements(updated);
                            }}
                            placeholder="Enter your question..."
                            className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px] text-white/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={req.required}
                              onChange={(e) => {
                                const updated = [...requirements];
                                updated[i].required = e.target.checked;
                                setRequirements(updated);
                              }}
                              className="accent-[#8B2FFF]"
                            />
                            Required
                          </label>
                          <button
                            onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))}
                            className="text-white/30 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addRequirement}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-white/[0.15] text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors"
                  >
                    <Plus size={16} />
                    Add Requirement
                  </button>
                </div>
              )}

              {/* Step 5: Gallery */}
              {step === 5 && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <h2 className="font-display text-xl font-bold text-white text-center mb-4">Gallery</h2>
                  <p className="text-sm text-white/50 text-center">Upload portfolio images/videos to showcase your work (max 7)</p>

                  <div
                    onClick={() => {
                      const newFile = { name: `portfolio_${galleryFiles.length + 1}.jpg` };
                      setGalleryFiles([...galleryFiles, newFile]);
                    }}
                    className="border-2 border-dashed border-white/[0.15] rounded-xl p-10 text-center cursor-pointer hover:border-[#00D4FF]/40 transition-colors"
                  >
                    <Upload size={36} className="text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/60">Click to upload images or videos</p>
                    <p className="text-xs text-white/30 mt-1">First image will be the thumbnail • Max 75MB per video</p>
                  </div>

                  {galleryFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {galleryFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                          <img src="/assets/gig-placeholder.jpg" alt={file.name} className="w-full h-full object-cover opacity-70" />
                          <span className="absolute bottom-1 left-1 text-[9px] text-white/60 bg-black/50 px-1 rounded">{i === 0 ? 'Thumb' : `#${i + 1}`}</span>
                          <button
                            onClick={() => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white/60 hover:text-red-400"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-white/30 text-center">{galleryFiles.length} / 7 items</p>
                </div>
              )}

              {/* Step 6: Publish */}
              {step === 6 && (
                <div className="text-center space-y-6 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">Ready to Go Live!</h2>
                    <p className="text-sm text-white/60 mt-1">Review your gig before publishing</p>
                  </div>

                  {/* Preview Card */}
                  <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left space-y-4">
                    <img src="/assets/gig-placeholder.jpg" alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <h3 className="font-display text-lg font-semibold text-white">{gigTitle || 'I will create a professional logo animation'}</h3>
                    <div className="flex gap-2">
                      {packages.map((pkg) => (
                        <span key={pkg.name} className="text-xs px-2 py-1 rounded-full bg-white/[0.06] text-white/60">
                          {pkg.name}: ${pkg.price}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-xs text-white/40">
                      <span>3-day delivery</span>
                      <span>3 revisions</span>
                      <span>Source files</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePublish}
                    className="w-full py-3 rounded-xl gradient-purple text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Publish Gig
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 6 && (
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
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
