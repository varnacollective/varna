"use client";

import { useState } from "react";
import Image from "next/image";
import { Link2, Copy, Check, Loader2, Sparkles } from "lucide-react";

export default function LinkGenerator() {
  const [enterpriseName, setEnterpriseName] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!enterpriseName.trim()) {
      setError("Please enter an enterprise name.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedLink(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate-assessment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enterprise_name: enterpriseName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate link. Please try again.");
        return;
      }

      setGeneratedLink(data.link);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <div className="bg-[#1C1D21] border border-slate-mist/20 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Image
              src="/varna-logo.svg"
              alt="Varna Collective"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-mist">
              Supplier Onboarding
            </span>
          </div>
          <h2 className="text-xl font-serif font-light text-warm-stone tracking-tight">
            Assessment Link Generator
          </h2>
          <p className="text-[11px] text-slate-mist font-light mt-1 leading-relaxed max-w-sm">
            Generate a unique, secure assessment URL for a supplier enterprise. The link is saved
            to Supabase and can be shared directly with the supplier.
          </p>
        </div>
        <div className="w-10 h-10 bg-deep-clay/10 border border-deep-clay/25 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-deep-clay" />
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-3 items-stretch">
        <div className="flex-1 relative">
          <label
            htmlFor="enterprise-name-input"
            className="block text-[10px] font-mono uppercase tracking-widest text-slate-mist mb-2"
          >
            Enterprise Name
          </label>
          <input
            id="enterprise-name-input"
            type="text"
            value={enterpriseName}
            onChange={(e) => {
              setEnterpriseName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Karigari Textiles Pvt. Ltd."
            disabled={loading}
            className="w-full bg-[#131416] border border-slate-mist/20 focus:border-warm-stone/50 outline-none px-4 py-3 text-sm text-warm-stone placeholder:text-slate-mist/40 font-sans transition-colors duration-200 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            id="generate-assessment-link-btn"
            onClick={handleGenerate}
            disabled={loading || !enterpriseName.trim()}
            className="flex items-center gap-2.5 px-5 py-3 bg-deep-clay text-warm-stone text-xs font-sans font-medium uppercase tracking-widest transition-all duration-200 hover:bg-[#944D25] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            style={{
              boxShadow: loading ? "none" : "0 0 20px -4px rgba(122, 63, 30, 0.5)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                Generate Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-red-400 font-sans font-light flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}

      {/* Generated link output */}
      {generatedLink && (
        <div className="mt-5 border border-sage-mineral/25 bg-sage-mineral/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-mono uppercase tracking-widest text-sage-mineral mb-1">
              ✓ Link Generated &amp; Saved to Supabase
            </p>
            <p className="text-sm font-mono text-warm-stone/90 truncate" title={generatedLink}>
              {generatedLink}
            </p>
          </div>
          <button
            id="copy-assessment-link-btn"
            onClick={handleCopy}
            title="Copy link to clipboard"
            className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all duration-200 shrink-0 cursor-pointer ${
              copied
                ? "bg-sage-mineral/20 border-sage-mineral/50 text-sage-mineral"
                : "bg-white/5 border-slate-mist/20 text-slate-mist hover:border-warm-stone/40 hover:text-warm-stone"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy URL
              </>
            )}
          </button>
        </div>
      )}

      {/* Helper note */}
      <p className="mt-4 text-[10px] text-slate-mist/60 font-light">
        Each link is unique, one-time use, and tied to the enterprise name above. Share it
        directly with the supplier — no login required.
      </p>
    </div>
  );
}
