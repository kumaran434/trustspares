
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, ShoppingBag, Contact, Smartphone, AlertTriangle } from 'lucide-react';

const Auth: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, signupWithEmail, currentUser, resetPassword, authMessage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  
  const from = location.state?.from?.pathname || '/';
  const searchParams = new URLSearchParams(location.search);
  const brandParam = searchParams.get('brand');
  const isTemperKing = false;
  
  useEffect(() => {
      if (currentUser) {
          navigate(from, { replace: true });
      }
      // Show global auth error if present (e.g. "Session Expired")
      if (authMessage) {
          setError(authMessage);
      }
  }, [currentUser, navigate, from, authMessage]);

  // Combined identifier state (can be email or mobile)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [name, setName] = useState('');
  const [deviceModel, setDeviceModel] = useState(''); // NEW STATE
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorizedHostname, setUnauthorizedHostname] = useState<string | null>(null);
  const [isInvalidCredential, setIsInvalidCredential] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  const handleTabSwitch = (tab: 'LOGIN' | 'SIGNUP') => {
      setActiveTab(tab);
      setError(''); 
      setIsInvalidCredential(false);
      setUnauthorizedHostname(null);
      setDomainCopied(false);
  };

  // Helper to clean and validate input
  const cleanIdentifier = (input: string) => {
      const trimmed = input.trim();
      if (trimmed.includes('@')) return trimmed.toLowerCase(); // It's an email, force lowercase
      
      // It's likely a phone number, strip non-digits
      const digits = trimmed.replace(/\D/g, '');
      
      // Handle +91 or 91 prefix
      if (digits.length > 10 && (digits.startsWith('91') || digits.startsWith('091'))) {
          return digits.slice(-10);
      }
      
      return digits;
  };

  const validateInput = () => {
      const cleaned = cleanIdentifier(identifier);
      
      if (identifier.includes('@')) {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
          if (!isEmail) return "Please enter a valid Email address.";
      } else {
          // Phone validation
          const isPhone = /^\d{10}$/.test(cleaned);
          if (!isPhone) return "Please enter a valid 10-digit Mobile Number.";
      }
      return null;
  };

  const handleResetPassword = async () => {
      const cleaned = cleanIdentifier(identifier);
      if (!cleaned) return setError('Please enter Email to reset password.');
      
      // Check if it's a phone number
      if (/^\d{10}$/.test(cleaned)) {
          return setError('Password reset via Email is not available for Mobile accounts. Please contact Admin.');
      }

      setLoading(true);
      try {
          await resetPassword(cleaned);
          setError('Password reset link sent to your email! Check Inbox/Spam.');
      } catch (err: any) {
          console.error("Reset Error:", err);
          setError(err.message || 'Failed to send reset link.');
      } finally {
          setLoading(false);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsInvalidCredential(false);
      
      const valError = validateInput();
      if (valError) return setError(valError);
      if (!password) return setError('Password is required.');
      
      const cleanedAuthId = cleanIdentifier(identifier);
      // TRIMMING PASSWORD to fix mobile keyboard trailing space issues
      const cleanedPassword = password.trim(); 

      setLoading(true);
      try {
          await loginWithEmail(cleanedAuthId, cleanedPassword);
      } catch (err: any) {
          console.error("Login Error:", err);
          setLoading(false);
          
          // 'auth/invalid-credential' covers BOTH User Not Found AND Wrong Password (for security)
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
              setError('Invalid credentials. If you haven\'t created an account yet, please sign up or use Google Login.');
              setIsInvalidCredential(true);
          } else if (err.code === 'auth/user-not-found') {
              setError(`Account not found for: "${cleanedAuthId}". Please Sign Up first.`);
          } else if (err.code === 'auth/wrong-password') {
              setError('Incorrect Password.');
          } else if (err.code === 'auth/too-many-requests') {
              setError('Too many failed attempts. Please try again later.');
          } else if (err.code === 'auth/invalid-email') {
              setError(`Invalid Email format: "${cleanedAuthId}"`);
          } else {
              setError(err.message || 'Login failed. Please check your connection.');
          }
      }
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!name) return setError('Please enter your name.');
      if (!deviceModel.trim()) return setError('Please enter your Mobile Model.');
      
      const valError = validateInput();
      if (valError) return setError(valError);
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      
      const cleanedAuthId = cleanIdentifier(identifier);
      const cleanedPassword = password.trim();
      
      setLoading(true);
      try {
          // Pass default 'MOBILE' industry initially.
          await signupWithEmail(cleanedAuthId, cleanedPassword, name, 'MOBILE', deviceModel.trim());
      } catch (err: any) {
          console.error("Signup Error:", err);
          setLoading(false);
          if (err.code === 'auth/email-already-in-use') {
              setError('This email is already registered. Please go to Login.');
          } else if (err.code === 'auth/weak-password') {
              setError('Password is too weak. Please use a stronger password.');
          } else {
              setError(err.message || 'Signup failed.');
          }
      }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      setError('');
      setUnauthorizedHostname(null);
      setDomainCopied(false);
      try {
          await loginWithGoogle();
      } catch (err: any) {
          console.error("Google Login Error:", err);
          setLoading(false);
          
          if (err.code === 'auth/unauthorized-domain') {
              setError(`Google Login failed: This domain (${window.location.hostname}) is unauthorized by Firebase.`);
              setUnauthorizedHostname(window.location.hostname);
          } else if (err.code === 'auth/popup-closed-by-user') {
              setError('Google login cancelled.');
          } else if (err.code === 'auth/popup-blocked') {
              setError('Popup blocked. Allow popups for this site.');
          } else {
              setError(err.message || 'Google login failed.');
          }
      }
  };

  return (
    <div className={`min-h-[100dvh] flex items-center justify-center p-4 pb-20 relative overflow-y-auto transition-colors duration-500 ${isTemperKing ? 'bg-[#0f0f0f]' : 'bg-slate-50'}`}>
      <button 
        onClick={() => navigate(isTemperKing ? '/temper-king' : '/')} 
        className={`absolute top-4 left-4 p-2 rounded-full shadow-sm z-10 transition-all border ${isTemperKing ? 'bg-white/5 text-[#f2ca50] hover:text-white hover:bg-white/10 border-white/15' : 'bg-white text-gray-500 hover:text-gray-900 border-gray-100'}`}
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md my-auto">
        
        {isTemperKing ? (
          <div className="text-center mb-6 animate-in fade-in slide-in-from-top duration-700">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto mb-3 border-2 border-[#f2ca50]/50 shadow-amber-950/20">
                  <span className="text-3xl select-none">👑</span>
              </div>
              <h1 className="font-playfair text-2xl font-black text-white tracking-tight uppercase">TEMPER<span className="text-[#f2ca50]">KING</span></h1>
              <p className="text-[#f2ca50] font-bold text-[9px] mt-1 uppercase tracking-widest font-geist">கண்ணாடி போல பாதுகாப்பு (Premium Shield Portal)</p>
          </div>
        ) : (
          <div className="text-center mb-6 animate-in fade-in slide-in-from-top duration-700">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto mb-3 border-4 border-white shadow-blue-100">
                  <ShieldCheck size={36} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">TrustSpares</h1>
              <p className="text-blue-600 font-bold text-[10px] mt-1 uppercase tracking-widest">Safe Repairs Market</p>
          </div>
        )}

        <div className={`rounded-3xl shadow-2xl overflow-hidden transition-all border ${isTemperKing ? 'bg-[#181818] border-white/10 shadow-black/80 text-white' : 'bg-white shadow-blue-900/5 border-slate-100'}`}>
            
            <div className={`flex p-1.5 border-b ${isTemperKing ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <button 
                    onClick={() => handleTabSwitch('LOGIN')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === 'LOGIN' 
                            ? (isTemperKing ? 'bg-[#181818] text-[#f2ca50] shadow-sm' : 'bg-white text-blue-600 shadow-sm') 
                            : (isTemperKing ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')
                    }`}
                >
                    <Lock size={16} /> Login
                </button>
                <button 
                    onClick={() => handleTabSwitch('SIGNUP')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === 'SIGNUP' 
                            ? (isTemperKing ? 'bg-[#181818] text-[#f2ca50] shadow-sm' : 'bg-white text-blue-600 shadow-sm') 
                            : (isTemperKing ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')
                    }`}
                >
                    <UserCircle size={16} /> Create Account
                </button>
            </div>

            <div className="p-6 md:p-8">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold mb-4 animate-in shake duration-300 break-words flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* --- NEW: USER FRIENDLY FIREBASE DOMAIN AUTHORIZATION TROUBLESHOOTER --- */}
                {unauthorizedHostname && (
                    <div className="bg-blue-50/85 border border-blue-100 text-slate-800 p-4 rounded-2xl text-xs space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-1.5 font-extrabold text-blue-700 text-sm">
                            <ShieldCheck size={18} className="shrink-0 animate-pulse text-blue-600" />
                            <span>Firebase Domain Authorization Required</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-semibold">
                            Google Login requires your temporary Cloud Run development domain to be whitelisted under your Google Console domains. To authorize it, please do the following:
                        </p>
                        
                        <div className="bg-white p-3 rounded-xl border border-blue-100 font-mono text-xs flex items-center justify-between gap-2 overflow-hidden shadow-sm">
                            <span className="truncate select-all text-slate-800 font-black tracking-tight">{unauthorizedHostname}</span>
                            <button 
                                type="button" 
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(unauthorizedHostname);
                                        setDomainCopied(true);
                                        setTimeout(() => setDomainCopied(false), 3000);
                                    } catch (e) {
                                        const textarea = document.createElement('textarea');
                                        textarea.value = unauthorizedHostname;
                                        document.body.appendChild(textarea);
                                        textarea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textarea);
                                        setDomainCopied(true);
                                        setTimeout(() => setDomainCopied(false), 3000);
                                    }
                                }}
                                className={`font-black px-3 py-1.5 rounded-lg active:scale-95 transition-all text-[10px] ${domainCopied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            >
                                {domainCopied ? 'Copied! ✅' : 'Copy Domain'}
                            </button>
                        </div>
                        
                        <div className="space-y-2 text-slate-600 font-medium">
                            <div className="flex items-start gap-1.5">
                                <span className="font-extrabold text-blue-600">1.</span>
                                <span>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline hover:text-blue-800">Firebase Console</a>.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <span className="font-extrabold text-blue-600">2.</span>
                                <span>Select your project <b>studio-4565976316-37893</b>.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <span className="font-extrabold text-blue-600">3.</span>
                                <span>Go to <b>Build &gt; Authentication</b>, then click the <b>Settings</b> tab.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <span className="font-extrabold text-blue-600">4.</span>
                                <span>In the <b>Authorized domains</b> list, click <b>Add domain</b>, paste the copied hostname, and click <b>Save</b>.</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NEW: INVALID CREDENTIALS SWEEP TROUBLESHOOTER --- */}
                {isInvalidCredential && activeTab === 'LOGIN' && (
                    <div className="bg-amber-50/85 border border-amber-100 text-slate-800 p-4 rounded-2xl text-xs space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-1.5 font-extrabold text-amber-700 text-sm">
                            <AlertTriangle size={17} className="shrink-0 text-amber-600" />
                            <span>Authentication Tip</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-semibold">
                            These credentials do not exist in our database. Since this is a secure sandbox environment, you must first register an account before signing in, or use Google login.
                        </p>
                        <div className="flex flex-col gap-2 pt-1">
                            <button 
                                type="button" 
                                onClick={() => handleTabSwitch('SIGNUP')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-center shadow-sm transition-all hover:scale-[1.01] active:scale-95"
                            >
                                Switch to "Create Account" Tab
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'LOGIN' ? (
                    <form onSubmit={handleLogin} className="space-y-4" noValidate>
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className={`w-full border-2 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-2 py-3.5 text-sm font-bold ${
                                isTemperKing 
                                    ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] text-slate-300' 
                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-slate-800'
                            }`}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span>Login with Google</span>
                        </button>
                        
                        <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400"><span>or</span></div>

                        <div>
                            <div className="relative">
                                <Contact size={18} className="absolute left-4 top-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Email or 10-digit Mobile"
                                    className={`w-full rounded-2xl pl-12 pr-4 py-4 font-bold outline-none transition-all font-sans ${
                                        isTemperKing 
                                            ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                            : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans'
                                    }`}
                                    value={identifier}
                                    onChange={(e) => { setIdentifier(e.target.value.toLowerCase()); setError(''); }}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Password"
                                    className={`w-full rounded-2xl pl-12 pr-12 py-4 font-bold outline-none transition-all ${
                                        isTemperKing 
                                            ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                            : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="current-password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button 
                                    type="button" 
                                    onClick={handleResetPassword}
                                    className={`text-xs font-bold transition-colors ${
                                        isTemperKing ? 'text-[#f2ca50] hover:text-[#ffe088]' : 'text-blue-600 hover:underline'
                                    }`}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-[0.98] ${
                                isTemperKing 
                                    ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] shadow-[#f2ca50]/10' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? 'Processing...' : 'Login'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-4" noValidate>
                        
                        <div className="relative">
                            <UserCircle size={18} className="absolute left-4 top-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Your Name"
                                className={`w-full rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                                    isTemperKing 
                                        ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                            />
                        </div>

                        <div className="relative">
                            <Contact size={18} className="absolute left-4 top-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Email or 10-digit Mobile"
                                className={`w-full rounded-2xl pl-12 pr-4 py-4 font-bold outline-none transition-all font-sans ${
                                    isTemperKing 
                                        ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                value={identifier}
                                onChange={(e) => { setIdentifier(e.target.value.toLowerCase()); setError(''); }}
                                autoCapitalize="none"
                                autoCorrect="off"
                            />
                        </div>

                        <div className="relative">
                            <Smartphone size={18} className="absolute left-4 top-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="My Mobile Model (e.g. Samsung A50)"
                                className={`w-full rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                                    isTemperKing 
                                        ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                value={deviceModel}
                                onChange={(e) => { setDeviceModel(e.target.value); setError(''); }}
                            />
                        </div>

                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Set Password (min 6 chars)"
                                className={`w-full rounded-2xl pl-12 pr-12 py-4 font-bold outline-none transition-all ${
                                    isTemperKing 
                                        ? 'bg-[#222222] border border-white/5 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#f2ca50] focus:border-[#f2ca50]' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-[0.98] ${
                                isTemperKing 
                                    ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] shadow-[#f2ca50]/10' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                )}
            </div>
        </div>

        {isTemperKing && (
          <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom duration-500">
            <button
              onClick={() => navigate('/')}
              className="text-[#f2ca50] hover:text-white transition-all bg-white/[0.04] border border-white/10 hover:border-[#f2ca50]/50 rounded-2xl py-3 px-6 inline-flex items-center gap-2 tracking-wide cursor-pointer shadow-md text-xs font-black active:scale-[0.98]"
            >
              <span>🔧 Go to TrustSpares Central (பிற ஸ்பேர்ஸ் பார்க்க)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
