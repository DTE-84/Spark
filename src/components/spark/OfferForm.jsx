import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Fuel, GaugeCircle, Pencil, CheckCheck, Undo2, MapPin, ShoppingBag } from "lucide-react";

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
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</Label>
        <Select value={offer.platform} onValueChange={(val) => handleOfferChange("platform", val)}>
          <SelectTrigger className="w-full h-12 bg-muted/40 backdrop-blur-sm border-0 focus:ring-2 focus:ring-primary/40 rounded-xl text-base font-semibold">
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Spark">Spark (Walmart)</SelectItem>
            <SelectItem value="DoorDash">DoorDash</SelectItem>
            <SelectItem value="UberEats">Uber Eats</SelectItem>
            <SelectItem value="Instacart">Instacart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offer Fields */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pay and Tips */}
        <div className="space-y-1.5">
          <Label htmlFor="pay" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base + Tips Pay</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">$</span>
            <Input
              id="pay" type="number" step="0.01" min="0" placeholder="12.50"
              value={offer.pay} onChange={(e) => handleOfferChange("pay", e.target.value)}
              className="h-14 text-2xl font-bold pl-7 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tips" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Tips (Included)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 font-medium text-sm">$</span>
            <Input
              id="tips" type="number" step="0.01" min="0" placeholder="5.00"
              value={offer.tips} onChange={(e) => handleOfferChange("tips", e.target.value)}
              className="h-14 text-2xl font-bold pl-7 bg-primary/10 text-primary border-0 focus:bg-primary/20 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
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
              className="h-11 text-base font-medium pr-10 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
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
              className="h-11 text-base font-medium pr-12 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">min</span>
          </div>
        </div>

        {/* Miles Back */}
        <div className="space-y-1.5">
          <Label htmlFor="miles_back" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadhead</Label>
          <div className="relative">
            <Input
              id="miles_back" type="number" step="0.1" min="0" placeholder="3.5"
              value={offer.miles_back} onChange={(e) => handleOfferChange("miles_back", e.target.value)}
              className="h-11 text-base font-medium pl-8 pr-10 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Undo2 className="w-3.5 h-3.5" />
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">mi</span>
          </div>
        </div>
        
        {/* Items (Conditional) */}
        {showItemsField ? (
          <div className="space-y-1.5">
            <Label htmlFor="items" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</Label>
            <div className="relative">
              <Input
                id="items" type="number" step="1" min="0" placeholder="10"
                value={offer.items} onChange={(e) => handleOfferChange("items", e.target.value)}
                className="h-11 text-base font-medium pl-8 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5"></div>
        )}

        {/* Dropoff Zone */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="dropoff_zone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dropoff Zone (Optional)</Label>
          <div className="relative">
            <Input
              id="dropoff_zone" type="text" placeholder="e.g. Downtown, Suburbs, Sketchy area"
              value={offer.dropoff_zone} onChange={(e) => handleOfferChange("dropoff_zone", e.target.value)}
              className="h-11 text-base font-medium pl-8 bg-muted/40 backdrop-blur-sm border-0 focus:bg-muted/60 focus:ring-2 focus:ring-primary/40 transition-all rounded-xl"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Settings Section */}
      <div className="rounded-2xl border border-border/40 bg-muted/20 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GaugeCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Vehicle Settings</span>
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
        className="w-full h-14 rounded-2xl text-base font-extrabold bg-primary/90 hover:bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-all backdrop-blur-md"
      >
        <Zap className="w-5 h-5 mr-2" />
        {isLoading ? "Evaluating..." : "Evaluate Offer"}
      </Button>
    </form>
  );
}
