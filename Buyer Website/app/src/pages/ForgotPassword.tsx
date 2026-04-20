import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#050815] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-1 text-sm text-[#8892B0] hover:text-[#00D4FF] mb-8">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <img src="/images/logo-primary.png" alt="HelixOnix" className="h-10 mb-6" />

        {!sent ? (
          <>
            <h1 className="font-heading font-bold text-2xl text-white mb-1">Reset Password</h1>
            <p className="text-sm text-[#8892B0] mb-6">Enter your email and we&apos;ll send you a reset link</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 pl-12 pr-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none" />
              </div>
              <button type="submit" className="w-full h-12 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-bold btn-glow hover:brightness-110">
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle size={48} className="text-[#00E676] mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-white mb-2">Check Your Email</h2>
            <p className="text-sm text-[#8892B0] mb-6">We&apos;ve sent a password reset link to {email}</p>
            <button onClick={() => setSent(false)} className="text-sm text-[#00D4FF] hover:underline">Didn&apos;t receive it? Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
