"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { Globe, MapPin, ExternalLink, AlertCircle } from "lucide-react";

interface RealPartnerMapViewProps {
  suppliers: any[];
  allSuppliers?: any[];
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  onPinClick: (supplier: any) => void;
}

const BAND_COLORS: Record<string, string> = {
  Leader: "#55705A",
  Advanced: "#7D3F1E",
  Emerging: "#6F8391",
  Foundational: "#9C7A58",
};

function getVarnaBand(score: number): string {
  if (score >= 85) return "Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  return "Foundational";
}

// Fallback coordinates for known partners if missing from row
const KNOWN_COORDS: Record<string, [number, number]> = {
  "ENT-001": [12.9767936, 77.590082], // Bengaluru, Karnataka
  "ENT-002": [28.4031478, 77.3105561], // Faridabad, Haryana
  "ENT-003": [22.7203616, 75.8681996], // Indore, Madhya Pradesh
  "ENT-004": [19.0308262, 73.0198537], // Navi Mumbai, Maharashtra
  "ENT-005": [8.4882267, 76.947551], // Trivandrum, Kerala
};

// Default bounding box for India
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [8.0, 68.0],
  [33.0, 93.0],
];

export default function RealPartnerMapView({
  suppliers,
  allSuppliers = [],
  selectedCountry = "India",
  onCountryChange,
  onPinClick,
}: RealPartnerMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [activeCountry, setActiveCountry] = useState(selectedCountry);

  // Derive countries list dynamically from available supplier data
  const availableCountries = useMemo(() => {
    const list = (allSuppliers.length > 0 ? allSuppliers : suppliers);
    const set = new Set<string>();
    set.add("India"); // Primary default
    list.forEach((s) => {
      const c = s.country || (s.enterprise_name?.toLowerCase().includes("dubai") ? "United Arab Emirates" : "India");
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [allSuppliers, suppliers]);

  // Keep internal country state in sync if prop changes
  useEffect(() => {
    if (selectedCountry) {
      setActiveCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const handleCountrySelect = (c: string) => {
    setActiveCountry(c);
    if (onCountryChange) {
      onCountryChange(c);
    }
  };

  // Filter suppliers for current country
  const countrySuppliers = useMemo(() => {
    if (!activeCountry || activeCountry === "All") return suppliers;
    return suppliers.filter((s) => {
      const c = s.country || "India";
      return c.toLowerCase() === activeCountry.toLowerCase();
    });
  }, [suppliers, activeCountry]);

  // ─── Initialize Leaflet Map ────────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = await import("leaflet");
      if (isCancelled) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map with default center on India
      const map = L.map(mapContainerRef.current, {
        center: [21.7679, 78.8718], // Central India coordinates
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap standard tiles with obligatory attribution
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;

      // Render pins immediately once map is loaded
      renderPins(L, map, markersLayer);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // ─── Render Pins & Adjust View when suppliers or country changes ──────────
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then((L) => {
      renderPins(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [countrySuppliers, activeCountry]);

  const renderPins = (L: any, map: any, markersLayer: any) => {
    markersLayer.clearLayers();

    const validCoords: [number, number][] = [];

    countrySuppliers.forEach((supplier, idx) => {
      // Find latitude and longitude from supplier object or fallback
      let lat = supplier.latitude ?? supplier.lat;
      let lng = supplier.longitude ?? supplier.lng ?? supplier.lon;

      if ((lat === undefined || lng === undefined) && supplier.enterprise_id) {
        const fallback = KNOWN_COORDS[supplier.enterprise_id];
        if (fallback) {
          lat = fallback[0];
          lng = fallback[1];
        }
      }

      // Fallback by name if still not found
      if (lat === undefined || lng === undefined) {
        const name = (supplier.enterprise_name || supplier.name || "").toLowerCase();
        if (name.includes("bare")) { lat = 12.9767936; lng = 77.590082; }
        else if (name.includes("ukhi")) { lat = 28.4031478; lng = 77.3105561; }
        else if (name.includes("kheoni")) { lat = 22.7203616; lng = 75.8681996; }
        else if (name.includes("greensole")) { lat = 19.0308262; lng = 73.0198537; }
        else if (name.includes("marikar")) { lat = 8.4882267; lng = 76.947551; }
      }

      if (lat === undefined || lng === undefined) return;

      validCoords.push([lat, lng]);

      const score = supplier.final_varna_score ?? supplier.varnaScore ?? 72;
      const band = getVarnaBand(score);
      const pinColor = BAND_COLORS[band] || "#7D3F1E";
      const name = supplier.enterprise_name || supplier.name || "Partner";
      const initial = name.trim()[0] || "P";
      const locationText = supplier.city && supplier.state
        ? `${supplier.city}, ${supplier.state}`
        : supplier.state || "India";

      // Create Custom HTML Pin Icon
      const customIcon = L.divIcon({
        className: "varna-leaflet-pin-wrapper",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
        html: `
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: ${pinColor};
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          " class="hover:scale-110 active:scale-95" title="${name} (${band})">
            ${initial}
          </div>
        `,
      });

      // Create Marker
      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create Popup Content
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px 2px; min-width: 210px; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: ${pinColor}22;
              color: ${pinColor};
              border: 1px solid ${pinColor}44;
            ">${band}</span>
            <span style="font-size: 11px; font-weight: 700; color: #1F1B16;">${score} / 100</span>
          </div>

          <h4 style="font-size: 14px; font-weight: 600; color: #1F1B16; margin: 0 0 2px 0; line-height: 1.25;">
            ${name}
          </h4>

          <div style="font-size: 11px; color: #6F6A61; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
            <span>📍 ${locationText}</span>
          </div>

          <button id="view-partner-btn-${idx}" style="
            width: 100%;
            padding: 7px 12px;
            background-color: #7D3F1E;
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background-color 0.15s ease;
          " onmouseover="this.style.backgroundColor='#663318'" onmouseout="this.style.backgroundColor='#7D3F1E'">
            <span>View Full Profile in List</span>
            <span style="font-size: 12px;">→</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "varna-leaflet-popup",
        closeButton: true,
        maxWidth: 280,
      });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`view-partner-btn-${idx}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            onPinClick(supplier);
          };
        }
      });

      marker.addTo(markersLayer);
    });

    // ── Fit Bounds or Center ──
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 9, { animate: true });
      } else {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 8,
          animate: true,
        });
      }
    } else if (activeCountry === "India") {
      map.fitBounds(INDIA_BOUNDS, { padding: [20, 20], animate: true });
    }
  };

  // ─── Local Sourcing Metric Computations ────────────────────────────────────
  const totalPartnersList = allSuppliers.length > 0 ? allSuppliers : suppliers;
  const totalPartnersCount = totalPartnersList.length;
  const localPartnersCount = countrySuppliers.length;
  const localPartnersPct = totalPartnersCount > 0 ? Math.round((localPartnersCount / totalPartnersCount) * 100) : 0;

  const totalSpendInr = totalPartnersList.reduce((sum, s) => sum + (s.totalSpend || s.spend || s.orders_inr_ytd_auto || 0), 0);
  const localSpendInr = countrySuppliers.reduce((sum, s) => sum + (s.totalSpend || s.spend || s.orders_inr_ytd_auto || 0), 0);
  const localSpendUsd = localSpendInr > 0 ? Math.round(localSpendInr / 83) : 0;
  const totalSpendUsd = totalSpendInr > 0 ? Math.round(totalSpendInr / 83) : 0;
  const localSpendPct = totalSpendInr > 0 ? ((localSpendInr / totalSpendInr) * 100).toFixed(1) : "0.0";

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden border border-black/[0.07] dark:border-white/[0.08] shadow-sm bg-[#F7F3EA] dark:bg-[#1A1E26] flex flex-col">
      {/* ── Top Bar Controls: Country Selector + Title ── */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
        {/* Country Selector Dropdown */}
        <div className="relative bg-white/95 dark:bg-[#20242B]/95 backdrop-blur-md rounded-xl p-1 border border-black/[0.10] dark:border-white/[0.12] shadow-md flex items-center gap-2">
          <div className="flex items-center gap-1.5 pl-2.5 text-xs font-semibold text-[#6F6A61] dark:text-[#9A948A]">
            <Globe className="w-3.5 h-3.5 text-[#7D3F1E] dark:text-[#E07A57]" />
            <span>Country:</span>
          </div>
          <select
            value={activeCountry}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="text-xs font-medium bg-transparent text-[#1F1B16] dark:text-[#F3EFE7] py-1.5 pr-3 pl-1 focus:outline-none cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {availableCountries.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-[#20242B] text-[#1F1B16] dark:text-[#F3EFE7]">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Relative Map Container ── */}
      <div className="relative w-full">
        {/* Leaflet Map DOM Container */}
        <div
          ref={mapContainerRef}
          className="w-full h-[480px] md:h-[530px] z-10"
          tabIndex={0}
          aria-label="Interactive Partner Locations Map"
        />

        {/* Empty State Overlay (if 0 partners in selected country) */}
        {countrySuppliers.length === 0 && (
          <div className="absolute inset-0 z-[500] bg-white/70 dark:bg-[#1A1E26]/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#7D3F1E]/10 dark:bg-[#E07A57]/15 flex items-center justify-center text-[#7D3F1E] dark:text-[#E07A57] mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1F1B16] dark:text-[#F3EFE7]">
              No partners in {activeCountry} yet
            </h3>
            <p className="text-xs text-[#6F6A61] dark:text-[#9A948A] max-w-sm mt-1">
              Currently all verified partners are located in India. Switch back to India to see active registered locations.
            </p>
            <button
              type="button"
              onClick={() => handleCountrySelect("India")}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#7D3F1E] dark:bg-[#E07A57] text-white text-xs font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              Switch to India
            </button>
          </div>
        )}

        {/* Score Band Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-[#1A1E26]/95 backdrop-blur-md rounded-2xl p-3 border border-black/[0.08] dark:border-white/[0.12] shadow-md pointer-events-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6F6A61] dark:text-[#9A948A] mb-2">
            Score Band
          </p>
          <div className="space-y-1.5">
            {Object.entries(BAND_COLORS).map(([band, color]) => (
              <div key={band} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#5B564E] dark:text-[#C2BCB0] font-normal">{band}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Disclaimer (Bottom-Right, above OSM attribution) */}
        <div className="absolute bottom-4 right-4 z-[990] hidden sm:block pointer-events-none">
          <p className="text-[10px] text-[#5B564E] dark:text-[#C2BCB0] bg-white/90 dark:bg-[#1A1E26]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-black/[0.07] dark:border-white/[0.08] shadow-xs">
            Locations show registered office. Manufacturing locations coming soon.
          </p>
        </div>
      </div>

      {/* ── Local Sourcing Metric Panel / Footer Bar ── */}
      <div className="relative z-20 px-5 py-3.5 bg-white dark:bg-[#20242B] border-t border-black/[0.07] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#7D3F1E] dark:text-[#E07A57] shrink-0" />
          <span className="font-medium text-[#1F1B16] dark:text-[#F3EFE7] text-xs sm:text-sm">
            {localPartnersCount > 0
              ? `Local Sourcing: ${localPartnersPct}% of partners sourced from ${activeCountry}`
              : `Local Sourcing: 0% — no partners currently sourced from ${activeCountry}`}
          </span>
        </div>
        <div className="text-xs text-[#6F6A61] dark:text-[#9A948A] font-light flex items-center gap-2 flex-wrap">
          <span>
            {localPartnersCount} of {totalPartnersCount} verified partners
          </span>
          {totalSpendUsd > 0 && localPartnersCount > 0 && (
            <>
              <span>·</span>
              <span className="font-medium text-[#7D3F1E] dark:text-[#E07A57]">
                ${localSpendUsd.toLocaleString('en-US')} spend ({localSpendPct}% of total)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
