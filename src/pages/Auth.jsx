import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const installType = searchParams.get('install');
  const [showInstallBanner, setShowInstallBanner] = useState(!!installType);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const triggerInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setInstallPromptEvent(null);
        setShowInstallBanner(false);
      }
    } else {
      alert("App installation is not supported or already installed. You can install it from your browser menu.");
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
      // OAuth will redirect, so no need to manually navigate here
    } catch (err) {
      setError(err.message || 'An error occurred during Google authentication.');
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background effects */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00FF85]/10 blur-[140px] rounded-full pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#00FF85]/5 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-8"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 flex items-center justify-center shadow-2xl shadow-[#00FF85]/10 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#00FF85]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="w-8 h-8 text-[#00FF85] relative z-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">RunIQ</h1>
          <p className="text-sm text-neutral-400 font-medium text-center">Stop guessing. Know which app to run — every time.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/5 p-8 mb-6 relative overflow-hidden"
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                  placeholder="driver@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 text-[#10B981] text-sm bg-[#10B981]/10 p-3 rounded-lg border border-[#10B981]/20">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#00FF85]/20 text-sm font-bold text-black bg-[#00FF85] hover:bg-[#34D399] hover:shadow-[#00FF85]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF85] focus:ring-offset-[#0A0A0A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121212] text-neutral-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-white/5 rounded-xl shadow-sm text-sm font-bold text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF85] focus:ring-offset-[#0A0A0A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
            </svg>
            Google
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>


      </div>

      {/* INSTALLATION BANNERS */}
      {showInstallBanner && installType === 'android' && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 bg-[#0A0A0A] border border-[#00FF85]/30 p-6 rounded-2xl shadow-2xl z-50 text-center"
        >
          <div className="flex justify-center mb-4 text-[#00FF85]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Install RunIQ SaaS App</h3>
          <p className="text-neutral-400 text-sm mb-6">Install the app to your device for a native experience without the browser.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
            >
              Skip
            </button>
            <button 
              onClick={triggerInstall}
              className="flex-1 py-3 px-4 bg-[#00FF85] rounded-xl text-sm font-bold text-black hover:bg-[#34D399] transition-all shadow-lg shadow-[#00FF85]/20"
            >
              Install App
            </button>
          </div>
        </motion.div>
      )}

      {showInstallBanner && installType === 'ios' && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 bg-[#0A0A0A] border border-[#00FF85]/30 p-6 rounded-2xl shadow-2xl z-50 text-center"
        >
          <div className="absolute top-2 right-4 text-white/50 cursor-pointer text-xl" onClick={() => setShowInstallBanner(false)}>&times;</div>
          <div className="flex justify-center mb-4 text-[#00FF85]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Install RunIQ SaaS App</h3>
          <p className="text-neutral-300 text-sm">
            To install: tap the <strong>Share</strong> button on your browser toolbar, then scroll down and select <strong className="text-[#00FF85]">"Add to Home Screen"</strong>.
          </p>
        </motion.div>
      )}
    </div>
  );
}
