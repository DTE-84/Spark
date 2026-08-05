import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function SettingsModal({ isOpen, onClose, onClearHistory, isClearing }) {
  const [autoClear, setAutoClear] = useState('never');

  useEffect(() => {
    const saved = localStorage.getItem('runiq_auto_clear');
    if (saved) setAutoClear(saved);
  }, []);

  const handleAutoClearChange = (val) => {
    setAutoClear(val);
    localStorage.setItem('runiq_auto_clear', val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden bg-[#0A0A0A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-[#00FF85]" />
                <h2 className="text-lg font-black tracking-tight">App Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Auto Clear Setting */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Label className="text-sm font-bold text-white">Auto-Clear History</Label>
                    <p className="text-[11px] text-neutral-400 font-medium mt-1">Automatically delete saved offers.</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={autoClear}
                    onChange={(e) => handleAutoClearChange(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl font-semibold text-white px-4 appearance-none focus:outline-none focus:ring-1 focus:ring-[#00FF85] cursor-pointer"
                  >
                    <option value="never" className="bg-[#121212] text-white">Never</option>
                    <option value="1_day" className="bg-[#121212] text-white">After 24 hours</option>
                    <option value="app_close" className="bg-[#121212] text-white">On App Close (New Session)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/5 w-full my-4" />

              {/* Manual Clear */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Label className="text-sm font-bold text-red-500 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Danger Zone
                    </Label>
                    <p className="text-[11px] text-neutral-400 font-medium mt-1">Permanently delete all your offer history.</p>
                  </div>
                </div>
                <Button 
                  onClick={onClearHistory}
                  disabled={isClearing}
                  className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl transition-all flex items-center gap-2 justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  {isClearing ? 'Clearing...' : 'Clear All History Now'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
