import React, { useState } from "react";
import { offersApi } from "@/api/offers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, LogOut } from "lucide-react";
import OfferForm from "@/components/spark/OfferForm";
import OfferResult from "@/components/spark/OfferResult";
import OfferHistory from "@/components/spark/OfferHistory";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#0A0A0A] text-white">
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#333] shadow-[#10B981]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">RunIQ</h1>
                <p className="text-xs text-neutral-400 font-medium">Know your worth before you drive</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
              <LogOut className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 -mt-2">
        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-border/40 p-6 mb-6">
          <OfferForm onEvaluate={handleEvaluate} isLoading={evaluateMutation.isPending} />
        </div>

        {/* Result */}
        {result && (
          <div className="mb-5">
            <OfferResult 
              result={result} 
              onAccept={handleAccept} 
              onDecline={handleDecline} 
              isAccepting={createMutation.isPending} 
            />
          </div>
        )}

        {/* History */}
        <div className="pb-8">
          <OfferHistory offers={offers} onDelete={(id) => deleteMutation.mutate(id)} />
        </div>
      </div>
    </div>
  );
}