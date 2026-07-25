import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, Fuel, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, parseISO } from "date-fns";

const ratingStyles = {
  Great: "bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20 shadow-[0_0_15px_rgba(0,255,133,0.1)]",
  Good: "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  Fair: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  Bad: "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  great: "bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20 shadow-[0_0_15px_rgba(0,255,133,0.1)]",
  good: "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  fair: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  bad: "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
};

export default function OfferHistory({ offers, onDelete }) {
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (dateStr) => {
    setExpandedDays((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const groupedOffers = useMemo(() => {
    const groups = {};
    offers.forEach((offer) => {
      const dateStr = offer.created_at ? format(parseISO(offer.created_at), "yyyy-MM-dd") : "Unknown";
      if (!groups[dateStr]) {
        groups[dateStr] = {
          dateStr,
          date: offer.created_at ? parseISO(offer.created_at) : new Date(),
          offers: [],
          totalPay: 0,
          totalTips: 0,
          totalGas: 0,
        };
      }
      groups[dateStr].offers.push(offer);
      groups[dateStr].totalPay += offer.pay || 0;
      groups[dateStr].totalTips += offer.tips || 0;
      groups[dateStr].totalGas += offer.gas_cost || 0;
    });

    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [offers]);

  const globalTotals = useMemo(() => {
    return offers.reduce((acc, offer) => {
      acc.pay += (offer.pay || 0);
      acc.tips += (offer.tips || 0);
      acc.gas += (offer.gas_cost || 0);
      return acc;
    }, { pay: 0, tips: 0, gas: 0 });
  }, [offers]);

  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Calendar className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</h3>
      </div>
      
      {/* Global Running Totals Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 shadow-lg shadow-[#00FF85]/5 border border-[#00FF85]/10 bg-gradient-to-br from-[#00FF85]/10 to-transparent"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-[#00FF85] uppercase tracking-widest">All-Time Running Totals</h4>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1"><Wallet className="w-3 h-3"/> Pay</span>
            <span className="font-extrabold text-foreground text-xl">${globalTotals.pay.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 uppercase font-bold flex items-center gap-1"><DollarSign className="w-3 h-3"/> Tips</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xl">${globalTotals.tips.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-red-500/70 uppercase font-bold flex items-center gap-1"><Fuel className="w-3 h-3"/> Gas</span>
            <span className="font-extrabold text-red-500/90 text-xl">-${globalTotals.gas.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {groupedOffers.map((group) => {
          const isCurrentDay = isToday(group.date);
          // Default expand if it's today, otherwise check state
          const isExpanded = expandedDays[group.dateStr] ?? isCurrentDay;

          return (
            <motion.div 
              key={group.dateStr} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(group.dateStr)}
                className="w-full flex flex-col p-5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                    {isCurrentDay ? "Today" : format(group.date, "MMM d, yyyy")}
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                      {group.offers.length} {group.offers.length === 1 ? 'offer' : 'offers'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                {/* Daily Totals */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="flex flex-col p-2 bg-background rounded-lg border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-0.5"><Wallet className="w-3 h-3"/> Total Pay</span>
                    <span className="font-extrabold text-foreground text-sm">${group.totalPay.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 uppercase font-bold flex items-center gap-1 mb-0.5"><DollarSign className="w-3 h-3"/> Tips</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">${group.totalTips.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                    <span className="text-[10px] text-red-500/70 uppercase font-bold flex items-center gap-1 mb-0.5"><Fuel className="w-3 h-3"/> Gas</span>
                    <span className="font-extrabold text-red-500/90 text-sm">-${group.totalGas.toFixed(2)}</span>
                  </div>
                </div>
              </button>

              {/* Offers List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-white/5"
                  >
                    <div className="p-3 space-y-3 bg-black/20">
                      {group.offers.map((offer, index) => (
                        <motion.div 
                          key={offer.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between group glass-card rounded-2xl p-4 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ratingStyles[offer.rating] || ratingStyles.fair}`}>
                              {offer.rating}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-black text-lg text-white">${offer.pay?.toFixed(2)}</span>
                                {offer.tips > 0 && <span className="text-[11px] font-bold text-[#00FF85]">+{offer.tips.toFixed(2)} tip</span>}
                              </div>
                              <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                                {offer.total_miles?.toFixed(1) || offer.miles}mi • {offer.time_minutes}min • <span className="text-white">${offer.hourly_rate?.toFixed(2)}/hr</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-neutral-500 hidden sm:block">
                              {offer.created_at ? format(parseISO(offer.created_at), "h:mm a") : ""}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-60 group-hover:opacity-100"
                              onClick={() => onDelete(offer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}