import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Building2, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

type AuthMode = 'signup' | 'login';
type SignupStep = 'credentials' | 'details';
type OrgChoice = 'create' | 'join';

export default function Login() {
  const { login, signup, createOrganisation, joinOrganisation, logout, user, organisation, isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  // Primary mode: 'signup' by default, or 'login' if set in query params
  const initialMode: AuthMode = location.search.includes('mode=login') ? 'login' : 'signup';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [signupStep, setSignupStep] = useState<SignupStep>('credentials');
  const [orgChoice, setOrgChoice] = useState<OrgChoice>('create');

  // Login form state - Email only
  const [email, setEmail] = useState('admin@lokus.io');
  const [password, setPassword] = useState('password123');

  // Signup form state - Email only
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  // Org setup state
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('ACME-2026');

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const from =
    typeof location.state?.from === 'string' &&
    location.state.from.startsWith('/') &&
    !location.state.from.startsWith('//')
      ? location.state.from
      : '/dashboard';

  // If already logged in and already has an organisation, redirect to destination
  if (!isLoading && isAuthenticated && organisation) {
    return <Navigate to={from} replace />;
  }

  // Handle Login submission (Email only)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const emailToUse = email.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please enter a valid email address.');
      setBusy(false);
      return;
    }

    try {
      await login(emailToUse, password);
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  // Handle Step 1 of Signup (Credentials Validation)
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailToUse = signupEmail.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSignupStep('details');
  };

  // Handle Step 2 of Signup (Complete Registration & Workspace Setup)
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (orgChoice === 'create' && !orgName.trim()) {
      setError('Please enter an organization name.');
      return;
    }

    if (orgChoice === 'join' && !inviteCode.trim()) {
      setError('Please enter an invitation code.');
      return;
    }

    setBusy(true);

    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword);

      if (orgChoice === 'create') {
        await createOrganisation(orgName.trim());
      } else {
        await joinOrganisation(inviteCode.trim());
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to complete registration and workspace setup');
    } finally {
      setBusy(false);
    }
  };

  // Handle existing authenticated user without an organisation
  const handleExistingUserOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (orgChoice === 'create') {
        if (!orgName.trim()) {
          throw new Error('Please enter an organization name');
        }
        await createOrganisation(orgName.trim());
      } else {
        if (!inviteCode.trim()) {
          throw new Error('Please enter an invitation code');
        }
        await joinOrganisation(inviteCode.trim());
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to complete workspace setup');
    } finally {
      setBusy(false);
    }
  };

  const isPostLoginWithoutOrg = isAuthenticated && !organisation;

  return (
    <div className="h-screen max-h-screen w-full bg-[#f2f4f6] flex items-center justify-center p-3 sm:p-5 lg:p-7 font-sans text-gray-900 overflow-hidden">
      {/* Centered Main Bento Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl lg:max-w-5xl w-full max-h-[96vh] p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden">
        
        {/* Left Column: Form Content */}
        <div className="flex flex-col justify-center px-1 sm:px-3 py-1">

          {/* ================= CASE 1: EXISTING AUTHENTICATED USER WITHOUT ORG ================= */}
          {isPostLoginWithoutOrg ? (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 uppercase tracking-wider">
                  Workspace Required
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                Set up workspace
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 mb-5 leading-normal">
                {user?.name ? `Welcome, ${user.name}! ` : ''}Choose whether to create a new organization or join an existing team.
              </p>

              {/* Two Option Cards: [ Create an Organization ] vs [ Join an Organization ] */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => { setOrgChoice('create'); setError(''); }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    orgChoice === 'create'
                      ? 'border-[#107C41] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${
                    orgChoice === 'create' ? 'bg-[#107C41] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 leading-snug">Create Organization</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Start new workspace as admin</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setOrgChoice('join'); setError(''); }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    orgChoice === 'join'
                      ? 'border-[#107C41] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${
                    orgChoice === 'join' ? 'bg-[#107C41] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 leading-snug">Join Organization</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Enter invitation code</p>
                  </div>
                </button>
              </div>

              <form onSubmit={handleExistingUserOrgSubmit} className="space-y-4">
                {orgChoice === 'create' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Technologies"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Invitation Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACME-2026"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono uppercase shadow-xs"
                    />
                    <p className="text-xs text-emerald-700 mt-1.5 pl-1">
                      Tip: Use <strong>ACME-2026</strong> for demo organization.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                    {error}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-2xl bg-[#107C41] hover:bg-[#0d6836] text-white font-semibold py-3 text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up workspace...
                      </span>
                    ) : orgChoice === 'create' ? (
                      'Create Organization & Enter'
                    ) : (
                      'Join Organization & Enter'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'signup' && signupStep === 'details' ? (
            /* ================= CASE 2: SIGNUP STEP 2 (NAME + CREATE/JOIN ORG) ================= */
            <div className="animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Back to Step 1 & Step Indicator */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => { setSignupStep('credentials'); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to email</span>
                </button>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider">
                  Step 2 of 2
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-4">
                Complete your profile
              </h1>

              <form onSubmit={handleCompleteSignup} className="space-y-3.5">
                {/* Full Name Input with Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                  />
                </div>

                {/* Workspace Selection Cards */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Workspace Setup
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setOrgChoice('create'); setError(''); }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        orgChoice === 'create'
                          ? 'border-[#107C41] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                        orgChoice === 'create' ? 'bg-[#107C41] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 leading-snug">Create Organization</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Start new workspace as admin</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOrgChoice('join'); setError(''); }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        orgChoice === 'join'
                          ? 'border-[#107C41] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                        orgChoice === 'join' ? 'bg-[#107C41] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 leading-snug">Join Organization</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Use invite code from team</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Conditional Input based on Org Choice */}
                {orgChoice === 'create' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Technologies"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Invitation Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACME-2026"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono uppercase shadow-xs"
                    />
                    <p className="text-xs text-emerald-700 mt-1 pl-1">
                      Tip: Use <strong>ACME-2026</strong> for demo organization.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold py-3 text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Finishing setup & launching...
                      </span>
                    ) : orgChoice === 'create' ? (
                      'Create Organization & Launch'
                    ) : (
                      'Join Organization & Launch'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'signup' ? (
            /* ================= CASE 3: SIGNUP STEP 1 (CLEAN EMAIL ONLY) ================= */
            <div className="animate-in fade-in duration-200">
              <img
                src="/lokus-logo.png"
                alt="Lokus"
                className="h-7 w-auto object-contain mix-blend-multiply mb-5"
              />
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
                Create account
              </h1>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Email with Label - Email Only */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                  />
                </div>

                {/* Password with Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.75]" /> : <Eye className="w-4 h-4 stroke-[1.75]" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold py-3 text-sm transition-all duration-200 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Social Login Buttons */}
              <div className="relative flex my-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-xs text-gray-400 font-normal">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="flex items-center justify-center gap-3.5">
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Google"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.64 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.81.54 3.85 1.43l2.36-2.36C16.89 3.55 14.7 2.7 12.24 2.7 7.1 2.7 2.94 6.86 2.94 12s4.16 9.3 9.3 9.3c5.37 0 8.94-3.77 8.94-9.1 0-.61-.07-1.22-.19-1.815l-8.75-.1Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Apple"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.94.04-2.07.63-2.73 1.4-.58.67-1.09 1.76-.95 2.82 1.05.08 2.11-.53 2.72-1.26" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>

              {/* Toggle to Login mode */}
              <div className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </div>
          ) : (
            /* ================= CASE 4: LOGIN FORM (CLEAN EMAIL ONLY) ================= */
            <div className="animate-in fade-in duration-200">
              <img
                src="/lokus-logo.png"
                alt="Lokus"
                className="h-7 w-auto object-contain mix-blend-multiply mb-5"
              />
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
                Welcome back!
              </h1>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email with Label - Email Only */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@lokus.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                  />
                </div>

                {/* Password with Label & Forgot Link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions dispatched to your administrator.')}
                      className="text-xs font-semibold text-emerald-700 hover:underline transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.75]" /> : <Eye className="w-4 h-4 stroke-[1.75]" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold py-3 text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>

              {/* Social Login Buttons */}
              <div className="relative flex my-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-xs text-gray-400 font-normal">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="flex items-center justify-center gap-3.5">
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Google"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.64 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.81.54 3.85 1.43l2.36-2.36C16.89 3.55 14.7 2.7 12.24 2.7 7.1 2.7 2.94 6.86 2.94 12s4.16 9.3 9.3 9.3c5.37 0 8.94-3.77 8.94-9.1 0-.61-.07-1.22-.19-1.815l-8.75-.1Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Apple"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.94.04-2.07.63-2.73 1.4-.58.67-1.09 1.76-.95 2.82 1.05.08 2.11-.53 2.72-1.26" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  title="Continue with Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>

              {/* Toggle to Sign Up mode */}
              <div className="mt-5 text-center text-sm text-gray-500">
                Not a member?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setSignupStep('credentials'); setError(''); }}
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign up now
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Hero Illustration Container */}
        <div className="bg-[#f0f8f3] rounded-[1.75rem] p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-between text-center h-full max-h-[500px] border border-emerald-50/70 select-none">
          {/* Top Illustration Image */}
          <div className="w-full flex-1 flex items-center justify-center min-h-0 py-2">
            <img
              src="/asset-management-access-control.png"
              alt="Asset Management & Access Control Illustration"
              className="w-full max-h-[240px] sm:max-h-[270px] lg:max-h-[295px] object-contain drop-shadow-sm pointer-events-none"
              loading="eager"
            />
          </div>

          {/* Bottom Content: Dynamic Headline & Subtext */}
          <div className="w-full flex flex-col items-center mt-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
              {isPostLoginWithoutOrg || (mode === 'signup' && signupStep === 'details')
                ? orgChoice === 'create'
                  ? 'Launch Your Organization'
                  : 'Connect With Your Team'
                : mode === 'signup'
                ? 'Join Lokus Enterprise'
                : 'Asset Management & Access Control'}
            </h2>

            <p className="text-xs sm:text-[13px] text-gray-600 mt-1.5 max-w-xs leading-relaxed">
              {isPostLoginWithoutOrg || (mode === 'signup' && signupStep === 'details')
                ? orgChoice === 'create'
                  ? 'Deploy cryptographic zero-trust identity, roles, and asset tracking in minutes.'
                  : 'Access organization resources, assigned equipment, and roles seamlessly.'
                : mode === 'signup'
                ? 'Manage organizational assets, roles, and permissions seamlessly in one place.'
                : 'Track assets, manage roles, and keep everything organized in one place.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
