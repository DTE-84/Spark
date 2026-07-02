import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock, MapPin, Fuel, Brain, AlertTriangle } from "lucide-react";

const ratingStyles = {
  Great: { label: "Great Offer!", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", emoji: "🔥", barColor: "bg-emerald-500" },
  Good: { label: "Good Offer", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", emoji: "👍", barColor: "bg-blue-500" },
  Fair: { label: "Fair Offer", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", emoji: "🤔", barColor: "bg-amber-500" },
  Bad: { label: "Bad Offer", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", emoji: "👎", barColor: "bg-red-500" },
};

const ratingScore = { Great: 100, Good: 72, Fair: 45, Bad: 20 };

export default function OfferResult({ result, onAccept, onDecline, isAccepting }) {
  if (!result) return null;

  // AI could return lower case depending on how it felt
  const ratingKey = Object.keys(ratingStyles).find(k => k.toLowerCase() === result.rating?.toLowerCase()) || "Fair";
  const config = ratingStyles[ratingKey];
  const score = ratingScore[ratingKey];

  const m = result.metrics || {};

  const stats = [
    { label: "Net Profit", value: `$${(m.net_profit || 0).toFixed(2)}`, icon: DollarSign, highlight: m.net_profit > 0 },
    { label: "Hourly Rate", value: `$${(m.hourly_rate || 0).toFixed(2)}/hr`, icon: Clock, highlight: m.hourly_rate >= 15 },
    { label: "Per Mile", value: `$${(m.per_mile_rate || 0).toFixed(2)}/mi`, icon: MapPin, highlight: m.per_mile_rate >= 1 },
    { label: "Gas Cost", value: `−$${(m.gas_cost || 0).toFixed(2)}`, icon: Fuel, highlight: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Rating Badge */}
      <div className={`rounded-2xl ${config.bg} ${config.border} border p-5 text-center`}>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-4xl mb-2"
        >
          {config.emoji}
        </motion.div>
        <h3 className={`text-2xl font-extrabold ${config.color}`}>{config.label}</h3>
        
        {/* Score Bar */}
        <div className="mt-3 mx-auto max-w-[200px]">
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${config.barColor}`}
            />
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {result.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/70 backdrop-blur-xl border border-[#10B981]/20 rounded-2xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-[#10B981]" />
            <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-wider">RunIQ Analysis</span>
          </div>
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            {result.reasoning}
          </p>
        </motion.div>
      )}

      {/* AI Flags */}
      {result.flags && result.flags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-2"
        >
          {result.flags.map((flag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {flag}
            </span>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="bg-card/70 backdrop-blur-xl border border-border/40 rounded-2xl p-4 shadow-lg shadow-black/20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={onDecline}
          disabled={isAccepting}
          className="h-14 flex items-center justify-center font-extrabold text-sm bg-muted/20 backdrop-blur-md hover:bg-muted/40 text-muted-foreground rounded-2xl border border-border/40 transition-all shadow-sm"
        >
          Clear
        </button>
        <button
          onClick={onAccept}
          disabled={isAccepting}
          className="h-14 flex items-center justify-center font-extrabold text-sm bg-primary/90 backdrop-blur-md hover:bg-primary text-primary-foreground shadow-xl shadow-primary/25 rounded-2xl transition-all"
        >
          {isAccepting ? "Saving..." : "Accept Offer"}
        </button>
      </div>
    </motion.div>
  );
}
