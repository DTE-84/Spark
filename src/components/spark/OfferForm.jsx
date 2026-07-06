import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Fuel, GaugeCircle, Pencil, CheckCheck, Undo2, MapPin, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "spark_defaults";

function getSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveDefaults(mpg, gas_price) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ mpg, gas_price }));
}

export default function OfferForm({ onEvaluate, isLoading }) {
  const saved = getSaved();

  const [offer, setOffer] = useState({
    platform: "Spark",
    pay: "",
    tips: "",
    miles: "",
    miles_back: "",
    time_minutes: "",
    items: "",
    dropoff_zone: "",
  });
  
  const [settings, setSettings] = useState({ mpg: saved.mpg || "", gas_price: saved.gas_price || "" });
  const [editingSettings, setEditingSettings] = useState(!saved.mpg || !saved.gas_price);

  const handleOfferChange = (field, value) => setOffer(prev => ({ ...prev, [field]: value }));
  const handleSettingsChange = (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveDefaults(updated.mpg, updated.gas_price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEvaluate({
      platform: offer.platform,
      pay: parseFloat(offer.pay),
      tips: parseFloat(offer.tips || 0),
      miles: parseFloat(offer.miles),
      miles_back: parseFloat(offer.miles_back || 0),
      time_minutes: parseFloat(offer.time_minutes),
      items: offer.items ? parseInt(offer.items, 10) : 0,
      dropoff_zone: offer.dropoff_zone,
      mpg: parseFloat(settings.mpg),
      gas_price: parseFloat(settings.gas_price),
      timestamp: new Date().toISOString(), // Pass current time for context
    });
  };

  const isValid = offer.pay && offer.miles && offer.time_minutes && settings.mpg && settings.gas_price;

  const showItemsField = ["Instacart", "Spark", "DoorDash"].includes(offer.platform); // Show mostly everywhere for shop&deliver possibility

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Platform Selector */}
      {/* Platform Segmented Control */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Platform</Label>
        <div className="flex gap-2 p-1.5 bg-[#121212] rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar">
          {["Spark", "DoorDash", "UberEats", "Instacart"].map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => handleOfferChange("platform", platform)}
              className={`relative px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-colors z-10 ${
                offer.platform === platform ? "text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {offer.platform === platform && (
                <motion.div 
                  layoutId="activePlatform"
                  className="absolute inset-0 bg-[#00FF85] rounded-xl shadow-lg shadow-[#00FF85]/20 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Offer Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pay */}
        <div className="space-y-2">
          <Label htmlFor="pay" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Base + Tips</Label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">$</span>
            <Input
              id="pay" type="number" step="0.01" min="0" placeholder="12.50"
              value={offer.pay} onChange={(e) => handleOfferChange("pay", e.target.value)}
              className="h-14 text-2xl font-black pl-8 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-2xl"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <Label htmlFor="tips" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Est. Tips</Label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00FF85]/70 font-bold text-sm">$</span>
            <Input
              id="tips" type="number" step="0.01" min="0" placeholder="5.00"
              value={offer.tips} onChange={(e) => handleOfferChange("tips", e.target.value)}
              className="h-14 text-2xl font-black pl-8 bg-[#00FF85]/5 text-[#00FF85] border border-[#00FF85]/10 focus:bg-[#00FF85]/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-2xl placeholder:text-[#00FF85]/20"
            />
          </div>
        </div>

        {/* Miles */}
        <div className="space-y-2">
          <Label htmlFor="miles" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Total Miles</Label>
          <div className="relative">
            <Input
              id="miles" type="number" step="0.1" min="0" placeholder="5.2"
              value={offer.miles} onChange={(e) => handleOfferChange("miles", e.target.value)}
              className="h-12 text-lg font-bold pr-12 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">mi</span>
          </div>
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time_minutes" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Est. Time</Label>
          <div className="relative">
            <Input
              id="time_minutes" type="number" step="1" min="0" placeholder="30"
              value={offer.time_minutes} onChange={(e) => handleOfferChange("time_minutes", e.target.value)}
              className="h-12 text-lg font-bold pr-14 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">min</span>
          </div>
        </div>

        {/* Miles Back */}
        <div className="space-y-2">
          <Label htmlFor="miles_back" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Deadhead</Label>
          <div className="relative">
            <Input
              id="miles_back" type="number" step="0.1" min="0" placeholder="3.5"
              value={offer.miles_back} onChange={(e) => handleOfferChange("miles_back", e.target.value)}
              className="h-12 text-lg font-bold pl-10 pr-10 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-xl"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
              <Undo2 className="w-4 h-4" />
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">mi</span>
          </div>
        </div>
        
        {/* Items (Conditional) */}
        {showItemsField ? (
          <div className="space-y-2">
            <Label htmlFor="items" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Items</Label>
            <div className="relative">
              <Input
                id="items" type="number" step="1" min="0" placeholder="10"
                value={offer.items} onChange={(e) => handleOfferChange("items", e.target.value)}
                className="h-12 text-lg font-bold pl-10 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-xl"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2"></div>
        )}

        {/* Dropoff Zone */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="dropoff_zone" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">Dropoff Zone</Label>
          <div className="relative">
            <Input
              id="dropoff_zone" type="text" placeholder="e.g. Downtown, Suburbs, Sketchy area"
              value={offer.dropoff_zone} onChange={(e) => handleOfferChange("dropoff_zone", e.target.value)}
              className="h-12 text-base font-bold pl-10 bg-white/5 border border-white/5 focus:bg-white/10 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] transition-all rounded-xl placeholder:font-normal"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Settings Section */}
      <div className="rounded-[1.5rem] border border-white/5 bg-white/5 p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <GaugeCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Vehicle Settings</span>
          </div>
          {!editingSettings ? (
            <button
              type="button"
              onClick={() => setEditingSettings(true)}
              className="flex items-center gap-1.5 text-xs text-[#00FF85] font-semibold hover:text-[#34D399] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditingSettings(false)}
              disabled={!settings.mpg || !settings.gas_price}
              className="flex items-center gap-1.5 text-xs text-white font-semibold hover:text-neutral-200 disabled:opacity-40 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Done
            </button>
          )}
        </div>

        {editingSettings ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mpg" className="text-xs font-semibold text-neutral-400 pl-1">Your MPG</Label>
              <div className="relative">
                <Input
                  id="mpg" type="number" step="0.1" min="0" placeholder="25"
                  value={settings.mpg} onChange={(e) => handleSettingsChange("mpg", e.target.value)}
                  className="h-12 text-base font-bold pr-12 bg-black/50 border border-white/5 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] rounded-xl"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">mpg</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gas_price" className="text-xs font-semibold text-neutral-400 pl-1">Gas Price</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                <Input
                  id="gas_price" type="number" step="0.01" min="0" placeholder="3.50"
                  value={settings.gas_price} onChange={(e) => handleSettingsChange("gas_price", e.target.value)}
                  className="h-12 text-base font-bold pl-8 bg-black/50 border border-white/5 focus:border-[#00FF85]/50 focus:ring-1 focus:ring-[#00FF85] rounded-xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                <GaugeCircle className="w-4 h-4 text-neutral-400" />
              </div>
              <span className="text-base font-bold text-white">{settings.mpg} <span className="text-neutral-500 font-medium text-sm">mpg</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                <Fuel className="w-4 h-4 text-neutral-400" />
              </div>
              <span className="text-base font-bold text-white">${settings.gas_price} <span className="text-neutral-500 font-medium text-sm">/gal</span></span>
            </div>
          </div>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={!isValid || isLoading}
        whileHover={isValid && !isLoading ? { scale: 1.02 } : {}}
        whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
        className={`w-full h-16 flex items-center justify-center rounded-2xl text-lg font-black transition-all duration-300 ${
          isValid && !isLoading 
            ? "bg-[#00FF85] text-black shadow-lg shadow-[#00FF85]/20 hover:shadow-[#00FF85]/40 animate-pulse-slow" 
            : "bg-white/5 text-neutral-500 cursor-not-allowed"
        }`}
      >
        <Zap className={`w-6 h-6 mr-2 ${isValid && !isLoading ? "" : "opacity-50"}`} />
        {isLoading ? "Evaluating..." : "Evaluate Offer"}
      </motion.button>
    </form>
  );
}
