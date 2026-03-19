'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signup, signInWithGoogle } from '../auth/actions';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 font-sans p-4">
      {/* Main Container Card */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden min-h-[500px]">
        
        {/* Left Side: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-orange-50 items-center justify-center p-8">
          <div className="relative w-full max-w-sm">
            <img 
              src="/assets/auth_illustration.png" 
              alt="Signup Illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-montserrat">Create Account</h2>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span className="text-orange-500 font-serif">*</span> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  className="w-full h-11 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-gray-300"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span className="text-orange-500 font-serif">*</span> Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-gray-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span className="text-orange-500 font-serif">*</span> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Create a password"
                    className="w-full h-11 px-4 pr-12 rounded-xl border border-gray-100 bg-gray-50/50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <span className="text-orange-500 font-serif">*</span> Role
                </label>
                <select
                  name="role"
                  required
                  defaultValue=""
                  className="w-full h-11 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Student">Student</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Signup Button */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70"
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full h-11 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all font-montserrat"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all font-medium text-gray-700 text-sm"
            >
              <img
                src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                width={20}
                height={20}
                alt="Google Icon"
              />
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
