import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

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
      });
      if (error) throw error;
      // OAuth will redirect, so no need to manually navigate here
    } catch (err) {
      setError(err.message || 'An error occurred during Google authentication.');
      setLoading(false);
    }
  };

  const stripeCheckoutUrl = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '#';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10B981]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#333] flex items-center justify-center shadow-xl shadow-[#10B981]/10 mb-6">
            <Sparkles className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">RunIQ</h1>
          <p className="text-sm text-neutral-400 font-medium text-center">Stop guessing. Know which app to run — every time.</p>
        </div>

        <div className="bg-[#121212]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/5 p-8 mb-6">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-[#10B981] hover:bg-[#34D399] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] focus:ring-offset-[#121212] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-bold text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] focus:ring-offset-[#121212] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-3">Want to become a RunIQ member?</p>
          <a
            href={stripeCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34D399] transition-colors"
          >
            Start your subscription <CheckCircle2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
