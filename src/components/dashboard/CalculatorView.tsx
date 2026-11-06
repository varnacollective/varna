"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CALCULATOR_SETTINGS,
  CALCULATOR_PRODUCTS,
  EMISSION_FACTORS,
  COMPARE_PAIRS,
  INITIAL_BASKET_ITEMS,
  EF_MAP,
  PRODUCT_MAP,
  PRODUCT_NAME_MAP,
  COMPARE_PAIRS_MAP,
  type CalculatorProduct,
  type BasketLineItem,
  type EmissionFactor,
  calculateLineTotal,
} from "@/lib/calculator-data";
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  Layers,
  Sparkles,
  Scale,
  ShoppingBag,
} from "lucide-react";

interface CalculatorViewProps {
  clientName?: string;
}

export default function CalculatorView({ clientName = "Your Property" }: CalculatorViewProps) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [basket, setBasket] = useState<BasketLineItem[]>(INITIAL_BASKET_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFactorModal, setSelectedFactorModal] = useState<EmissionFactor | null>(null);

  // Group options
  const groupOptions = ["All", "Guest room", "Food service", "Back of house", "Larger purchases"];

  // Category options
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    CALCULATOR_PRODUCTS.forEach((p) => cats.add(p.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return CALCULATOR_PRODUCTS.filter((p) => {
      if (selectedGroup !== "All" && p.group !== selectedGroup) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.product.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesGroup = p.group.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesGroup) return false;
      }
      return true;
    });
  }, [selectedGroup, selectedCategory, searchQuery]);

  // Derived state directly from current active basket items array for reliable reactivity
  const { totalCo2eKg, totalCo2eTonnes, netSavingKg, switchableCount, categoryBreakdown } = useMemo(() => {
    let totalKg = 0;
    let netSaving = 0;
    let switches = 0;
    const catMap: Record<string, number> = {};

    for (const item of basket) {
      const qty = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0;
      const unitVal = typeof item.unitCo2eKg === "number" && !isNaN(item.unitCo2eKg) ? item.unitCo2eKg : 0;
      const lineTotal = typeof item.lineCo2eKg === "number" && !isNaN(item.lineCo2eKg) && item.lineCo2eKg !== 0
        ? item.lineCo2eKg
        : qty * unitVal;

      totalKg += lineTotal;

      const saving = typeof item.savingKgCo2e === "number" && !isNaN(item.savingKgCo2e) ? item.savingKgCo2e : 0;
      if (saving > 0) {
        netSaving += saving;
        switches += 1;
      }

      const cat = item.category || "General";
      catMap[cat] = (catMap[cat] || 0) + lineTotal;
    }

    const totalTonnes = totalKg / 1000;

    const breakdown = Object.entries(catMap)
      .map(([category, kgCo2e]) => ({
        category,
        kgCo2e,
        percentage: totalKg > 0 ? (kgCo2e / totalKg) * 100 : 0,
      }))
      .sort((a, b) => b.kgCo2e - a.kgCo2e);

    return {
      totalCo2eKg: totalKg,
      totalCo2eTonnes: totalTonnes,
      netSavingKg: netSaving,
      switchableCount: switches,
      categoryBreakdown: breakdown,
    };
  }, [basket]);

  // Format 3 decimal places consistently using Intl.NumberFormat
  const format3Decimals = (val: number): string => {
    return Intl.NumberFormat("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(isNaN(val) ? 0 : val);
  };

  // ─── Basket Actions ────────────────────────────────────────────────────────
  const handleAddProduct = (prod: CalculatorProduct) => {
    setBasket((prevBasket) => {
      const existingIndex = prevBasket.findIndex((item) => item.productId === prod.productId);
      if (existingIndex >= 0) {
        const updated = [...prevBasket];
        const existing = updated[existingIndex];
        const newQty = (existing.quantity || 0) + 1;
        const recalculated = calculateLineTotal(
          prod,
          newQty,
          existing.customWeightKg,
          existing.customPriceInr
        );
        updated[existingIndex] = {
          ...recalculated,
          lineNumber: existing.lineNumber,
        };
        return updated;
      } else {
        const defaultQty = prod.route === "Weight" && (prod.weightPerUnitKg || 0) < 0.1 ? 100 : 1;
        const newLine = calculateLineTotal(prod, defaultQty);
        newLine.lineNumber = prevBasket.length + 1;
        return [...prevBasket, newLine];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (isNaN(newQty) || newQty < 0) return;
    setBasket((prevBasket) => {
      if (!prevBasket[index]) return prevBasket;
      const updated = [...prevBasket];
      const item = updated[index];
      const prod = PRODUCT_MAP.get(item.productId);
      if (!prod) return prevBasket;

      updated[index] = {
        ...calculateLineTotal(prod, newQty, item.customWeightKg, item.customPriceInr),
        lineNumber: item.lineNumber,
      };
      return updated;
    });
  };

  const handleUpdateCustomWeight = (index: number, valStr: string) => {
    setBasket((prevBasket) => {
      if (!prevBasket[index]) return prevBasket;
      const updated = [...prevBasket];
      const item = updated[index];
      const prod = PRODUCT_MAP.get(item.productId);
      if (!prod) return prevBasket;

      const val = valStr === "" ? null : parseFloat(valStr);
      updated[index] = {
        ...calculateLineTotal(prod, item.quantity, val, item.customPriceInr),
        lineNumber: item.lineNumber,
      };
      return updated;
    });
  };

  const handleUpdateCustomPrice = (index: number, valStr: string) => {
    setBasket((prevBasket) => {
      if (!prevBasket[index]) return prevBasket;
      const updated = [...prevBasket];
      const item = updated[index];
      const prod = PRODUCT_MAP.get(item.productId);
      if (!prod) return prevBasket;

      const val = valStr === "" ? null : parseFloat(valStr);
      updated[index] = {
        ...calculateLineTotal(prod, item.quantity, item.customWeightKg, val),
        lineNumber: item.lineNumber,
      };
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setBasket((prevBasket) => {
      const updated = prevBasket.filter((_, idx) => idx !== index);
      return updated.map((item, idx) => ({
        ...item,
        lineNumber: idx + 1,
      }));
    });
  };

  const handleResetSample = () => {
    setBasket(INITIAL_BASKET_ITEMS.map((item) => ({ ...item })));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleSwitchAlternative = (index: number) => {
    setBasket((prevBasket) => {
      if (!prevBasket[index]) return prevBasket;
      const item = prevBasket[index];
      if (!item.compareWith) return prevBasket;

      const altProd = PRODUCT_NAME_MAP.get(item.compareWith.toLowerCase().trim());
      if (!altProd) return prevBasket;

      const updated = [...prevBasket];
      const switchedLine = calculateLineTotal(altProd, item.quantity);
      switchedLine.lineNumber = item.lineNumber;
      updated[index] = switchedLine;
      return updated;
    });
  };

  const handleOpenFactorDetails = (prodId: string) => {
    const prod = PRODUCT_MAP.get(prodId);
    if (!prod) return;
    const ef = prod.factorIdA ? EF_MAP.get(prod.factorIdA) : null;
    if (ef) {
      setSelectedFactorModal(ef);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ─── Header Banner ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          bg-gradient-to-r from-[#F7F3EA] via-[#F2ECE0] to-[#EAE2D2] dark:bg-gradient-to-r dark:from-[#25221C] dark:via-[#1F1C17] dark:to-[#1A1813]
          border border-[#E0D5C1] dark:border-[#DFD3BD]/15
          p-5 lg:p-6 rounded-[24px] shadow-[0_4px_24px_-4px_rgba(28,25,23,0.03)]
          flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden
        "
      >
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5] tracking-tight">
            What does this purchase emit?
          </h1>
          <p className="text-xs lg:text-sm text-[#6F675A] dark:text-[#B3A998] max-w-2xl leading-relaxed">
            Estimate for planning, not for audited reporting. Calculate baseline footprint, test sustainable material alternatives, and evaluate genuine carbon reductions.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/80 dark:bg-white/10 hover:bg-white text-[#4A4237] dark:text-[#EAE5DC] border border-[#DCD1BC] dark:border-white/10 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8C4A27] dark:text-[#E07A57]" />
            Reset sample
          </button>
          {basket.length > 0 && (
            <button
              type="button"
              onClick={handleClearBasket}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-transparent hover:bg-red-500/10 text-[#8C4A27] dark:text-[#E07A57] border border-[#8C4A27]/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear list
            </button>
          )}
        </div>
      </motion.div>

      {/* ─── Top KPI Cards (Two Cards Spanning Space) ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* KPI 1: Total Footprint */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="
            bg-gradient-to-br from-[#2D2822] via-[#23201C] to-[#1A1815] text-[#FAF8F5]
            border border-[#4A4135] p-5 rounded-[22px] shadow-sm relative overflow-hidden flex flex-col justify-between
          "
        >
          <div>
            <div className="flex items-center justify-between text-xs text-[#C4B9A7] font-medium mb-1">
              <span>Estimated Footprint</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-white/5 px-2 py-0.5 rounded-full">
                {basket.length} {basket.length === 1 ? "Product" : "Products"}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#FAF8F5] tabular-nums">
                {totalCo2eTonnes.toFixed(3)}
              </span>
              <span className="text-lg font-serif text-[#C4B9A7]">tonnes</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#A39989] font-mono">
              {format3Decimals(totalCo2eKg)} kg CO₂e
            </span>
            <span className="text-[11px] text-[#D8CEBC]">Scope 3 Goods</span>
          </div>
        </motion.div>

        {/* KPI 2: Net Saving If Switched */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="
            bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E8E2D9] dark:border-white/10
            p-5 rounded-[22px] shadow-sm flex flex-col justify-between
          "
        >
          <div>
            <div className="flex items-center justify-between text-xs text-[#6F675A] dark:text-[#A8A196] font-medium mb-1">
              <span>Net Saving If Switched</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#55705A] dark:text-[#88A88D]">
                <TrendingDown className="w-3.5 h-3.5" />
                Varna Alternatives
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl lg:text-4xl font-serif font-bold text-[#55705A] dark:text-[#88A88D] tabular-nums">
                {format3Decimals(netSavingKg)}
              </span>
              <span className="text-lg font-serif text-[#6F675A] dark:text-[#A8A196]">kg CO₂e</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#7A7265] dark:text-[#9A9182]">
            <span>
              {switchableCount} {switchableCount === 1 ? "switchable line" : "switchable lines"} found
            </span>
            <span className="text-[11px] text-[#55705A] dark:text-[#88A88D] font-medium">
              Verified reductions
            </span>
          </div>
        </motion.div>
      </div>

      {/* ─── Main Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E8E2D9] dark:border-white/10 rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
                  Add Products
                </h2>
                <p className="text-xs text-[#7A7265] dark:text-[#9A9182]">
                  {filteredProducts.length} items available in standard catalog
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8273]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search towels, soap, bottles, rice..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-[#DCD1BC] dark:border-white/10 text-xs text-[#1F1B16] dark:text-[#FAF8F5] placeholder-[#9E9585] focus:outline-none focus:ring-1 focus:ring-[#8C4A27]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8273] hover:text-[#1F1B16] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Group Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {groupOptions.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                    ${
                      selectedGroup === grp
                        ? "bg-[#8C4A27] text-white shadow-xs"
                        : "bg-white/80 dark:bg-white/5 text-[#5B5448] dark:text-[#B3A998] hover:bg-black/5 dark:hover:bg-white/10 border border-[#E0D7C5] dark:border-white/5"
                    }
                  `}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#7A7265] dark:text-[#9A9182] shrink-0 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-black/20 border border-[#DCD1BC] dark:border-white/10 text-xs text-[#1F1B16] dark:text-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#8C4A27]"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Scrollable List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const inBasket = basket.some((item) => item.productId === prod.productId);
                return (
                  <div
                    key={prod.productId}
                    className="
                      p-3 rounded-xl bg-white dark:bg-black/20 border border-[#EBE4D8] dark:border-white/5
                      hover:border-[#D5C7B0] dark:hover:border-white/15 transition-all flex items-center justify-between gap-3 group
                    "
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#FAF8F5] truncate">
                          {prod.product}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#6F675A] dark:text-[#B3A998]">
                          {prod.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A7265] dark:text-[#9A9182]">
                        <span className="font-mono text-[#1F1B16] dark:text-[#EAE5DC] font-medium">
                          {prod.estimateKgCo2ePerUnit.toFixed(3)} kg CO₂e / {prod.unit}
                        </span>
                        <span className="text-[10px] text-[#9E9585]">
                          {prod.route} route
                        </span>
                        <span
                          className={`
                            text-[10px] font-mono px-1 rounded
                            ${
                              prod.confidence === "High"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : prod.confidence === "Medium"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            }
                          `}
                        >
                          {prod.confidence}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProduct(prod)}
                      className={`
                        shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1
                        ${
                          inBasket
                            ? "bg-[#55705A]/15 text-[#55705A] dark:bg-[#55705A]/30 dark:text-[#88A88D]"
                            : "bg-[#8C4A27] text-white hover:bg-[#733B1E] shadow-xs"
                        }
                      `}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {inBasket ? "Add more" : "Add"}
                    </button>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="py-8 text-center text-xs text-[#8C8273]">
                  No products found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Your List / Active Basket (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E8E2D9] dark:border-white/10 rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
                  Your List
                </h2>
                <p className="text-xs text-[#7A7265] dark:text-[#9A9182]">
                  {basket.length} {basket.length === 1 ? "line item" : "line items"} in current estimate
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#7A7265] dark:text-[#9A9182] block">Total</span>
                <span className="text-lg font-serif font-bold text-[#8C4A27] dark:text-[#E07A57] tabular-nums">
                  {totalCo2eTonnes.toFixed(3)} t
                </span>
              </div>
            </div>

            {/* Basket Items List */}
            {basket.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EAE2D2]/60 dark:bg-white/5 flex items-center justify-center mx-auto text-[#8C4A27] dark:text-[#E07A57]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-[#1F1B16] dark:text-[#FAF8F5]">
                  Your purchase list is empty
                </h3>
                <p className="text-xs text-[#7A7265] dark:text-[#9A9182] max-w-sm mx-auto">
                  Pick items from the catalog on the left or restore the recommended sample basket.
                </p>
                <button
                  type="button"
                  onClick={handleResetSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8C4A27] text-white hover:bg-[#733B1E] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Load sample basket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {basket.map((item, index) => {
                  const prod = PRODUCT_MAP.get(item.productId);
                  const isWeightRoute = prod?.route === "Weight";
                  const isSpendRoute = prod?.route === "Spend";

                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className="
                        p-4 rounded-xl bg-white dark:bg-black/25 border border-[#EBE4D8] dark:border-white/5
                        hover:border-[#DFD3BD] dark:hover:border-white/10 transition-all space-y-3
                      "
                    >
                      {/* Top Row: Title, Category, Line Total & Remove */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-[#8C8273] font-semibold">
                              #{item.lineNumber}
                            </span>
                            <span className="text-sm font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
                              {item.productName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6F675A] dark:text-[#B3A998]">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#7A7265] dark:text-[#9A9182]">
                            <span className="font-mono">
                              {item.unitCo2eKg.toFixed(4)} kg CO₂e / {item.unit}
                            </span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => handleOpenFactorDetails(item.productId)}
                              className={`
                                inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-all
                                ${
                                  item.confidence === "High"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                    : item.confidence === "Medium"
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                }
                              `}
                              title="Click to inspect emission factor source & methodology"
                            >
                              <span>{item.confidence} confidence</span>
                              <Info className="w-2.5 h-2.5" />
                            </button>
                            {item.isCustomized && (
                              <span className="text-[10px] text-[#55705A] dark:text-[#88A88D] font-medium">
                                (Custom inputs applied)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5] tabular-nums block">
                              {item.lineCo2eKg >= 1000
                                ? `${(item.lineCo2eKg / 1000).toFixed(2)} t`
                                : `${item.lineCo2eKg.toFixed(1)} kg`}
                            </span>
                            <span className="text-[10px] text-[#8C8273] font-mono">
                              {Math.round(item.lineCo2eKg).toLocaleString()} kg CO₂e
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            className="p-1.5 rounded-lg text-[#8C8273] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Row: Inputs for Quantity and Optional Weight/Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                        {/* Quantity */}
                        <div>
                          <label className="text-[10px] text-[#7A7265] dark:text-[#9A9182] font-medium block mb-1">
                            Quantity ({item.unit}s)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(index, parseFloat(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-black/30 border border-[#DCD1BC] dark:border-white/10 font-mono text-xs text-[#1F1B16] dark:text-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#8C4A27]"
                          />
                        </div>

                        {/* Optional Custom Weight / Price based on Route */}
                        {isWeightRoute && (
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-[#7A7265] dark:text-[#9A9182] font-medium flex items-center justify-between mb-1">
                              <span>Your weight per unit (kg)</span>
                              <span className="text-[9px] text-[#9E9585]">
                                Default: {prod?.weightPerUnitKg ?? "–"} kg
                              </span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder={`Default (${prod?.weightPerUnitKg ?? 1} kg)`}
                              value={item.customWeightKg ?? ""}
                              onChange={(e) => handleUpdateCustomWeight(index, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-black/30 border border-[#DCD1BC] dark:border-white/10 font-mono text-xs text-[#1F1B16] dark:text-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#8C4A27]"
                            />
                          </div>
                        )}

                        {isSpendRoute && (
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-[#7A7265] dark:text-[#9A9182] font-medium flex items-center justify-between mb-1">
                              <span>Your price per unit (₹)</span>
                              <span className="text-[9px] text-[#9E9585]">
                                Typical: ₹{prod?.typicalPriceInr?.toLocaleString() ?? "–"}
                              </span>
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder={`Typical (₹${prod?.typicalPriceInr ?? 0})`}
                              value={item.customPriceInr ?? ""}
                              onChange={(e) => handleUpdateCustomPrice(index, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-black/30 border border-[#DCD1BC] dark:border-white/10 font-mono text-xs text-[#1F1B16] dark:text-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#8C4A27]"
                            />
                          </div>
                        )}

                        {!isWeightRoute && !isSpendRoute && (
                          <div className="sm:col-span-2 flex items-center text-[11px] text-[#8C8273] italic">
                            Fixed per unit calculation route
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Compare & Switch suggestion if available */}
                      {item.compareWith && (
                        <div className="mt-2 p-2.5 rounded-lg bg-[#F5EFE6] dark:bg-white/[0.03] border border-[#E5DAC6] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[#55705A] dark:text-[#88A88D] font-semibold">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Switch to: {item.compareWith}</span>
                            </div>
                            <p className="text-[11px] text-[#6F675A] dark:text-[#A8A196]">
                              Alternative: {item.alternativeUnitCo2eKg?.toFixed(4)} kg CO₂e / unit.
                              {item.savingKgCo2e > 0 && (
                                <span className="font-semibold text-[#55705A] dark:text-[#88A88D] ml-1">
                                  Save ~{Math.round(item.savingKgCo2e).toLocaleString()} kg CO₂e on this line!
                                </span>
                              )}
                              {item.compareNote && (
                                <span className="text-[#8C8273] block mt-0.5 italic">
                                  Note: {item.compareNote}
                                </span>
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSwitchAlternative(index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#55705A] text-white hover:bg-[#435947] transition-all shrink-0 self-start sm:self-center"
                          >
                            <span>Switch in list</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Category Breakdown & Compare Showcase ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Category Breakdown (col-span-6) */}
        <div className="lg:col-span-6 bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E8E2D9] dark:border-white/10 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
              By Category
            </h3>
            <span className="text-xs text-[#7A7265] dark:text-[#9A9182]">
              Emissions contribution
            </span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#8C8273] py-4 text-center">
                Add products to view category emissions split.
              </p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1F1B16] dark:text-[#FAF8F5]">
                      {cat.category}
                    </span>
                    <span className="font-mono text-[#6F675A] dark:text-[#B3A998]">
                      {Math.round(cat.kgCo2e).toLocaleString()} kg CO₂e ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#8C4A27] dark:bg-[#E07A57]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compare & Switch Showcase & Honest Comparison Rule (col-span-6) */}
        <div className="lg:col-span-6 bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E8E2D9] dark:border-white/10 rounded-[22px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
                Compare & Switch Insights
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#55705A] dark:text-[#88A88D] bg-[#55705A]/10 px-2 py-0.5 rounded-full">
                Honest Accounting
              </span>
            </div>

            <p className="text-xs text-[#6F675A] dark:text-[#B3A998] leading-relaxed">
              Every switchable pair is anchored directly in published physical measurements. We never overstate savings by comparing raw timber logs against finished goods or omitting refill weights.
            </p>

            {/* Honest Comparison Notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>The Honest Comparison Rule</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Where conventional products use spend averages and Varna alternatives use verified weights, comparing physical material to economic averages introduces uncertainty. Where bamboo or paper tests higher than conventional plastic, the higher result is shown honestly.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#7A7265] dark:text-[#9A9182]">
            <span>Exchange basis: ₹{CALCULATOR_SETTINGS.rupeesPerUsd} / USD</span>
            <span className="italic">Planning estimate only</span>
          </div>
        </div>
      </div>

      {/* ─── Emission Factor Inspection Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedFactorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#1E2228] border border-[#E0D5C1] dark:border-white/10 rounded-[24px] p-6 shadow-2xl space-y-4 text-left relative"
            >
              <button
                type="button"
                onClick={() => setSelectedFactorModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-[#8C8273] hover:text-[#1F1B16] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C4A27] dark:text-[#E07A57] font-bold">
                  {selectedFactorModal.factorId} • {selectedFactorModal.useStatus}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1F1B16] dark:text-[#FAF8F5]">
                  {selectedFactorModal.materialOrProduct}
                </h3>
                {selectedFactorModal.variant && (
                  <p className="text-xs text-[#7A7265] dark:text-[#9A9182]">
                    Variant: {selectedFactorModal.variant}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-black/20 border border-[#EBE4D8] dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A7265] dark:text-[#9A9182]">Recommended Factor:</span>
                  <span className="font-mono font-bold text-[#1F1B16] dark:text-[#FAF8F5] text-sm">
                    {selectedFactorModal.factor} {selectedFactorModal.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A7265] dark:text-[#9A9182]">Source:</span>
                  <span className="font-medium text-[#1F1B16] dark:text-[#FAF8F5]">
                    {selectedFactorModal.source} ({selectedFactorModal.sourceGrade || "Grade A"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A7265] dark:text-[#9A9182]">Boundary / Region:</span>
                  <span className="text-[#1F1B16] dark:text-[#FAF8F5]">
                    {selectedFactorModal.boundary || "Cradle-to-gate"} • {selectedFactorModal.region || "Global"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A7265] dark:text-[#9A9182]">Fit for India:</span>
                  <span className="text-[#1F1B16] dark:text-[#FAF8F5]">
                    {selectedFactorModal.fitForIndia || "Moderate"}
                  </span>
                </div>
              </div>

              {selectedFactorModal.notes && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8273]">
                    Methodology & Notes
                  </span>
                  <p className="text-[#6F675A] dark:text-[#B3A998] leading-relaxed">
                    {selectedFactorModal.notes}
                  </p>
                </div>
              )}

              {selectedFactorModal.licenceNote && (
                <p className="text-[11px] text-[#8C8273] italic">
                  Licence: {selectedFactorModal.licenceNote}
                </p>
              )}

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFactorModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#8C4A27] text-white hover:bg-[#733B1E] transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

