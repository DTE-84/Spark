import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock, MapPin, Fuel, Brain, AlertTriangle } from "lucide-react";

const ratingStyles = {
  Great: { label: "Great Offer!", color: "text-[#00FF85]", bg: "bg-[#00FF85]/10", border: "border-[#00FF85]/20", emoji: "🔥", barColor: "bg-[#00FF85]", shadow: "shadow-[#00FF85]/20" },
  Good: { label: "Good Offer", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", emoji: "👍", barColor: "bg-blue-500", shadow: "shadow-blue-500/20" },
  Fair: { label: "Fair Offer", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", emoji: "🤔", barColor: "bg-amber-500", shadow: "shadow-amber-500/20" },
  Bad: { label: "Bad Offer", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", emoji: "👎", barColor: "bg-red-500", shadow: "shadow-red-500/20" },
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      className="space-y-4"
    >
      {/* Rating Badge */}
      <div className={`rounded-[2rem] ${config.bg} ${config.border} border p-6 text-center shadow-2xl ${config.shadow} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${config.barColor} opacity-[0.03] animate-pulse-slow pointer-events-none`} />
        <motion.div 
          initial={{ scale: 0, rotate: -20 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="text-5xl mb-3 drop-shadow-2xl"
        >
          {config.emoji}
        </motion.div>
        <h3 className={`text-3xl font-black ${config.color} tracking-tight drop-shadow-md`}>{config.label}</h3>
        
        {/* Score Bar */}
        <div className="mt-4 mx-auto max-w-[220px]">
          <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: "circOut" }}
              className={`h-full rounded-full ${config.barColor} shadow-[0_0_10px_currentColor]`}
            />
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {result.reasoning && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-[1.5rem] p-5 relative overflow-hidden border-l-4 border-l-[#00FF85]/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-[#00FF85]" />
            <span className="text-[11px] font-black text-[#00FF85] uppercase tracking-widest">RunIQ Analysis</span>
          </div>
          <p className="text-sm font-medium text-white/90 leading-relaxed">
            {result.reasoning}
          </p>
        </motion.div>
      )}

      {/* AI Flags */}
      {result.flags && result.flags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2"
        >
          {result.flags.map((flag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 shadow-lg shadow-amber-500/5">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring", bounce: 0.3 }}
            className="glass-card rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-neutral-500" />
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className={`text-xl font-black tracking-tight ${stat.highlight ? 'text-[#00FF85]' : 'text-white'}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDecline}
          disabled={isAccepting}
          className="h-14 flex items-center justify-center font-bold text-sm bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl border border-white/5 transition-colors"
        >
          Clear
        </motion.button>
        <motion.button
          whileTap={!isAccepting ? { scale: 0.95 } : {}}
          onClick={onAccept}
          disabled={isAccepting}
          className="h-14 flex items-center justify-center font-black text-sm bg-[#00FF85] hover:bg-[#34D399] text-black shadow-lg shadow-[#00FF85]/20 hover:shadow-[#00FF85]/40 rounded-2xl transition-all"
        >
          {isAccepting ? "Saving..." : "Accept Offer"}
        </motion.button>
      </div>
    </motion.div>
  );
}
