import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installType, setInstallType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check URL parameters on initial load before any redirects happen
    const params = new URLSearchParams(window.location.search);
    const type = params.get('install');
    if (type) {
      setInstallType(type);
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      // If we got the event and the user specifically requested an install
      // from the Hub, make sure the banner is visible
      if (type === 'android') {
        setIsVisible(true);
      }
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
        setIsVisible(false);
      }
    } else {
      alert("App installation is not fully supported in this browser, or it's already installed. You can manually install it from your browser's menu (e.g. 'Add to Home Screen' or 'Install App').");
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-4 right-4 bg-[#0A0A0A] border border-[#00FF85]/30 p-6 rounded-2xl shadow-2xl z-[100] text-center max-w-md mx-auto"
      >
        {installType === 'ios' && (
          <div className="absolute top-2 right-4 text-white/50 hover:text-white cursor-pointer text-xl p-2" onClick={() => setIsVisible(false)}>&times;</div>
        )}
        
        <div className="flex justify-center mb-4 text-[#00FF85]">
          <Download className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Install RunIQ SaaS App</h3>
        
        {installType === 'android' ? (
          <>
            <p className="text-neutral-400 text-sm mb-6">Install the app directly to your device for a native experience outside of the web browser.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsVisible(false)}
                className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={triggerInstall}
                className="flex-1 py-3 px-4 bg-[#00FF85] rounded-xl text-sm font-bold text-black hover:bg-[#34D399] transition-all shadow-lg shadow-[#00FF85]/20"
              >
                Install App
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-neutral-300 text-sm">
              To install: tap the <strong>Share</strong> button on your browser toolbar below, then scroll down and select <strong className="text-[#00FF85]">"Add to Home Screen"</strong>.
            </p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
