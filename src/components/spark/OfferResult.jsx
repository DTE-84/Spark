import React from "react";

import { motion } from "framer-motion";
import { DollarSign, Clock, MapPin, Fuel } from "lucide-react";

const ratingStyles = {
  great: { label: "Great Offer!", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", emoji: "🔥", barColor: "bg-emerald-500" },
  good: { label: "Good Offer", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", emoji: "👍", barColor: "bg-blue-500" },
  fair: { label: "Fair Offer", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", emoji: "🤔", barColor: "bg-amber-500" },
  bad: { label: "Bad Offer", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", emoji: "👎", barColor: "bg-red-500" },
};

const ratingScore = { great: 100, good: 72, fair: 45, bad: 20 };

export default function OfferResult({ result }) {
  if (!result) return null;

  const rating = result.rating in ratingStyles ? result.rating : "fair";
  const config = ratingStyles[rating];
  const score = ratingScore[rating];

  const stats = [
    { label: "Net Profit", value: `$${result.net_profit.toFixed(2)}`, icon: DollarSign, highlight: result.net_profit > 0 },
    { label: "Hourly Rate", value: `$${result.hourly_rate.toFixed(2)}/hr`, icon: Clock, highlight: result.hourly_rate >= 15 },
    { label: "Per Mile", value: `$${result.per_mile_rate.toFixed(2)}/mi`, icon: MapPin, highlight: result.per_mile_rate >= 1 },
    { label: "Gas Cost", value: `−$${result.gas_cost.toFixed(2)}`, icon: Fuel, highlight: false },
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
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${config.barColor}`}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
