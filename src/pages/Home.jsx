import React, { useState } from "react";
import { offersApi } from "@/api/offers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import OfferForm from "@/components/spark/OfferForm";
import OfferResult from "@/components/spark/OfferResult";
import OfferHistory from "@/components/spark/OfferHistory";

function evaluateOffer({ pay, miles, time_minutes, mpg, gas_price }) {
  const gallons = miles / mpg;
  const gas_cost = gallons * gas_price;
  const net_profit = pay - gas_cost;
  const hourly_rate = (net_profit / time_minutes) * 60;
  const per_mile_rate = pay / miles;

  let rating;
  if (hourly_rate >= 20 && per_mile_rate >= 1.0) rating = "great";
  else if (hourly_rate >= 15 && per_mile_rate >= 0.75) rating = "good";
  else if (hourly_rate >= 10 && per_mile_rate >= 0.50) rating = "fair";
  else rating = "bad";

  return { gas_cost, net_profit, hourly_rate, per_mile_rate, rating };
}

export default function Home() {
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: offers = [] } = useQuery({
    queryKey: ["offers"],
    queryFn: () => offersApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => offersApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => offersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });

  const handleEvaluate = (formData) => {
    const calculated = evaluateOffer(formData);
    const fullData = { ...formData, ...calculated };
    setResult(fullData);
    createMutation.mutate(fullData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Spark Analyzer</h1>
              <p className="text-xs text-primary-foreground/70 font-medium">Know your worth before you drive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 -mt-2">
        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border/50 p-5 mb-5">
          <OfferForm onEvaluate={handleEvaluate} isLoading={createMutation.isPending} />
        </div>

        {/* Result */}
        {result && (
          <div className="mb-5">
            <OfferResult result={result} />
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