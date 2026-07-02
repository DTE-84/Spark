import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Key, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveLicense } from '@/utils/auth';

export default function Auth() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!licenseKey.trim()) {
      setError('Please enter a license key.');
      return;
    }

    setLoading(true);

    try {
      // Use local mockup if we are running in local Vite without Vercel backend
      if (import.meta.env.DEV && licenseKey === 'TEST_KEY') {
        saveLicense(licenseKey);
        navigate('/');
        return;
      }

      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey })
      });

      const data = await res.json();

      if (res.ok) {
        saveLicense(licenseKey);
        navigate('/');
      } else {
        setError(data.error || 'Failed to verify license.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productUrl = import.meta.env.VITE_GUMROAD_PRODUCT_URL || '#';

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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">SparkIQ</h1>
          <p className="text-sm text-neutral-400 font-medium">Unlock the ultimate driver intelligence suite.</p>
        </div>

        <div className="bg-[#121212]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/5 p-8 mb-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">License Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                  placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-[#10B981] hover:bg-[#34D399] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] focus:ring-offset-[#121212] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Unlock App'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-3">Don't have a license yet?</p>
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#10B981] hover:text-[#34D399] transition-colors"
          >
            Get lifetime access for $4.99 <CheckCircle2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
