import React, { useState } from "react";
import { offersApi } from "@/api/offers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, LogOut } from "lucide-react";
import OfferForm from "@/components/spark/OfferForm";
import OfferResult from "@/components/spark/OfferResult";
import OfferHistory from "@/components/spark/OfferHistory";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: offers = [] } = useQuery({
    queryKey: ["offers", user?.id],
    queryFn: () => offersApi.list(user?.id),
    enabled: !!user?.id
  });

  const evaluateMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        let errorMsg = 'Failed to evaluate offer';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      return { ...formData, ...data };
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      alert("Evaluation Error: " + error.message);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => offersApi.create(data, user?.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers", user?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => offersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers", user?.id] }),
  });

  const handleEvaluate = (formData) => {
    evaluateMutation.mutate(formData);
  };

  const handleAccept = () => {
    if (result) {
      createMutation.mutate(result);
      setResult(null);
    }
  };

  const handleDecline = () => {
    setResult(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-[#00FF85]/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50"
      >
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 shadow-lg shadow-[#00FF85]/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00FF85]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Sparkles className="w-5 h-5 text-[#00FF85] relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">RunIQ</h1>
                <p className="text-[11px] uppercase tracking-widest text-[#00FF85] font-semibold opacity-80">Drive Smarter</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut} 
              className="p-2.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 hover:text-white text-neutral-400 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20 relative z-10 space-y-6">
        
        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="glass-panel rounded-[2rem] p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <OfferForm onEvaluate={handleEvaluate} isLoading={evaluateMutation.isPending} />
          </div>
        </motion.div>

        {/* Result Area */}
        <AnimatePresence mode="popLayout">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            >
              <OfferResult 
                result={result} 
                onAccept={handleAccept} 
                onDecline={handleDecline} 
                isAccepting={createMutation.isPending} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <OfferHistory offers={offers} onDelete={(id) => deleteMutation.mutate(id)} />
        </motion.div>
      </div>
    </div>
  );
}