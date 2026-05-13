import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const ratingStyles = {
  great: "bg-emerald-100 text-emerald-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-amber-100 text-amber-700",
  bad: "bg-red-100 text-red-700",
};

export default function OfferHistory({ offers, onDelete }) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Offers</h3>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-card rounded-xl border border-border/50 p-3.5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${ratingStyles[offer.rating]}`}>
                  {offer.rating}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm">${offer.pay?.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      {offer.total_miles?.toFixed(1) || offer.miles}mi • {offer.time_minutes}min
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${offer.hourly_rate?.toFixed(2)}/hr • ${offer.per_mile_rate?.toFixed(2)}/mi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  {offer.created_date ? format(new Date(offer.created_date), "MMM d, h:mm a") : ""}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(offer.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}