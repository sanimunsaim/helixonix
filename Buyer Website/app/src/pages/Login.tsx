import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    const success = await login(email, password);
    if (success) navigate('/dashboard');
    else setError('Invalid credentials');
  };

  return (
    <div className="min-h-screen bg-[#050815] flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center px-12">
          <img src="/images/logo-primary.png" alt="HelixOnix" className="h-12 mx-auto mb-6" />
          <h2 className="font-display font-black text-3xl text-white mb-3">Welcome Back</h2>
          <p className="text-[#8892B0]">Sign in to access your creative dashboard</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/images/logo-primary.png" alt="HelixOnix" className="h-10 mx-auto mb-4" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-white mb-1">Welcome Back</h1>
          <p className="text-sm text-[#8892B0] mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#8892B0] mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 px-4 pr-12 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892B0]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-[#FF1744]">{error}</p>}

            <button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-bold btn-glow hover:brightness-110 transition-all disabled:opacity-50">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(0,212,255,0.1)]" />
            <span className="text-xs text-[#8892B0]">or</span>
            <div className="flex-1 h-px bg-[rgba(0,212,255,0.1)]" />
          </div>

          <button className="w-full h-12 glass-surface rounded-button text-sm text-white font-heading font-semibold flex items-center justify-center gap-2 hover:border-[rgba(0,212,255,0.5)] transition-all">
            <Chrome size={18} /> Continue with Google
          </button>

          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="block text-sm text-[#00D4FF] hover:underline">Forgot password?</Link>
            <p className="text-sm text-[#8892B0]">Don&apos;t have an account? <Link to="/signup" className="text-[#00D4FF] hover:underline">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
