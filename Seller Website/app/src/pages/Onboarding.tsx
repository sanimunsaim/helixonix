import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Briefcase, Layers, Upload, CheckCircle,
  ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const totalSteps = 5;

const stepVariants = {
  enter: { x: 30, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
};

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sellerType, setSellerType] = useState<'assets' | 'services' | 'both' | null>(null);
  const [formData, setFormData] = useState({
    displayName: '', username: '', headline: '', bio: '', languages: '', location: '',
    skills: [] as string[], portfolio: '', linkedin: '', behance: '', instagram: '', twitter: '',
    payoutMethod: '', taxDoc: '', agreeTerms: false,
  });
  const { addToast } = useStore();

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      addToast({ message: 'Welcome to HelixOnix Creator Studio!', type: 'success' });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return !!sellerType;
    if (step === 5) return true;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: '#050815' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0" style={{ backgroundImage: 'url(/assets/Bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(5,8,21,0.8) 0%, rgba(5,8,21,0.5) 50%, rgba(5,8,21,0.9) 100%)' }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Wizard Card */}
        <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(13, 18, 51, 0.85)', backdropFilter: 'blur(24px)' }}>
          {/* Step Indicator */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i + 1 < step ? 'bg-[#8B2FFF] text-white' :
                      i + 1 === step ? 'bg-[#00D4FF] text-[#0A0F2E] animate-pulse' :
                      'bg-white/[0.06] text-white/40 border border-white/[0.1]'
                    }`}
                  >
                    {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-12 h-0.5 rounded-full transition-colors ${
                      i + 1 < step ? 'bg-[#8B2FFF]' : 'bg-white/[0.1]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/40 mt-3">Step {step} of {totalSteps}</p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                {step === 1 && (
                  <div className="text-center space-y-6">
                    <img src="/assets/Logo pref2.png" alt="HelixOnix" className="w-16 h-16 mx-auto" />
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white">Welcome to Creator Studio</h1>
                      <p className="text-sm text-white/60 mt-1">You are about to join 50,000+ creators on HelixOnix</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      {[
                        { key: 'assets' as const, icon: FileText, label: 'I Sell Digital Assets', desc: 'Templates, graphics, audio' },
                        { key: 'services' as const, icon: Briefcase, label: 'I Offer Creative Services', desc: 'Video editing, design' },
                        { key: 'both' as const, icon: Layers, label: 'Both', desc: 'Assets + Services' },
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setSellerType(option.key)}
                          className={`p-4 rounded-xl border transition-all text-center ${
                            sellerType === option.key
                              ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.06)] shadow-[0_0_20px_rgba(139,47,255,0.2)]'
                              : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}
                        >
                          {sellerType === option.key && (
                            <div className="flex justify-end mb-1">
                              <CheckCircle size={14} className="text-[#00D4FF]" />
                            </div>
                          )}
                          <option.icon size={28} className={sellerType === option.key ? 'text-[#00D4FF] mx-auto' : 'text-white/40 mx-auto'} />
                          <p className={`text-xs font-medium mt-2 ${sellerType === option.key ? 'text-white' : 'text-white/60'}`}>{option.label}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5 max-w-md mx-auto">
                    <h2 className="font-display text-xl font-bold text-white text-center">Set Up Your Profile</h2>
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img src="/assets/avatar-placeholder.jpg" alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white">
                          <Upload size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Display Name" defaultValue="Alex Creator" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                      <div className="relative">
                        <input placeholder="Username" defaultValue="@alexcreator" className="h-10 w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                        <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      </div>
                    </div>
                    <input placeholder="Professional Headline" defaultValue="Cinematic Video Creator & AI Specialist" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    <textarea placeholder="Bio (min 500 chars)" defaultValue="Professional video creator with 5+ years of experience..." className="w-full h-24 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)] resize-none" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Languages" defaultValue="English, Spanish" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                      <select className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-[rgba(0,212,255,0.3)]">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5 max-w-md mx-auto">
                    <h2 className="font-display text-xl font-bold text-white text-center">What Are Your Skills?</h2>
                    <div className="flex flex-wrap gap-2">
                      {['Video Editing', 'Motion Graphics', 'Branding', 'AI Art', 'Template Design', '3D Modeling', 'Animation', 'UI Design'].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => {
                            const current = formData.skills;
                            if (current.includes(skill)) {
                              setFormData({ ...formData, skills: current.filter((s) => s !== skill) });
                            } else {
                              setFormData({ ...formData, skills: [...current, skill] });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            formData.skills.includes(skill)
                              ? 'gradient-purple text-white'
                              : 'bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.1]'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    <input placeholder="+ Add custom skill" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    <input placeholder="Portfolio URL (optional)" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="LinkedIn" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                      <input placeholder="Behance" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                      <input placeholder="Instagram" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                      <input placeholder="Twitter/X" className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[rgba(0,212,255,0.3)]" />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5 max-w-md mx-auto">
                    <h2 className="font-display text-xl font-bold text-white text-center">How Would You Like to Get Paid?</h2>
                    <div className="space-y-2">
                      {[
                        { key: 'paypal', label: 'PayPal', input: 'Email address' },
                        { key: 'stripe', label: 'Stripe Connect', input: null },
                        { key: 'bank', label: 'Bank Transfer', input: 'Account details' },
                        { key: 'wise', label: 'Wise', input: 'Email + Currency' },
                      ].map((method) => (
                        <button
                          key={method.key}
                          onClick={() => setFormData({ ...formData, payoutMethod: method.key })}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                            formData.payoutMethod === method.key
                              ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.06)]'
                              : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}
                        >
                          <CreditCardIcon />
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{method.label}</p>
                            {method.input && <p className="text-xs text-white/40">{method.input}</p>}
                          </div>
                          {method.key === 'stripe' && (
                            <span className="px-3 py-1 rounded-lg gradient-purple text-white text-xs">Connect</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.08] pt-4">
                      <p className="text-sm text-white font-medium mb-2">Tax Information</p>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                          <input type="radio" name="tax" className="accent-[#8B2FFF]" />
                          W-9 (US)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                          <input type="radio" name="tax" className="accent-[#8B2FFF]" />
                          W-8BEN (Non-US)
                        </label>
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-xs text-white/50 cursor-pointer">
                        <input type="checkbox" className="accent-[#8B2FFF]" />
                        I will complete this later (reminder will be shown)
                      </label>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto">
                      <Sparkles size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white">You are Ready to Launch!</h2>
                      <p className="text-sm text-white/60 mt-1">Here is how buyers will see your profile</p>
                    </div>

                    {/* Profile Preview */}
                    <div className="max-w-sm mx-auto p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <img src="/assets/avatar-placeholder.jpg" alt="Preview" className="w-12 h-12 rounded-full" />
                        <div>
                          <p className="text-sm text-white font-semibold">Alex Creator</p>
                          <p className="text-xs text-white/50">@alexcreator</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/60">Cinematic Video Creator & AI Specialist</p>
                      <div className="flex gap-1 mt-2">
                        {['Video Editing', 'Motion Graphics', 'AI Art'].map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      <button
                        onClick={() => navigate('/upload/new')}
                        className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-center"
                      >
                        <Upload size={24} className="text-[#00D4FF] mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">Upload First Asset</p>
                      </button>
                      <button
                        onClick={() => navigate('/gigs/new')}
                        className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-center"
                      >
                        <Briefcase size={24} className="text-[#8B2FFF] mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">Create First Gig</p>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === totalSteps ? 'Launch My Profile' : 'Continue'}
              {step < totalSteps && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
