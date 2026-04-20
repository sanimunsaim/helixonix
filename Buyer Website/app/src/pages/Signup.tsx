import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome, User, Palette } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buy' | 'sell'>('buy');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const success = await register({ name, email, password, role });
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050815] flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30"><img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative z-10 text-center px-12">
          <img src="/images/logo-primary.png" alt="HelixOnix" className="h-12 mx-auto mb-6" />
          <h2 className="font-display font-black text-3xl text-white mb-3">Join HelixOnix</h2>
          <p className="text-[#8892B0]">Start creating and collaborating today</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/images/logo-primary.png" alt="HelixOnix" className="h-10 mx-auto mb-4" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-white mb-1">Create Account</h1>
          <p className="text-sm text-[#8892B0] mb-6">Get started with HelixOnix</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full h-12 px-4 pr-12 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892B0]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm text-[#8892B0] mb-2">I&apos;m here to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('buy')} className={cn('p-4 rounded-card border text-center transition-all', role === 'buy' ? 'border-[#00D4FF] bg-[#00D4FF]/10' : 'border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.3)]')}>
                  <User size={20} className="mx-auto mb-2 text-[#00D4FF]" />
                  <p className="text-sm font-medium text-white">Buy & Download</p>
                </button>
                <button type="button" onClick={() => setRole('sell')} className={cn('p-4 rounded-card border text-center transition-all', role === 'sell' ? 'border-[#00D4FF] bg-[#00D4FF]/10' : 'border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.3)]')}>
                  <Palette size={20} className="mx-auto mb-2 text-[#8B2FFF]" />
                  <p className="text-sm font-medium text-white">Sell & Create</p>
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-[#FF1744]">{error}</p>}

            <button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-bold btn-glow hover:brightness-110 disabled:opacity-50">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(0,212,255,0.1)]" /><span className="text-xs text-[#8892B0]">or</span><div className="flex-1 h-px bg-[rgba(0,212,255,0.1)]" />
          </div>

          <button className="w-full h-12 glass-surface rounded-button text-sm text-white font-heading font-semibold flex items-center justify-center gap-2 hover:border-[rgba(0,212,255,0.5)]">
            <Chrome size={18} /> Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#8892B0]">Already have an account? <Link to="/login" className="text-[#00D4FF] hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
