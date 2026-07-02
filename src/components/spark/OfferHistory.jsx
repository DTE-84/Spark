import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, Fuel, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, parseISO } from "date-fns";

const ratingStyles = {
  Great: "bg-emerald-500/10 text-emerald-500",
  Good: "bg-blue-500/10 text-blue-500",
  Fair: "bg-amber-500/10 text-amber-500",
  Bad: "bg-red-500/10 text-red-500",
  great: "bg-emerald-500/10 text-emerald-500",
  good: "bg-blue-500/10 text-blue-500",
  fair: "bg-amber-500/10 text-amber-500",
  bad: "bg-red-500/10 text-red-500",
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

  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Calendar className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Daily Dashboard</h3>
      </div>
      
      <div className="space-y-4">
        {groupedOffers.map((group) => {
          const isCurrentDay = isToday(group.date);
          // Default expand if it's today, otherwise check state
          const isExpanded = expandedDays[group.dateStr] ?? isCurrentDay;

          return (
            <div key={group.dateStr} className="bg-card/70 backdrop-blur-xl rounded-3xl border border-border/40 overflow-hidden shadow-2xl shadow-black/30">
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
                    className="border-t border-border/50"
                  >
                    <div className="p-3 space-y-2 bg-background/50">
                      {group.offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between group bg-background/60 backdrop-blur-md rounded-2xl p-4 border border-border/30 hover:border-primary/30 transition-all shadow-sm">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase ${ratingStyles[offer.rating] || ratingStyles.fair}`}>
                              {offer.rating}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm text-foreground">${offer.pay?.toFixed(2)}</span>
                                {offer.tips > 0 && <span className="text-[10px] font-bold text-emerald-500/90">+{offer.tips.toFixed(2)} tip</span>}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {offer.total_miles?.toFixed(1) || offer.miles}mi • {offer.time_minutes}min • <span className="font-medium">${offer.hourly_rate?.toFixed(2)}/hr</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">
                              {offer.created_at ? format(parseISO(offer.created_at), "h:mm a") : ""}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              onClick={() => onDelete(offer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}