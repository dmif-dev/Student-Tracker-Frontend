'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Users, Shield, ArrowRight } from 'lucide-react';
import { login, signInWithGoogle } from './auth/actions';

const isRedirectError = (err: any) => {
  return err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'));
};

export default function LandingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Mentor' | 'Admin'>('Student');

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      if (isRedirectError(err)) {
        return;
      }
      setError(err?.message || "An error occurred with Google Login.");
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      formData.set('role', selectedRole);
      
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (isRedirectError(err)) {
        return;
      }
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-[#FAFAFA]">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          opacity: 0.6 
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(255,245,238,0.8) 0%, rgba(250,250,250,1) 100%)' 
        }}
      />

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-100 shadow-sm h-10 w-10 rounded-xl flex items-center justify-center">
            <svg className="h-5 w-5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-extrabold text-zinc-900 tracking-tight text-xl">
            Student Tracker
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.open('https://www.drmadhan.org/', '_self')}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all"
        >
          Back to home &rarr;
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[420px] mx-4 rounded-[2rem] p-8 z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Heading */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">
            Log in
          </h1>
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="font-bold text-[#FF6B00] hover:text-[#e05e00] transition-colors focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <input type="hidden" name="role" value={selectedRole} />

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
              <span className="text-[#FF6B00]">*</span> EMAIL ADDRESS
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Mail size={18} strokeWidth={2} />
              </div>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
              <span className="text-[#FF6B00]">*</span> PASSWORD
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Lock size={18} strokeWidth={2} />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Enter your password"
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
              <span className="text-[#FF6B00]">*</span> SELECT YOUR ROLE
            </label>
            <div className="flex bg-gray-50/80 p-1 rounded-2xl border border-gray-100">
              {[
                { id: 'Student', label: 'Student', icon: GraduationCap },
                { id: 'Mentor',  label: 'Mentor',  icon: Users },
                { id: 'Admin',   label: 'Admin',   icon: Shield },
              ].map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as any)}
                    className="flex-1 h-10 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={isSelected ? {
                      background: '#ffffff',
                      color: '#FF6B00',
                      border: '1px solid rgba(255,107,0,0.2)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    } : {
                      color: '#71717a',
                      background: 'transparent',
                      border: '1px solid transparent',
                    }}
                  >
                    <Icon size={14} style={{ color: isSelected ? '#FF6B00' : '#a1a1aa' }} strokeWidth={2.5} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Login</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            OR REGISTER WITH
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            id="login-google"
            onClick={handleGoogleLogin}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-zinc-700 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            disabled
            title="Apple Login is currently unavailable"
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-zinc-400 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed opacity-70"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.25-.56 2.94-1.39z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 w-full text-center text-[11px] text-zinc-400">
        &copy; {new Date().getFullYear()} Dr. Madhan Institute of Future. All rights reserved.
      </p>
    </div>
  );
}
