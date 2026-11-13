import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthShowcaseCard } from '@/components/auth/AuthShowcaseCard';
import { useSession } from '@/hooks/useSession';

export default function Signup() {
  const { signup, isAuthenticated } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/onboarding/create-organisation" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const emailToUse = email.trim().includes('@')
      ? email.trim()
      : `${email.trim()}@locus.io`;

    try {
      await signup(name, emailToUse, password);
    } catch (err) {
      setError((err as Error).message || 'Failed to create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#f2f4f6] flex items-center justify-center p-3 sm:p-4 lg:p-6 font-sans text-gray-900 overflow-hidden">
      {/* Centered Main Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl lg:max-w-5xl w-full max-h-[96vh] grid grid-cols-1 md:grid-cols-2 items-stretch overflow-hidden">
        
        {/* Left Column: Signup Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 max-h-[96vh] overflow-y-auto workspace-scroll">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Create account
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-5 leading-normal">
            Start managing assets, users, and access in your workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name Input */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Email / Username Input */}
            <div>
              <input
                type="text"
                placeholder="Work Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Password Input with show/hide toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 sm:py-3 pr-11 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.75]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.75]" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-black hover:bg-neutral-800 text-white font-medium py-2.5 sm:py-3 text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative flex my-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[11px] sm:text-xs text-gray-400 font-normal">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Sign up with Google"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.64 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.81.54 3.85 1.43l2.36-2.36C16.89 3.55 14.7 2.7 12.24 2.7 7.1 2.7 2.94 6.86 2.94 12s4.16 9.3 9.3 9.3c5.37 0 8.94-3.77 8.94-9.1 0-.61-.07-1.22-.19-1.815l-8.75-.1Z" />
              </svg>
            </button>

            <button
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Sign up with Apple"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.94.04-2.07.63-2.73 1.4-.58.67-1.09 1.76-.95 2.82 1.05.08 2.11-.53 2.72-1.26" />
              </svg>
            </button>

            <button
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Sign up with Facebook"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          {/* Footer Login Link */}
          <p className="text-xs text-gray-500 mt-4 sm:mt-5 text-center">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Right Column: Live Enterprise Feature Showcase (Edge-to-Edge with Card) */}
        <div className="hidden md:flex flex-col h-full w-full">
          <AuthShowcaseCard
            className="w-full h-full"
            title="Built for Modern Organizations"
            subtitle="Onboard your team with automated payroll, leave tracking, asset custody, and role permissions."
          />
        </div>

      </div>
    </div>
  );
}
