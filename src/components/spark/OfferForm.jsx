import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Fuel, GaugeCircle, Pencil, CheckCheck, Undo2 } from "lucide-react";

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

  const [offer, setOffer] = useState({ pay: "", miles: "", miles_back: "", time_minutes: "" });
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
      pay: parseFloat(offer.pay),
      miles: parseFloat(offer.miles),
      miles_back: parseFloat(offer.miles_back || 0),
      time_minutes: parseFloat(offer.time_minutes),
      mpg: parseFloat(settings.mpg),
      gas_price: parseFloat(settings.gas_price),
    });
    setOffer({ pay: "", miles: "", miles_back: "", time_minutes: "" });
  };

  const isValid = offer.pay && offer.miles && offer.time_minutes && settings.mpg && settings.gas_price;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Offer Fields */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pay - full width */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="pay" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offer Pay</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">$</span>
            <Input
              id="pay" type="number" step="0.01" min="0" placeholder="12.50"
              value={offer.pay} onChange={(e) => handleOfferChange("pay", e.target.value)}
              className="h-14 text-2xl font-bold pl-7 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Miles */}
        <div className="space-y-1.5">
          <Label htmlFor="miles" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Miles</Label>
          <div className="relative">
            <Input
              id="miles" type="number" step="0.1" min="0" placeholder="5.2"
              value={offer.miles} onChange={(e) => handleOfferChange("miles", e.target.value)}
              className="h-11 text-base font-medium pr-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">mi</span>
          </div>
        </div>

        {/* Time */}
        <div className="space-y-1.5">
          <Label htmlFor="time_minutes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Time</Label>
          <div className="relative">
            <Input
              id="time_minutes" type="number" step="1" min="0" placeholder="30"
              value={offer.time_minutes} onChange={(e) => handleOfferChange("time_minutes", e.target.value)}
              className="h-11 text-base font-medium pr-12 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">min</span>
          </div>
        </div>

        {/* Miles Back */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="miles_back" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Miles Back (Deadhead)</Label>
          <div className="relative">
            <Input
              id="miles_back" type="number" step="0.1" min="0" placeholder="3.5"
              value={offer.miles_back} onChange={(e) => handleOfferChange("miles_back", e.target.value)}
              className="h-11 text-base font-medium pl-8 pr-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Undo2 className="w-3.5 h-3.5" />
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">mi</span>
          </div>
        </div>
      </div>

      {/* Vehicle Settings Section */}
      <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GaugeCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle Settings</span>
          </div>
          {!editingSettings ? (
            <button
              type="button"
              onClick={() => setEditingSettings(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditingSettings(false)}
              disabled={!settings.mpg || !settings.gas_price}
              className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline disabled:opacity-40"
            >
              <CheckCheck className="w-3 h-3" /> Done
            </button>
          )}
        </div>

        {editingSettings ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mpg" className="text-xs font-medium text-muted-foreground">Your MPG</Label>
              <div className="relative">
                <Input
                  id="mpg" type="number" step="0.1" min="0" placeholder="25"
                  value={settings.mpg} onChange={(e) => handleSettingsChange("mpg", e.target.value)}
                  className="h-10 text-sm font-medium pr-12 bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">mpg</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gas_price" className="text-xs font-medium text-muted-foreground">Gas Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="gas_price" type="number" step="0.01" min="0" placeholder="3.50"
                  value={settings.gas_price} onChange={(e) => handleSettingsChange("gas_price", e.target.value)}
                  className="h-10 text-sm font-medium pl-6 bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <GaugeCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{settings.mpg} <span className="text-muted-foreground font-normal text-xs">mpg</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">${settings.gas_price} <span className="text-muted-foreground font-normal text-xs">/gal</span></span>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
      >
        <Zap className="w-4 h-4 mr-2" />
        {isLoading ? "Evaluating..." : "Evaluate Offer"}
      </Button>
    </form>
  );
}
