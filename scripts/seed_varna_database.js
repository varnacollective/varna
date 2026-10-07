/**
 * Varna Collective - Supabase Seed Script
 * Updates 9 specific tables with the updated hardcoded CSV dataset.
 *
 * 9 Tables:
 *  1. client_master
 *  2. category_spend_by_client
 *  3. supplier_detail_by_client
 *  4. client_summary
 *  5. order_register
 *  6. product_catalogue
 *  7. scores_summary
 *  8. assessment_inputs
 *  9. enterprise_master
 */

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// ─── Environment & Clients ───────────────────────────────────────────────────

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres";
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ithvvxdcfyckculqzgkg.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const pool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY);

// ─── RFC 4180 CSV Parser ─────────────────────────────────────────────────────

function parseCSV(csvString) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  const text = csvString.trim();

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: ""
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.length > 0 && currentRow.some(f => f.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.length > 0 && currentRow.some(f => f.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const obj = {};
    headers.forEach((h, index) => {
      obj[h] = row[index] !== undefined ? row[index].trim() : '';
    });
    return obj;
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function num(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (s === '' || s.toUpperCase() === 'N/A' || s.toUpperCase() === 'MANUAL — PENDING' || s.toUpperCase() === 'PENDING') return null;
  // Remove commas, percent signs, currency symbols, and whitespace
  const clean = s.replace(/[₹,%\s]/g, '');
  if (clean === '' || isNaN(clean)) return null;
  return Number(clean);
}

function str(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (s === '') return null;
  return s;
}

function parseDate(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;
  // Check DD/MM/YYYY format
  const parts = s.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

// ─── Raw CSV Data ────────────────────────────────────────────────────────────

const CSV_CLIENT_MASTER = `Client ID,Client Name,Property Type,City,Country,"Procurement Contact Name","Contact Email","Account Start Date","CSRD Reporting Obligation","Account Status","Parent Group (optional — leave blank if standalone property)"
CLT-001,The Astor Dubai,Luxury Hotel,Dubai,UAE,Sarah Al-Hassan,procurement@oberoigroup.com,01/01/2026,Yes,Active,
CLT-002,Six Senses The Palm,Luxury Hotel,Dubai,UAE,James Thornton,j.thornton@sixsenses.com,01/02/2026,Yes,Active,
CLT-003,The Dorchester Dubai,Luxury Hotel,Dubai,UAE,Priya Mehta,p.mehta@dorchester.com,01/03/2026,No,Active,
CLT-004,Meridian Grand Palm,Luxury Hotel,Dubai,UAE,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,Yes,Active,Meridian Hospitality Group (DEMO)
CLT-005,Meridian Oceanview Resort,Resort,Abu Dhabi,UAE,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,Yes,Active,Meridian Hospitality Group (DEMO)
CLT-006,Meridian Heritage Suites,Boutique Hotel,Jaipur,India,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)
CLT-007,Meridian Urban Loft,Business Hotel,Mumbai,India,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)
CLT-008,Meridian Coastal Retreat,Resort,Goa,India,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)
CLT-009,Meridian Business Tower,Business Hotel,Bengaluru,India,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)
CLT-010,Meridian Desert Oasis,Resort,Ras Al Khaimah,UAE,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)
CLT-011,Meridian Riverside Lodge,Boutique Hotel,Kochi,India,DUMMY — Illustrative Contact,dummy@meridiandemo.com,01/01/2026,No,Active,Meridian Hospitality Group (DEMO)`;

const CSV_CATEGORY_SPEND_BY_CLIENT = `Client ID,Category Name,"Total Spend ₹ (auto)","Total Units (auto)","Total CO2e kg (auto)","CO2e Avoided kg (auto)","% of Client Total Spend (auto)"
CLT-001,Bathroom Amenities,"268,000","1,300",578.00,"2,082.00",85.6
CLT-001,Disposables,"7,500","5,000",40.00,13.00,2.4
CLT-001,Packaging,"4,400","2,000",200.00,65.00,1.4
CLT-001,Amenity Accessories,"33,250",350,0.00,0.00,10.6
CLT-002,Bathroom Amenities,"186,000","1,000",150.00,"1,350.00",57.9
CLT-002,Spa & Wellness,"135,000",300,0.00,0.00,42.1
CLT-003,Disposables,6750,1500,90,29.25,6.4
CLT-003,Packaging,4500,2500,200,65,4.2
CLT-003,Spa & Wellness,95000,250,0,0,89.4`;

const CSV_SUPPLIER_DETAIL_BY_CLIENT = `Client ID,Enterprise ID,"Enterprise Name (auto)","Tier (auto)","Evaluation Cluster (auto)","Varna Score (auto)","Band (auto)","Intersection (auto)","E Score (auto)","S Score (auto)","G Score (auto)","C Score (auto)","Readiness (auto)","Risk (auto)","Orders ₹ YTD (auto)","Units YTD (auto)","Total CO2e kg (auto)","CO2e Avoided kg (auto)","E1 Carbon (auto)","E2 Material% (auto)","E3 Circularity (auto)","E4 Water (auto)","E5 Pollution (auto)","E6 Packaging (auto)","S1 Employment (auto)","S2 Gender (auto)","S3 Wages (auto)","S4 Health (auto)","G1 Legal (auto)","G2 Ethics (auto)","G3 Sourcing (auto)","C1 Craft Authenticity (auto)","C2 Skill Rarity (auto)","C3 Climate-Vulnerable (auto)","Parent Group (auto)"
CLT-001,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"268,000","1,300",578.00,"2,082.00",15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,
CLT-001,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"11,900","7,000",240.00,78.00,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,
CLT-002,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"126,000",600,150.00,"1,350.00",15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,
CLT-002,ENT-003,Kheoni Ventures Pvt Ltd,Micro A,Material Innovation,51.3,Foundational,,25.4,59.1,76.5,N/A,42.2,58.8,"195,000",700,0.00,0.00,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,N/A,N/A,N/A,N/A,
CLT-003,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"11,250","4,000",290.00,94.25,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,
CLT-003,ENT-003,Kheoni Ventures Pvt Ltd,Micro A,Material Innovation,51.3,Foundational,,25.4,59.1,76.5,N/A,42.2,58.8,"95,000",250,0.00,0.00,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,N/A,N/A,N/A,N/A,
CLT-004,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"366,000","1,800",720.00,"3,072.00",15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-004,ENT-004,Marikar Green Earth Private Limited,Micro A,Material Innovation,55.3,Emerging,,39,49.7,61.8,N/A,54.4,69.5,0,400,0.00,0.00,15,10,90,15,75,100,56.3,52.5,48.8,37.5,100,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-005,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"12,000","8,000",64.00,20.80,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-005,ENT-005,Greensole Footwear Pvt Ltd,Micro A,Material Innovation,52.9,Foundational,,49.1,42.2,56.3,N/A,54.4,60,0,0,0.00,0.00,48.8,30,75,22.5,60,75,37.5,30,48.8,56.3,90,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-005,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"105,000",500,125.00,"1,125.00",15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-006,ENT-004,Marikar Green Earth Private Limited,Micro A,Material Innovation,55.3,Emerging,,39,49.7,61.8,N/A,54.4,69.5,0,300,0.00,0.00,15,10,90,15,75,100,56.3,52.5,48.8,37.5,100,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-006,ENT-007,Green Loom Cooperative,Micro A,Material Innovation,44.1,Foundational,,37.1,50.6,45.8,N/A,35.6,56,"117,000",450,630.00,810.00,37.5,45,37.5,15,37.5,37.5,56.3,75,30,37.5,52.5,37.5,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-006,ENT-003,Kheoni Ventures Pvt Ltd,Micro A,Material Innovation,51.3,Foundational,,25.4,59.1,76.5,N/A,42.2,58.8,"52,500",350,0.00,0.00,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-007,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"5,500","2,500",250.00,81.25,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-007,ENT-008,PureLeaf Packaging Pvt Ltd,Micro B,Material Innovation,42,Foundational,,33.4,45,44.1,N/A,35.6,54.8,"10,500","3,000","1,050.00","1,650.00",25,45,37.5,15,37.5,37.5,56.3,52.5,30,37.5,56.3,37.5,33.8,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-007,ENT-009,Nimbus Amenities Ltd,Small,Material Innovation,37,Not Ready,,21,42.8,39.2,N/A,31.9,51.5,"14,400",800,624.00,160.00,15,30,15,15,37.5,15,67.5,30,30,37.5,48.8,37.5,26.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-008,ENT-005,Greensole Footwear Pvt Ltd,Micro A,Material Innovation,52.9,Foundational,,49.1,42.2,56.3,N/A,54.4,60,0,0,0.00,0.00,48.8,30,75,22.5,60,75,37.5,30,48.8,56.3,90,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-008,ENT-006,Sundari Herbals Pvt Ltd,Small,Material Innovation,55.4,Emerging,,43.7,62.5,55.3,N/A,56.3,58,"38,000",400,340.00,500.00,48.8,45,37.5,37.5,37.5,56.3,67.5,75,48.8,56.3,60,60,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-008,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"78,000",300,345.00,54.00,15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-009,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"8,100","1,800",108.00,35.10,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-009,ENT-009,Nimbus Amenities Ltd,Small,Material Innovation,37,Not Ready,,21,42.8,39.2,N/A,31.9,51.5,"16,200",900,702.00,180.00,15,30,15,15,37.5,15,67.5,30,30,37.5,48.8,37.5,26.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-009,ENT-010,Rustic Clay Works,Micro A,Material Innovation,21.8,Not Ready,,12.5,26.4,23.3,N/A,10,42.3,"16,250",250,262.50,37.50,15,10,10,15,15,10,56.3,30,0,10,30,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-010,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,Climate Innovation,74.3,Advanced,,31.8,63.8,85.3,N/A,100,70.8,"277,500","1,500",165.00,"3,585.00",15,10,52.5,15,100,56.3,56.3,75,32.5,100,100,100,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-010,ENT-004,Marikar Green Earth Private Limited,Micro A,Material Innovation,55.3,Emerging,,39,49.7,61.8,N/A,54.4,69.5,0,500,0.00,0.00,15,10,90,15,75,100,56.3,52.5,48.8,37.5,100,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-010,ENT-002,UKHI India Private Limited,Small,Material Innovation,77.1,Advanced,,46.3,67.5,78.3,N/A,100,75.3,"3,600","2,000",160.00,52.00,37.5,10,90,15,80,100,67.5,60,48.8,100,100,80,41.3,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-011,ENT-003,Kheoni Ventures Pvt Ltd,Micro A,Material Innovation,51.3,Foundational,,25.4,59.1,76.5,N/A,42.2,58.8,"90,000",200,0.00,0.00,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-011,ENT-007,Green Loom Cooperative,Micro A,Material Innovation,44.1,Foundational,,37.1,50.6,45.8,N/A,35.6,56,"46,800",180,252.00,324.00,37.5,45,37.5,15,37.5,37.5,56.3,75,30,37.5,52.5,37.5,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-011,ENT-010,Rustic Clay Works,Micro A,Material Innovation,21.8,Not Ready,,12.5,26.4,23.3,N/A,10,42.3,"9,750",150,157.50,22.50,15,10,10,15,15,10,56.3,30,0,10,30,15,N/A,N/A,N/A,N/A,Meridian Hospitality Group (DEMO)
CLT-001,ENT-003,Kheoni Ventures Pvt Ltd,Micro A,Material Innovation,51.3,Foundational,,25.4,59.1,76.5,N/A,42.2,58.8,33250,350,0,0,15,10,37.5,15,75,37.5,56.3,60,48.8,75,90,60,N/A,N/A,N/A,N/A,`;

const CSV_CLIENT_SUMMARY = `Client ID,"Client Name (auto)","Reporting Period","Total Spend ₹ (auto)","Total Orders (auto)","Total Units (auto)","Total CO2e kg (auto)","Total CO2e Avoided kg (auto)","CO2 Reduction % (auto)","No. Active Suppliers","Avg Varna Score","Avg E Score","Avg S Score","Avg G Score","Avg C Score (craft only)","No. Intersection Suppliers","No. Varna Leaders","Total Artisans Supported","Women Workforce %","Portfolio Craft-Led %","Portfolio Innovation %","Portfolio Hybrid %","Avg E1 Carbon (auto)","Avg E2 Material% (auto)","Avg E3 Circularity (auto)","Avg E4 Water (auto)","Avg E5 Pollution (auto)","Avg E6 Packaging (auto)","Avg S1 Employment (auto)","Avg S2 Gender (auto)","Avg S3 Wages (auto)","Avg S4 Health (auto)","Avg G1 Legal (auto)","Avg G2 Ethics (auto)","Avg G3 Sourcing (auto)","Avg C1 Craft Auth (auto)","Avg C2 Skill Rarity (auto)","Avg C3 Climate-Vulnerable (auto)","Car Km Avoided (auto)","Trees Equivalent (auto)"
CLT-001,The Astor Dubai,Jan–Jun 2026,"313,150",5,"8,650",818.00,"2,160.00",72.5,3,67.6,34.5,63.5,80,N/A,0,0,Manual — pending,Manual — pending,0%,100%,0%,22.5,10.00,60.00,15.00,85,64.6,60,65,43.4,91.7,96.7,80,41.3,N/A,N/A,N/A,8852,98
CLT-002,Six Senses The Palm,Jan–Jun 2026,"321,000",3,"1,300",150.00,"1,350.00",90.0,2,62.8,28.6,61.5,80.9,N/A,0,0,Manual — pending,Manual — pending,0%,100%,0%,15,10.00,45.00,15.00,87.5,46.9,56.3,67.5,40.7,87.5,95,80,41.3,N/A,N/A,N/A,5533,61
CLT-003,The Dorchester Dubai,Jan–Jun 2026,"106,250",3,"4,250",290.00,94.25,24.5,2,64.2,35.9,63.3,77.4,N/A,0,0,Manual — pending,Manual — pending,0%,100%,0%,26.3,10.00,63.80,15.00,77.5,68.8,61.9,60,48.8,87.5,95,70,41.3,N/A,N/A,N/A,386,4
CLT-004,Meridian Grand Palm,,"366,000",3,"2,200",720.00,"3,072.00",81.0,2,64.8,35.4,56.8,73.6,N/A,0,0,,,0%,100%,0%,15,10.00,71.30,15.00,87.5,78.2,56.3,63.8,40.7,68.8,100,57.5,41.3,N/A,N/A,N/A,12590,140
CLT-005,Meridian Oceanview Resort,,"117,000",3,"10,000",189.00,"1,145.80",85.8,3,68.1,42.4,57.8,73.3,N/A,0,0,,,0%,100%,0%,33.8,16.70,72.50,17.50,80,77.1,53.8,55,43.4,85.4,96.7,65,41.3,N/A,N/A,N/A,4696,52
CLT-006,Meridian Heritage Suites,,"169,500",3,"1,100",630.00,810.00,56.3,3,50.2,33.8,53.1,61.4,N/A,0,0,,,0%,100%,0%,22.5,21.70,55.00,15.00,62.5,58.3,56.3,62.5,42.5,50,80.8,37.5,N/A,N/A,N/A,N/A,3320,37
CLT-007,Meridian Urban Loft,,"30,400",3,"6,300","1,924.00","1,891.25",49.6,3,52,33.6,51.8,53.9,N/A,0,0,,,0%,100%,0%,25.8,28.30,47.50,15.00,51.7,50.8,63.8,47.5,36.3,58.3,68.4,51.7,33.8,N/A,N/A,N/A,7751,86
CLT-008,Meridian Coastal Retreat,,"116,000",3,"2,500",685.00,554.00,44.7,3,60.9,41.5,56.2,65.6,N/A,0,0,,,0%,100%,0%,37.5,28.30,55.00,25.00,65.8,62.5,53.8,60,43.4,70.9,83.3,58.3,41.3,N/A,N/A,N/A,2270,25
CLT-009,Meridian Business Tower,,"40,550",3,"2,950","1,072.50",252.60,19.1,3,45.3,26.6,45.6,46.9,N/A,0,0,,,0%,100%,0%,22.5,16.70,38.30,15.00,44.2,41.7,63.8,40,26.3,49.2,59.6,44.2,33.8,N/A,N/A,N/A,1035,11
CLT-010,Meridian Desert Oasis,,"281,100",3,"4,000",325.00,"3,637.00",91.8,3,68.9,39,60.3,75.1,N/A,0,0,,,0%,100%,0%,22.5,10.00,77.50,15.00,85,85.4,60,62.5,43.4,79.2,100,65,41.3,N/A,N/A,N/A,14906,165
CLT-011,Meridian Riverside Lodge,,"146,550",3,530,409.50,346.50,45.8,3,39.1,25,45.4,48.5,N/A,0,0,,,0%,100%,0%,22.5,21.70,28.30,15.00,42.5,28.3,56.3,55,26.3,40.8,57.5,37.5,N/A,N/A,N/A,N/A,1420,16`;

const CSV_ORDER_REGISTER = `Order ID,"Order Line No.",Order Date,Client ID,"Client Name (auto)",SKU ID,"Product Name (auto)","Category (auto)","Enterprise ID (auto)","Enterprise Name (auto)","Varna Score (auto)","Band (auto)","Intersection Flag (auto)","E Score (auto)","S Score (auto)","G Score (auto)","C Score (auto)",Qty Units,"Unit Price ₹ (auto)","ORDER VALUE ₹ (auto)","CO2e/unit (auto)","Conventional Baseline/unit (auto)","Total CO2e This Line (auto)","Conv CO2e Equivalent (auto)","CO2e AVOIDED (auto)","CO2 Reduction %","Order Status","Expected Delivery",Line Weight (kg),Transport (Kg CO2 eq) (auto),"Parent Group (auto)","Car Km Avoided (auto)","Trees Equivalent (auto)"
ORD-001,1,01/03/2026,CLT-001,The Astor Dubai,SKU-001,Liquid Soap (Fresh Lime Shower Gel),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,800,185,"148,000",0.110,2.500,88.00,"2,000.00","1,912.00",95.6,Delivered,15/03/2026,400,0.02,,7836,87
ORD-001,2,01/03/2026,CLT-001,The Astor Dubai,SKU-005,Drinking Straws,Disposables,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"5,000",2,"7,500",0.008,0.011,40.00,53.00,13.00,24.5,Delivered,15/03/2026,10,0.001,,53,1
ORD-001,3,01/03/2026,CLT-001,The Astor Dubai,SKU-007,Garbage Bags (Flat),Packaging,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"2,000",2,"4,400",0.100,0.133,200.00,265.00,65.00,24.5,Delivered,15/03/2026,50,0.003,,266,3
ORD-002,1,15/03/2026,CLT-002,Six Senses The Palm,SKU-002,Liquid Shampoo (Amla Shikakai),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,600,210,"126,000",0.250,2.500,150.00,"1,500.00","1,350.00",90.0,Delivered,29/03/2026,300,0.015,,5533,61
ORD-002,2,15/03/2026,CLT-002,Six Senses The Palm,SKU-009,Wellness Soap Bar,Bathroom Amenities,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,400,150,"60,000",,,0.00,0.00,0.00,,Processing,20/04/2026,30,0.002,,0,0
ORD-002,3,15/03/2026,CLT-002,Six Senses The Palm,SKU-010,Natural Face Cream,Spa & Wellness,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,300,450,"135,000",,,0.00,0.00,0.00,,Processing,20/04/2026,15,0.001,,0,0
ORD-003,1,05/04/2026,CLT-003,The Dorchester Dubai,SKU-006,Cutlery Set (Fork/Spoon/Knife),Disposables,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"1,500",5,"6,750",0.060,0.080,90.00,119.25,29.25,24.5,Delivered,19/04/2026,22.5,0.001,,120,1
ORD-003,2,05/04/2026,CLT-003,The Dorchester Dubai,SKU-008,Carry Bags,Packaging,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"2,500",2,"4,500",0.080,0.106,200.00,265.00,65.00,24.5,Delivered,19/04/2026,50,0.003,,266,3
ORD-003,3,05/04/2026,CLT-003,The Dorchester Dubai,SKU-011,Herbal Hair Oil,Spa & Wellness,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,250,380,"95,000",,,0.00,0.00,0.00,,Processing,25/04/2026,25,0.001,,0,0
ORD-004,1,10/04/2026,CLT-001,The Astor Dubai,SKU-003,Liquid Conditioner (Jojoba Aloevera),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,500,240,"120,000",0.980,1.320,490.00,660.00,170.00,25.8,Processing,24/04/2026,257.5,0.013,,697,8
ORD-004,2,10/04/2026,CLT-001,The Astor Dubai,SKU-012,Handcrafted Wooden Comb,Amenity Accessories,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,350,95,33250,,,0,0,0,,Processing,24/04/2026,10.5,0.001,,0,0
ORD-005,1,02/05/2026,CLT-004,Meridian Grand Palm,SKU-001,Liquid Soap (Fresh Lime Shower Gel),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,"1,200",185,"222,000",0.110,2.500,132.00,"3,000.00","2,868.00",95.6,Delivered,16/05/2026,600,0.03,Meridian Hospitality Group (DEMO),11754,130
ORD-005,2,02/05/2026,CLT-004,Meridian Grand Palm,SKU-013,Agri-Residue Tableware (rice-husk/rice-straw and sugarcane-bagasse lines) — SKU-level detail pending,Disposables,ENT-004,Marikar Green Earth Private Limited,55.3,Emerging,,39,49.7,61.8,N/A,400,,0,,,0.00,0.00,0.00,,Delivered,16/05/2026,0,0,Meridian Hospitality Group (DEMO),0,0
ORD-005,3,02/05/2026,CLT-004,Meridian Grand Palm,SKU-003,Liquid Conditioner (Jojoba Aloevera),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,600,240,"144,000",0.980,1.320,588.00,792.00,204.00,25.8,Delivered,16/05/2026,309,0.015,Meridian Hospitality Group (DEMO),836,9
ORD-006,1,05/05/2026,CLT-005,Meridian Oceanview Resort,SKU-005,Drinking Straws,Disposables,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"8,000",2,"12,000",0.008,0.011,64.00,84.80,20.80,24.5,Delivered,19/05/2026,16,0.001,Meridian Hospitality Group (DEMO),85,1
ORD-006,2,05/05/2026,CLT-005,Meridian Oceanview Resort,SKU-014,,,,,,,,,,,,"1,500",,0,,,0.00,0.00,0.00,,Delivered,19/05/2026,,0,Meridian Hospitality Group (DEMO),0,0
ORD-006,3,05/05/2026,CLT-005,Meridian Oceanview Resort,SKU-002,Liquid Shampoo (Amla Shikakai),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,500,210,"105,000",0.250,2.500,125.00,"1,250.00","1,125.00",90.0,Delivered,19/05/2026,250,0.013,Meridian Hospitality Group (DEMO),4611,51
ORD-007,1,08/05/2026,CLT-006,Meridian Heritage Suites,SKU-013,Agri-Residue Tableware (rice-husk/rice-straw and sugarcane-bagasse lines) — SKU-level detail pending,Disposables,ENT-004,Marikar Green Earth Private Limited,55.3,Emerging,,39,49.7,61.8,N/A,300,,0,,,0.00,0.00,0.00,,Delivered,22/05/2026,0,0,Meridian Hospitality Group (DEMO),0,0
ORD-007,2,08/05/2026,CLT-006,Meridian Heritage Suites,SKU-016,Natural-Dye Cushion Cover,Bedding & Linen,ENT-007,Green Loom Cooperative,44.1,Foundational,,37.1,50.6,45.8,N/A,450,260,"117,000",1.400,3.200,630.00,"1,440.00",810.00,56.3,Delivered,22/05/2026,135,0.007,Meridian Hospitality Group (DEMO),3320,37
ORD-007,3,08/05/2026,CLT-006,Meridian Heritage Suites,SKU-009,Wellness Soap Bar,Bathroom Amenities,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,350,150,"52,500",,,0.00,0.00,0.00,,Processing,29/05/2026,26.25,0.001,Meridian Hospitality Group (DEMO),0,0
ORD-008,1,10/05/2026,CLT-007,Meridian Urban Loft,SKU-007,Garbage Bags (Flat),Packaging,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"2,500",2,"5,500",0.100,0.133,250.00,331.25,81.25,24.5,Delivered,24/05/2026,62.5,0.003,Meridian Hospitality Group (DEMO),333,4
ORD-008,2,10/05/2026,CLT-007,Meridian Urban Loft,SKU-017,Compostable Amenity Pouch,Packaging,ENT-008,PureLeaf Packaging Pvt Ltd,42,Foundational,,33.4,45,44.1,N/A,"3,000",4,"10,500",0.350,0.900,"1,050.00","2,700.00","1,650.00",61.1,Delivered,24/05/2026,45,0.002,Meridian Hospitality Group (DEMO),6762,75
ORD-008,3,10/05/2026,CLT-007,Meridian Urban Loft,SKU-018,Standard Soap Bar 100g,Bathroom Amenities,ENT-009,Nimbus Amenities Ltd,37,Not Ready,,21,42.8,39.2,N/A,800,18,"14,400",0.780,0.980,624.00,784.00,160.00,20.4,Delivered,24/05/2026,80,0.004,Meridian Hospitality Group (DEMO),656,7
ORD-009,1,12/05/2026,CLT-008,Meridian Coastal Retreat,SKU-014,,,,,,,,,,,,"1,800",,0,,,0.00,0.00,0.00,,Delivered,26/05/2026,,0,Meridian Hospitality Group (DEMO),0,0
ORD-009,2,12/05/2026,CLT-008,Meridian Coastal Retreat,SKU-015,Herbal Face Pack,Spa & Wellness,ENT-006,Sundari Herbals Pvt Ltd,55.4,Emerging,,43.7,62.5,55.3,N/A,400,95,"38,000",0.850,2.100,340.00,840.00,500.00,59.5,Delivered,26/05/2026,20,0.001,Meridian Hospitality Group (DEMO),2049,23
ORD-009,3,12/05/2026,CLT-008,Meridian Coastal Retreat,SKU-004,Moisturiser (Aloevera Body Lotion),Spa & Wellness,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,300,260,"78,000",1.150,1.330,345.00,399.00,54.00,13.5,Processing,02/06/2026,35.4,0.002,Meridian Hospitality Group (DEMO),221,2
ORD-010,1,15/05/2026,CLT-009,Meridian Business Tower,SKU-006,Cutlery Set (Fork/Spoon/Knife),Disposables,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"1,800",5,"8,100",0.060,0.080,108.00,143.10,35.10,24.5,Delivered,29/05/2026,27,0.001,Meridian Hospitality Group (DEMO),144,2
ORD-010,2,15/05/2026,CLT-009,Meridian Business Tower,SKU-018,Standard Soap Bar 100g,Bathroom Amenities,ENT-009,Nimbus Amenities Ltd,37,Not Ready,,21,42.8,39.2,N/A,900,18,"16,200",0.780,0.980,702.00,882.00,180.00,20.4,Delivered,29/05/2026,90,0.005,Meridian Hospitality Group (DEMO),738,8
ORD-010,3,15/05/2026,CLT-009,Meridian Business Tower,SKU-019,Ceramic-style Amenity Tray,Amenity Accessories,ENT-010,Rustic Clay Works,21.8,Not Ready,,12.5,26.4,23.3,N/A,250,65,"16,250",1.050,1.200,262.50,300.00,37.50,12.5,Processing,05/06/2026,50,0.003,Meridian Hospitality Group (DEMO),154,2
ORD-011,1,18/05/2026,CLT-010,Meridian Desert Oasis,SKU-001,Liquid Soap (Fresh Lime Shower Gel),Bathroom Amenities,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,74.3,Advanced,,31.8,63.8,85.3,N/A,"1,500",185,"277,500",0.110,2.500,165.00,"3,750.00","3,585.00",95.6,Delivered,01/06/2026,750,0.038,Meridian Hospitality Group (DEMO),14693,163
ORD-011,2,18/05/2026,CLT-010,Meridian Desert Oasis,SKU-013,Agri-Residue Tableware (rice-husk/rice-straw and sugarcane-bagasse lines) — SKU-level detail pending,Disposables,ENT-004,Marikar Green Earth Private Limited,55.3,Emerging,,39,49.7,61.8,N/A,500,,0,,,0.00,0.00,0.00,,Delivered,01/06/2026,0,0,Meridian Hospitality Group (DEMO),0,0
ORD-011,3,18/05/2026,CLT-010,Meridian Desert Oasis,SKU-008,Carry Bags,Packaging,ENT-002,UKHI India Private Limited,77.1,Advanced,,46.3,67.5,78.3,N/A,"2,000",2,"3,600",0.080,0.106,160.00,212.00,52.00,24.5,Delivered,01/06/2026,40,0.002,Meridian Hospitality Group (DEMO),213,2
ORD-012,1,20/05/2026,CLT-011,Meridian Riverside Lodge,SKU-010,Natural Face Cream,Spa & Wellness,ENT-003,Kheoni Ventures Pvt Ltd,51.3,Foundational,,25.4,59.1,76.5,N/A,200,450,"90,000",,,0.00,0.00,0.00,,Delivered,03/06/2026,10,0.001,Meridian Hospitality Group (DEMO),0,0
ORD-012,2,20/05/2026,CLT-011,Meridian Riverside Lodge,SKU-016,Natural-Dye Cushion Cover,Bedding & Linen,ENT-007,Green Loom Cooperative,44.1,Foundational,,37.1,50.6,45.8,N/A,180,260,"46,800",1.400,3.200,252.00,576.00,324.00,56.3,Processing,10/06/2026,54,0.003,Meridian Hospitality Group (DEMO),1328,15
ORD-012,3,20/05/2026,CLT-011,Meridian Riverside Lodge,SKU-019,Ceramic-style Amenity Tray,Amenity Accessories,ENT-010,Rustic Clay Works,21.8,Not Ready,,12.5,26.4,23.3,N/A,150,65,"9,750",1.050,1.200,157.50,180.00,22.50,12.5,Processing,10/06/2026,30,0.002,Meridian Hospitality Group (DEMO),92,1`;

const CSV_PRODUCT_CATALOGUE = `SKU ID,Enterprise ID,"Enterprise Name (auto)",Category ID,Category Name,"Conventional Baseline CO2e/unit kg","Baseline Source",Product Name,"Product Description","Unit of Measure",Unit Price ₹,MOQ,"Lead Time (days)","Carbon Intensity kg CO2e/unit (manual entry)","CO2 Reduction vs Baseline % (auto)","Carbon Score 0–100 (auto)","Varna Score (auto from Sheet 3)","Band (auto from Sheet 3)","Active (Y/N)",Unit Weight (kg)
SKU-001,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,CAT-004,Bathroom Amenities,2.500,CarbonBright AI-LCA 2024,Liquid Soap (Fresh Lime Shower Gel),"Plant-derived shower gel — saponins, aloe vera, lemon oil",Litre,185,50,21,0.110,95.6,100,74.3,Advanced,Y,0.5
SKU-002,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,CAT-004,Bathroom Amenities,2.500,CarbonBright AI-LCA 2024,Liquid Shampoo (Amla Shikakai),"Amla, shikakai, hibiscus, reetha extract shampoo",Litre,210,50,21,0.250,90.0,100,74.3,Advanced,Y,0.5
SKU-003,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,CAT-004,Bathroom Amenities,1.320,Devera PCF Report (raw materials only),Liquid Conditioner (Jojoba Aloevera),"Jojoba, olive, shea butter conditioner",Litre,240,50,21,0.980,25.8,65,74.3,Advanced,Y,0.515
SKU-004,ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,CAT-005,Spa & Wellness,1.330,Devera PCF Report (raw materials only),Moisturiser (Aloevera Body Lotion),"Aloe vera, shea butter, olive oil lotion",Litre,260,50,21,1.150,13.5,50,74.3,Advanced,Y,0.118
SKU-005,ENT-002,UKHI India Private Limited,CAT-006,Disposables,0.011,"UKHI Comparative Study (ECOGran vs plastic, per-kg factor x assumed unit weight — PROXY)",Drinking Straws,Compostable EcoGran drinking straw,Piece,2,"5,000",14,0.008,24.5,50,77.1,Advanced,Y,0.002
SKU-006,ENT-002,UKHI India Private Limited,CAT-006,Disposables,0.080,"UKHI Comparative Study (proxy, as above)",Cutlery Set (Fork/Spoon/Knife),Compostable EcoGran cutlery set,Set,5,"2,000",14,0.060,24.5,50,77.1,Advanced,Y,0.015
SKU-007,ENT-002,UKHI India Private Limited,CAT-007,Packaging,0.133,"UKHI Comparative Study (proxy, as above)",Garbage Bags (Flat),Compostable EcoGran garbage bag,Piece,2,"3,000",14,0.100,24.5,50,77.1,Advanced,Y,0.025
SKU-008,ENT-002,UKHI India Private Limited,CAT-007,Packaging,0.106,"UKHI Comparative Study (proxy, as above)",Carry Bags,Compostable EcoGran carry bag,Piece,2,"3,000",14,0.080,24.5,50,77.1,Advanced,Y,0.02
SKU-009,ENT-003,Kheoni Ventures Pvt Ltd,CAT-004,Bathroom Amenities,,Not yet available — pending,Wellness Soap Bar,Natural wellness soap bar,Piece,150,100,18,,,,51.3,Foundational,Y,0.075
SKU-010,ENT-003,Kheoni Ventures Pvt Ltd,CAT-005,Spa & Wellness,,Not yet available — pending,Natural Face Cream,Natural wellness face cream,Piece,450,50,18,,,,51.3,Foundational,Y,0.05
SKU-011,ENT-003,Kheoni Ventures Pvt Ltd,CAT-005,Spa & Wellness,,Not yet available — pending,Herbal Hair Oil,Natural herbal hair oil,Litre,380,50,18,,,,51.3,Foundational,Y,0.1
SKU-012,ENT-003,Kheoni Ventures Pvt Ltd,CAT-008,Amenity Accessories,,Not yet available — pending,Handcrafted Wooden Comb,"Mango-wood comb, artisan-packaged",Piece,95,100,18,,,,51.3,Foundational,Y,0.03
SKU-013,ENT-004,Marikar Green Earth Private Limited,CAT-006,Disposables,,PENDING — Qudrat has not supplied product-level carbon/baseline data; SAQ 3.2f confirms no carbon footprint calculation has been done,Agri-Residue Tableware (rice-husk/rice-straw and sugarcane-bagasse lines) — SKU-level detail pending,"Placeholder row covering both Qudrat product lines confirmed by their Drive documents: an RH (rice-husk/rice-straw) line backed by a biodegradability test and food-contact test, and an SB (sugarcane bagasse line) backed by a food-contact & heavy-metal test. No per-SKU pricing, MOQ, lead time, or unit weight has been supplied yet — request a Product Line Sheet from Qudrat to split this into separate real SKU rows the way Greensole's two products were.",Piece,,,,,,,55.3,Emerging,Y,
SKU-020,ENT-005,Greensole Footwear Pvt Ltd,CAT-010,Other,5.800,Brand-supplied PCF comparison (Greensole vs conventional-Asia baseline) — not yet independently verified; formal LCA pending,Sustainable Yoga Mat,In-room amenity yoga mat made from recycled shoe dust and coffee waste; printed exercise guide included; colours customisable to hotel branding; hero product; returnable to Greensole Foundation for upcycling into bags and footwear components at end of life,Kg,,,,3.950,31.9,65,52.9,Foundational,Y,1.1
SKU-015,ENT-006,Sundari Herbals Pvt Ltd,CAT-005,Spa & Wellness,2.100,DUMMY — illustrative proxy,Herbal Face Pack,Natural clay and herb face pack,Piece,95,100,20,0.850,59.5,80,55.4,Emerging,Y,0.05
SKU-016,ENT-007,Green Loom Cooperative,CAT-009,Bedding & Linen,3.200,DUMMY — illustrative proxy,Natural-Dye Cushion Cover,Hand-dyed cotton cushion cover,Piece,260,50,25,1.400,56.3,80,44.1,Foundational,Y,0.3
SKU-017,ENT-008,PureLeaf Packaging Pvt Ltd,CAT-007,Packaging,0.900,DUMMY — illustrative proxy,Compostable Amenity Pouch,Compostable film amenity pouch,Piece,4,"2,000",18,0.350,61.1,90,42,Foundational,Y,0.015
SKU-018,ENT-009,Nimbus Amenities Ltd,CAT-004,Bathroom Amenities,0.980,DUMMY — illustrative proxy,Standard Soap Bar 100g,Transitional formulation soap bar,Piece,18,500,12,0.780,20.4,50,37,Not Ready,Y,0.1
SKU-019,ENT-010,Rustic Clay Works,CAT-008,Amenity Accessories,1.200,DUMMY — illustrative proxy,Ceramic-style Amenity Tray,"Amenity tray, ceramic-finish",Piece,65,150,22,1.050,12.5,50,21.8,Not Ready,Y,0.2
SKU-021,ENT-005,Greensole Footwear Pvt Ltd,CAT-010,Other,0.85,Brand-supplied PCF comparison (Greensole vs conventional-Asia baseline) — not yet independently verified; formal LCA pending,Sustainable Slides,In-room slides made from recycled PU material; colour-matchable to the yoga mat for a cohesive in-room set; hero product; sanitisable and reusable across guest stays (~1.5 year lifespan); returnable to Greensole Foundation for upcycling at end of life,Kg,,,,0.77,9.4,30,52.9,Foundational,Y,0.25`;

const CSV_SCORES_SUMMARY = `"Enterprise ID","Enterprise Name",Tier,Is Craft-Led,"Is Material Innovation","Assessment Date","E1 Eff Score","E2 Eff Score","E3 Eff Score","E4 Eff Score","E5 Eff Score","E6 Eff Score","S1 Eff Score","S2 Eff Score","S3 Eff Score","S4 Eff Score","G1 Eff Score","G2 Eff Score","G3 Eff Score","C1 Eff Score","C2 Eff Score","C3 Eff Score","E PILLAR SCORE","S PILLAR SCORE","G PILLAR SCORE","C PILLAR SCORE","R1 Eff Score","R2 Eff Score","R3 Eff Score","R4 Eff Score","READINESS SCORE","RK1 Score","RK2 Score","RK3 Score","RISK SCORE","IMPACT SCORE","FINAL VARNA SCORE",BAND,"INTERSECTION FLAG","SCORE CONFIDENCE %","SCORE CEILING","Environmental Narrative","Social Narrative","Governance Narrative","Cultural Narrative","Overall Assessor Summary","Roadmap Action 1","Action 1 Uplift pts","Action 1 Effort","Roadmap Action 2","Action 2 Uplift pts","Action 2 Effort","Roadmap Action 3","Action 3 Uplift pts","Action 3 Effort"
ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Micro B,N,Y,,15.0,10.0,52.5,15.0,100.0,56.3,56.3,75.0,32.5,100.0,100.0,100.0,41.3,N/A,N/A,N/A,31.8,63.8,85.3,N/A,100.0,100.0,100.0,100.0,100.0,100.0,20.0,95.0,70.8,60.3,74.3,Advanced,,20%,,"Product-level carbon and material data are not yet available — the Product Line Sheet was submitted with material quantities, monthly units, and electricity fields blank. Enterprise-level Scope 2+3 carbon accounting exists (200.36 tCO2e/yr, SME Climate Hub, GHG Protocol) but has not been allocated to individual SKUs, so E1/E2/E4 currently default to proxy/pending. ISO 14001 (EMS) supports the Pollution & Hazardous Content claim at Third-Party Verified. Refill-format packaging (glass/aluminium tins, waterless bars) is a genuine structural strength once product-level data closes the gap.","18 employees, 83% women, women-owned and women-led enterprise (qualifies for Women-Led Bonus). Primary livelihood confirmed for most/all workers. Wages confirmed above minimum wage but no exact ratio supplied — scored conservatively at 1.05 pending the real figure. ESI enrolment status unclear (""not sure"") despite otherwise strong labour documentation — worth a direct follow-up, this is an easy score gain if resolved.","Strongest pillar in this profile. GST and Udyam self-declared compliant, no active legal proceedings. ISO 9001 (QMS), B Corp certification, and a documented Supplier Code of Conduct substantiate Business Ethics at the top band. Responsible Sourcing is the one governance gap — the SAQ does not name specific raw-material suppliers or locations, so this scores at Self-Reported/moderate despite the strong certificate wall elsewhere.","N/A — Not a craft-led enterprise. Cultural pillar not assessed. Impact calculated across Environmental, Social, Governance at 33.33% each.","Bare Necessities presents an unusually strong Governance and Readiness profile for a Micro B supplier — nine-plus third-party certifications including B Corp, ISO 9001/14001/45001, and Cosmetic GMP. However, RK2 Data Reliability scores low despite this, because the framework's RK2 formula counts verification specifically against the ten E/S *input* indicators (material %, carbon %, water %, worker count, gender %, wage ratio) — not against governance/management-system certificates. This is a genuine framework design note: a supplier can be extremely well-certified on paper while still scoring low on Data Reliability if those certificates don't map to the specific E/S fields being measured. Recommend Varna flag this pattern for review — it likely affects other well-certified FMCG-style suppliers, not just this one. Primary near-term unlock: complete the Product Line Sheet (material quantities, electricity, monthly units) so E1/E2/E4 move off proxy.","Allocate existing Scope 2+3 carbon data down to the 4 submitted SKUs (soap, shampoo, conditioner, moisturiser)",12,Low,Confirm exact wage ratio vs Karnataka state minimum wage (currently scored at conservative placeholder 1.05),8,Low,Resolve ESI enrolment status and supply Udyam registration number,6,Low
ENT-002,UKHI India Private Limited,Small,N,Y,,37.5,10.0,90.0,15.0,80.0,100.0,67.5,60.0,48.8,100.0,100.0,80.0,41.3,N/A,N/A,N/A,46.3,67.5,78.3,N/A,100.0,100.0,100.0,100.0,100.0,100.0,40.0,85.0,75.3,64.0,77.1,Advanced,,40%,,"Compostable packaging/cutlery made from proprietary EcoGran biopolymer (agri-residue based). Compostability independently verified via CIPET government lab test and ISO 17088 certification — a strong, verifiable environmental claim. Formal product-level carbon footprint is explicitly ""in process"" (SAQ 3.2f) — not yet available, so E1 defaults to proxy/pending. % Sustainable Material also unquantified, though the compostability certification is strong indirect evidence of high bio-based content.","68 employees, 37% women, women-led enterprise. 100% ESI enrollment (Third-Party Verified via government scheme) and documented safety practices are a genuine strength — stronger social documentation than most suppliers in this portfolio. Wage ratio confirmed ""above minimum"" but no exact figure supplied, scored conservatively pending the real number.","GST, Udyam, and CPCB EPR (plastics Extended Producer Responsibility) all compliant. ISO 9001 QMS and an informal written ethics commitment support Business Ethics. Responsible Sourcing is the main gap — raw material type (PLA/PBAT, imported) and payment practices are disclosed, but no named supplier company or country of origin.","N/A — Not a craft-led enterprise. Cultural pillar not assessed. Impact calculated across Environmental, Social, Governance at 33.33% each.","UKHI holds one of the strongest certificate portfolios in the current pipeline — ISO 9001/14001/17088, FSSAI, Halal, CPCB EPR Registration, and an independent CIPET lab test, several of which map directly onto specific E/S indicators (compostability certification verifies E3 and E6 directly; ESI enrollment verifies S4 directly). This is the pattern we flagged as a framework gap when reviewing Bare Necessities — RK2 Data Reliability only rewards certificates that map onto the specific 10 E/S input fields, and UKHI happens to have several that do, which is why its RK2 (40%) is meaningfully higher than Bare's (20%) despite a broadly comparable certificate count. Primary near-term unlock: get the product-level carbon footprint calculation they say is already in progress.","Follow up on the carbon footprint calculation already stated as ""in process"" (SAQ 3.2f)",15,Low,"Get named raw material suppliers and countries of origin for PLA/PBAT (currently only ""self-sourced, imported"")",10,Low,Quantify % sustainable/bio-based material content per product,6,Low
ENT-003,Kheoni Ventures Pvt Ltd,Micro A,N,Y,,15.0,10.0,37.5,15.0,75.0,37.5,56.3,60.0,48.8,75.0,90.0,60.0,N/A,N/A,N/A,N/A,25.4,59.1,76.5,N/A,56.3,56.3,56.3,0.0,42.2,100.0,0.0,75.0,58.8,53.7,51.3,Foundational,,0%,,"No product-level or verified carbon, material, or water data available. Self-reported annual carbon figure (7.7 tCO2e/year) has no named methodology or third-party verification. Non-toxic production claimed but no EMS certification exists to back it, unlike Bare Necessities or UKHI.","15 employees, 40% women, women-owned/led. Claims 100% ESI enrollment and written employment agreements — matches Bare/UKHI in substance, but nothing has been documentarily verified at this stage.","GST and Udyam self-declared compliant. Governance's clearest weakness: explicitly declined to name top 3 raw material suppliers (""Cannot disclose the names"") — a materially larger transparency gap than either Bare Necessities or UKHI, both of whom at least described sourcing method or material origin.","N/A — Assessed as not craft-led for scoring purposes: no GI tag, Pehchaan Card, or Craftmark; no production video or tool documentation provided; enterprise itself states products are ""not based on a traditional Indian craft form."" Impact calculated across Environmental, Social, Governance at 33.33% each.","KEY DIFFERENCE FROM BARE NECESSITIES AND UKHI: no certificates or supporting documents have been received for Kheoni as of this assessment. Every input in this row is Self-Reported or None/Proxy — nothing is Third-Party Verified. This is expected to produce a materially lower Risk score (RK2 Data Reliability) than Bare or UKHI despite a comparably strong narrative, which is the framework working as intended: a compelling story without verifying evidence should not score the same as one backed by audited certificates. Score should be treated as provisional and revisited in full once certificates and the Product Line Sheet are received.",Obtain and review the certificate documents linked in SAQ 5.9/7.8 (not yet reviewed by Varna),20,Low,Get named raw material suppliers and locations — currently the largest single gap in this profile,15,Low,"Obtain Product Line Sheet with per-product material, electricity, water, and packaging data",10,Low
ENT-004,Marikar Green Earth Private Limited,Micro A,N,Y,,15.0,10.0,90.0,15.0,75.0,100.0,56.3,52.5,48.8,37.5,100.0,15.0,N/A,N/A,N/A,N/A,39.0,49.7,61.8,N/A,37.5,37.5,75.0,75.0,54.4,100.0,20.0,90.0,69.5,50.2,55.3,Emerging,,20%,,"Products are inherently plastic-free — agricultural-waste-based tableware (rice husk, rice straw, sugarcane bagasse) replacing single-use plastic disposables. Compostability is independently documented via a biodegradability test on the rice-bran-based ('RH') line — genuine third-party evidence (CSIR-NIIST, 99.67% biodegradation in 100 days), though confirmed for that line specifically, not the full range. A further confirmed lab document (the 'RH USFDA' file) is an SGS test confirming Pentachlorophenol was Not Detected per US FDA 21 CFR 178.3800 for US-bound tableware — real food-safety evidence, but narrower than 'USFDA compliance' implies. The RH Food Contact test and SB (sugarcane bagasse line) Food Contact & Heavy Metal test remain Drive-listing-only, not yet read in full — so food-contact safety is confirmed for one parameter on one line, not verified across both product lines. No carbon or water metrics exist regardless. No carbon footprint calculation, LCA, or water-footprint measurement has been done (SAQ 3.2f, 3.6a, 3.2b all No) — E1, E2, and E4 default to proxy/pending. Chemical inputs self-reported as non-toxic, but with no certification to back the claim.","28 employees, 8 women (29%) — not women-led (SAQ 1.11: No), differing from every other supplier in this portfolio to date. This is their primary livelihood, and written pay/working-condition agreements exist. Paid above minimum wage per SAQ but no exact ratio supplied — scored conservatively at 1.05 pending the real figure. ESI not applicable (below the required employee threshold). Workplace safety described as basic/informal (PPE available, no documented system) — the weakest S4 rating in this portfolio so far.","GST, Udyam, FSSAI, IEC, DPIIT, PAN, AD Code and Kerala Startup Mission recognition are all individually confirmed in the brand's Drive folder — a fully-documented statutory base, scoring G1 (Legal Compliance) at 100/100. The clearest weakness is Business Ethics: no written ethics or responsible-sourcing policy exists (SAQ 5.7: ""nothing written currently""). Responsible Sourcing (G3) is a genuine strength, not a middling one: Qudrat named all three raw material suppliers with company and location (Double Horse–Pollachi; Yash Pakka–Ayodhya; Parisons–Trivandrum) and confirmed always-on-time-or-early payment — full marks on every checklist component (100/100), ahead of every other supplier in this portfolio on disclosure. R4 (Certifications) sits at ""Multiple verified certifications"" (75/100) — FSSAI (valid, but a Distributor-tier Registration rather than a Manufacturer License), plus a confirmed CSIR-NIIST biodegradability test and a confirmed SGS PCP food-safety test; two further claimed lab tests (RH Food Contact, SB Food Contact & Heavy Metal) are still Drive-listing-only and unread, so the set is genuinely strong but not yet ""comprehensive.""","N/A — Not a craft-led enterprise (no craft form, GI tag, Pehchaan Card, or Craftmark claimed; GI-tag status itself uncertain — SAQ 6.4: ""not sure, please check""). Impact calculated across Environmental, Social, Governance at 33.33% each.","Qudrat's core product is a genuine material-innovation play — converting agricultural residue (rice husk, rice straw, sugarcane bagasse) that would otherwise be discarded or burnt into single-use-plastic alternatives — and it's the only supplier in this portfolio that is not women-led. There's a real gap between the SAQ self-report and the actual document set: Section 3.6/4.7 both say ""None at the moment"" for environmental and social certifications, yet the brand has since shared four real third-party test reports (three from SGS, one from NIIST) plus a fuller statutory registration set (GST, Udyam, FSSAI, IEC, DPIIT, KSUM) than the SAQ checkboxes suggest — worth flagging that product test reports should be logged even when they don't read as ""certifications"" on the form. Score should be revisited once the Product Line Sheet and fuller product-specific compostability evidence (beyond the single Rice Bran SKU) are received. CORRECTION (post-review): G1 was initially scored 95/100 with no documented justification for the 5-point deduction, and G3 was initially scored 40/100 despite this file's own narrative already describing Qudrat's supplier disclosure as a strength — a direct contradiction that shouldn't have shipped. Both corrected to 100/100 on review, backed by a direct listing of Qudrat's Drive folder (not just the earlier certificate table) which also surfaced one document not previously accounted for — an RH USFDA compliance document — which had prompted an R4 upgrade to ""Comprehensive certification portfolio."" FURTHER CORRECTION (after reading the three attached PDFs in full — biodegradability test, FSSAI registration, USFDA document): the material tested is Rice Bran, not Rice Husk as the filenames suggested; the ""USFDA"" document is an SGS single-parameter PCP test, not a broad USFDA certification; and FSSAI is a valid but Distributor/Registration-tier document, not a Manufacturer License. R4 downgraded to ""Multiple verified certifications"" (75/100) accordingly, since only 2 of the 4 claimed lab tests have been verified by actual content, and the evidence — while genuine — is narrower than ""comprehensive"" implied.",Extend the NIIST/ISO 14855-2 biodegradability testing beyond the Rice Bran SKU to the full bagasse and rice-husk product range,12,Low,"Put a written ethics/responsible-sourcing policy in place, given suppliers are already named and on-time payment is confirmed",10,Low,"Obtain Product Line Sheet with per-product material composition, electricity, and water data to move E1/E2/E4 off proxy",10,Low
ENT-005,Greensole Footwear Pvt Ltd,Micro A,N,Y,,48.8,30.0,75.0,22.5,60.0,75.0,37.5,30.0,48.8,56.3,90.0,15.0,N/A,N/A,N/A,N/A,49.1,42.2,56.3,N/A,37.5,56.3,75.0,56.3,54.4,100.0,0.0,80.0,60.0,49.2,52.9,Foundational,,0%,,"Genuine circularity story: yoga mats from recycled shoe dust and coffee waste, slides from recycled PU, with a formal take-back path back into the Greensole Foundation's upcycling pipeline — scored as a closed-loop model. Product-level carbon comparisons supplied directly by the brand show real reductions (Yoga Mat 31.9% lower, Slides 9.4% lower than conventional-Asia baselines), combined into a unit-weight-weighted ~27.7% enterprise-level E1 input (weighted toward the heavier Yoga Mat rather than a flat average) — a placeholder pending real order-volume weighting, but neither underlying figure is independently verified yet — a formal LCA and carbon audit were promised within a month at SAQ stage. Water use is self-described as minimal with no reduction action taken; a measured 1,500 l/month figure is now on file but has no conventional-process baseline to compare it against, so E4 is scored conservatively. Chemical inputs (adhesives, preservatives) are described as mostly safe rather than fully non-toxic.","10 employees, 2 women (20%) — not women-led, one of the smaller and least gender-diverse suppliers in this portfolio. This is the primary livelihood for staff, with written employment agreements and documented HR policies (an Employee Handbook shared with every new joiner). Paid above minimum wage per SAQ but no exact ratio supplied — scored conservatively at 1.05 pending the real figure, consistent with how other suppliers were treated. ESI not applicable (below the employee threshold). Health & safety described as documented practices followed regularly — scored as a basic documented system, one step below the 'Strong H&S' band used for suppliers with more comprehensive systems.","GST and Udyam are confirmed in the actual document table — a solid statutory base. BIS certification is claimed in the SAQ but its certificate copy is not yet confirmed in that document table, so G1 is held at 90/100 (withholding the 10-point product-certification credit) and R4 evidence is scored Self-Reported rather than Third-Party Verified until the BIS copy is actually seen. PETA is the one certification genuinely confirmed on both counts. The clearest weakness is Business Ethics: no written ethics or responsible-sourcing policy exists (SAQ 5.7: 'nothing written currently'), despite otherwise-documented HR practices. Responsible Sourcing is mid-pack: raw material type and location are disclosed (PU – Himachal Pradesh; EVA and other materials – Delhi) and on-time supplier payment is confirmed, but suppliers are named generically rather than by company name.","N/A — Not a craft-led enterprise; this is a material-innovation play (recycled/upcycled inputs), not a traditional craft form. Impact calculated across Environmental, Social, Governance at 33.33% each.","Greensole's core proposition — genuinely circular products (recycled shoe dust, coffee waste, recycled PU) with a real take-back and upcycling loop through its own Foundation — is one of the stronger environmental stories in this portfolio on paper, and the brand-supplied PCF comparisons back it with real numbers. But every one of the ten E/S input indicators here is Self-Reported: the formal LCA, carbon audit, and water/energy reports the brand says are a month away haven't landed yet, so RK2 (Data Reliability) will score at 0% despite the strong narrative — this is the framework working as intended, the same pattern flagged for Kheoni. This is also the only enterprise in the portfolio where turnover/headcount and company age point in different directions (Micro A by the numbers, 11 years old by founding date) — worth deciding whether that should carry a tier note going forward. Revisit this score once the promised LCA, carbon audit, and energy/water reports are received — expect a meaningful RK2 and possibly E1/E4 uplift at that point. CORRECTION (post-review): E1 was initially entered as a flat average of the two products' carbon reductions (~21%); switched to a unit-weight-weighted average (~27.7%) since a flat average gave the lighter, weaker-performing Slides equal weight to the heavier Yoga Mat with no basis for that in reality. Separately, G1 and R4 were both initially scored as if BIS certification were fully confirmed; corrected to reflect that only PETA appears in the actual document table, while BIS is SAQ-claimed but not yet document-confirmed (G1 90/100, R4 evidence Self-Reported).","Obtain the LCA and carbon audit for the Yoga Mat and Slides that the brand says is a month away, to move E1 off a self-reported average onto verified per-product figures",15,Low,"Put a written ethics/responsible-sourcing policy in place and name actual supplier companies (not just material type and location) for the PU and EVA suppliers; obtain the actual BIS certificate copy (claimed in the SAQ, not yet in the document table) to restore the 10-pt G1 credit and upgrade R4 to Third-Party Verified",10,Low,"Establish a conventional-process water baseline so the existing 1,500 l/month figure can be scored as a real reduction %, and confirm exact wage ratio vs Maharashtra state minimum wage",8,Low
ENT-006,Sundari Herbals Pvt Ltd,Small,N,Y,,48.8,45.0,37.5,37.5,37.5,56.3,67.5,75.0,48.8,56.3,60.0,60.0,41.3,N/A,N/A,N/A,43.7,62.5,55.3,N/A,56.3,56.3,56.3,56.3,56.3,95.0,0.0,80.0,58.0,53.8,55.4,Emerging,,0%,55,,,,,,,,,,,,,,
ENT-007,Green Loom Cooperative,Micro A,N,Y,,37.5,45.0,37.5,15.0,37.5,37.5,56.3,75.0,30.0,37.5,52.5,37.5,N/A,N/A,N/A,N/A,37.1,50.6,45.8,N/A,37.5,37.5,37.5,30.0,35.6,90.0,0.0,80.0,56.0,44.5,44.1,Foundational,,0%,44,,,,,,,,,,,,,,
ENT-008,PureLeaf Packaging Pvt Ltd,Micro B,N,Y,,25.0,45.0,37.5,15.0,37.5,37.5,56.3,52.5,30.0,37.5,56.3,37.5,33.8,N/A,N/A,N/A,33.4,45.0,44.1,N/A,37.5,37.5,37.5,30.0,35.6,90.0,0.0,75.0,54.8,40.8,42.0,Foundational,,0%,42,,,,,,,,,,,,,,
ENT-009,Nimbus Amenities Ltd,Small,N,Y,,15.0,30.0,15.0,15.0,37.5,15.0,67.5,30.0,30.0,37.5,48.8,37.5,26.3,N/A,N/A,N/A,21.0,42.8,39.2,N/A,37.5,37.5,37.5,15.0,31.9,85.0,0.0,70.0,51.5,34.3,37.0,Not Ready,,0%,37,,,,,,,,,,,,,,
ENT-010,Rustic Clay Works,Micro A,N,Y,,15.0,10.0,10.0,15.0,15.0,10.0,56.3,30.0,0.0,10.0,30.0,15.0,N/A,N/A,N/A,N/A,12.5,26.4,23.3,N/A,10.0,10.0,10.0,10.0,10.0,65.0,0.0,65.0,42.3,20.7,21.8,Not Ready,,0%,22,,,,,,,,,,,,,,`;

const CSV_ASSESSMENT_INPUTS = `"Enterprise ID","Enterprise Name (auto)","Tier (auto)","Manual Tier Override","TIER USED (auto)","E1 Carbon Input: Reduction %","E1 Evidence","E2 Material Input: % Sustainable","E2 Evidence","E3 Circularity Input: Condition","E3 Evidence","E4 Water Input: Reduction %","E4 Evidence","E5 Pollution Input: Condition","E5 Evidence","E6 Packaging Input: Condition","E6 Evidence","S1 Employment Input: Worker Count","S1 Evidence","S2 Gender Input: % Women","S2 Evidence","Women-Led Bonus (Y/N)","S3 Wages Input: Wage Ratio","S3 Evidence","S4 Health Input: Condition","S4 Evidence","G1 Legal Input: Checklist 0-100","G1 Evidence","G2 Ethics Input: Condition","G2 Evidence","G3 Sourcing Input: Checklist 0-100","G3 Evidence","Cultural Pillar Applies? (auto)","C1 Craft Input: Condition","C1 Evidence","C2 Skill/GI Input: Condition","C2 Evidence","C3 Climate Input: Condition","C3 Evidence","R1 Env Mgmt Input: Condition","R1 Evidence","R2 Social Mgmt Input: Condition","R2 Evidence","R3 Gov Mgmt Input: Condition","R3 Evidence","R4 Certs Input: Condition","R4 Evidence","RK1 Regulatory Deductions (0-100)","RK1 Notes","RK2 Data Reliability (auto)","RK3 Material Deductions (0-100)","RK3 Notes"
ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,,Micro B,Micro B,,None/Proxy,,None/Proxy,Recyclable + take-back,Self-Reported,,None/Proxy,Non-toxic production,Third-Party Verified,Recyclable packaging,Self-Reported,18.0,Self-Reported,83.0,Self-Reported,Y,1.05,None/Proxy,Strong H&S practices,Third-Party Verified,100,Third-Party Verified,Auditable governance system,Third-Party Verified,55,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Systematic and verified,Third-Party Verified,Systematic and verified,Third-Party Verified,Systematic and verified,Third-Party Verified,Comprehensive certification portfolio,Third-Party Verified,0,GST and Udyam self-declared compliant; no active proceedings per SAQ. Udyam number outstanding — request before go-live.,20,5,Named vendor categories + locations (18 partners) confirmed via 2022 Livelihood Report — fair payment documentation still not independently confirmed. Historical evidence; currency not reconfirmed for 2026.
ENT-002,UKHI India Private Limited,,Small,Small,23.0,Self-Reported,,None/Proxy,Compostable / Upcyclable,Third-Party Verified,,None/Proxy,Mostly safe inputs,Third-Party Verified,Plastic-free packaging,Third-Party Verified,68.0,Self-Reported,37.0,Self-Reported,Y,1.05,Self-Reported,Strong H&S practices,Third-Party Verified,100,Third-Party Verified,Documented ethics process,Third-Party Verified,55,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Systematic and verified,Third-Party Verified,Systematic and verified,Third-Party Verified,Systematic and verified,Third-Party Verified,Comprehensive certification portfolio,Third-Party Verified,0,"GST, Udyam, CPCB EPR all compliant per SAQ. No active proceedings, no product safety issues in last 24 months.",40,15,"Material type (PLA/PBAT, imported) and payment practice named; specific supplier company/location not disclosed. Partial deduction."
ENT-003,Kheoni Ventures Pvt Ltd,,Micro A,Micro A,,None/Proxy,,None/Proxy,Recyclable only,Self-Reported,,None/Proxy,Non-toxic production,Self-Reported,Reduced plastic,Self-Reported,15.0,Self-Reported,40.0,Self-Reported,Y,1.05,Self-Reported,Strong H&S practices,Self-Reported,90,Third-Party Verified,Documented ethics process,Self-Reported,27,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Regular and documented,Self-Reported,Regular and documented,Self-Reported,Regular and documented,Self-Reported,,None/Proxy,0,"GST and Udyam registration documents received and reviewed by Varna. No active proceedings, no product safety issues per SAQ.",0,25,"Explicitly declined to name top 3 raw material suppliers (""Cannot disclose the names"") — a genuine traceability gap, larger deduction than Bare or UKHI."
ENT-004,Marikar Green Earth Private Limited,,Micro A,Micro A,,None/Proxy,,None/Proxy,Compostable / Upcyclable,Third-Party Verified,,None/Proxy,Non-toxic production,Self-Reported,Plastic-free packaging,Third-Party Verified,28.0,Self-Reported,29.0,Self-Reported,N,1.05,Self-Reported,Informal measures,Self-Reported,100,Third-Party Verified,No policy,Self-Reported,100,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,Regular and documented,Third-Party Verified,Multiple verified certifications,Third-Party Verified,0,"GST (Kerala), Udyam/MSME Udyog Aadhaar, FSSAI, IEC, DPIIT, PAN, AD Code and KSUM registrations all individually confirmed in the brand's Drive folder (not just self-reported). No active legal proceedings or product safety complaints per SAQ.",20,10,Named all three raw material suppliers with company and location (Double Horse–Pollachi; Yash Pakka–Ayodhya; Parisons–Trivandrum) — fuller disclosure than Bare Necessities or UKHI. Deeper tier-2/sub-supplier traceability not yet documented.
ENT-005,Greensole Footwear Pvt Ltd,,Micro A,Micro A,27.7,Self-Reported,20.0,Self-Reported,Closed-loop circular model,Self-Reported,,Self-Reported,Mostly safe inputs,Self-Reported,Plastic-free packaging,Self-Reported,10.0,Self-Reported,20.0,Self-Reported,N,1.05,Self-Reported,Basic documented system,Self-Reported,90,Third-Party Verified,No policy,Self-Reported,70,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Informal / ad hoc,Self-Reported,Regular and documented,Self-Reported,Regular and documented,Third-Party Verified,Multiple verified certifications,Self-Reported,0,"GST, Udyam, BIS on file. No active legal proceedings or product safety complaints per SAQ. RCS certification renewal in process, not yet a compliance gap.",0,20,"Slides rely on recycled PU — still a plastic-based material even though recycled, so only a partial break from plastic dependency. Raw material suppliers named only by material type and location (PU supplier–Himachal Pradesh; EVA/other supplier–Delhi), not by company name — a traceability gap comparable to UKHI's, smaller than Kheoni's, larger than Qudrat's."
ENT-006,Sundari Herbals Pvt Ltd,,Small,Small,35.0,Self-Reported,50.0,Self-Reported,Recyclable only,Self-Reported,20.0,Self-Reported,Partial substitution,Self-Reported,Recyclable packaging,Self-Reported,60.0,Self-Reported,55.0,Self-Reported,Y,1.20,Self-Reported,Basic documented system,Self-Reported,80,Self-Reported,Documented ethics process,Self-Reported,55,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Regular and documented,Self-Reported,Regular and documented,Self-Reported,Regular and documented,Self-Reported,Multiple verified certifications,Self-Reported,5,Minor administrative gaps noted.,0,20,Some raw material sourcing undocumented.
ENT-007,Green Loom Cooperative,,Micro A,Micro A,20.0,Self-Reported,40.0,Self-Reported,Recyclable only,Self-Reported,,None/Proxy,Partial substitution,Self-Reported,Reduced plastic,Self-Reported,18.0,Self-Reported,80.0,Self-Reported,Y,1.00,Self-Reported,Informal measures,Self-Reported,70,Self-Reported,Informal commitment,Self-Reported,,None/Proxy,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,1–2 basic registrations,Self-Reported,10,"Basic registration, minor gaps.",0,20,"Cooperative sourcing, informal documentation only."
ENT-008,PureLeaf Packaging Pvt Ltd,,Micro B,Micro B,15.0,None/Proxy,30.0,Self-Reported,Recyclable only,Self-Reported,,None/Proxy,Partial substitution,Self-Reported,Reduced plastic,Self-Reported,25.0,Self-Reported,28.0,Self-Reported,N,1.00,Self-Reported,Informal measures,Self-Reported,75,Self-Reported,Informal commitment,Self-Reported,45,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,1–2 basic registrations,Self-Reported,10,"Basic registration, minor gaps.",0,25,Raw material sourcing largely undocumented.
ENT-009,Nimbus Amenities Ltd,,Small,Small,,None/Proxy,15.0,Self-Reported,Landfill product,Self-Reported,,None/Proxy,Partial substitution,Self-Reported,Conventional plastic,Self-Reported,80.0,Self-Reported,20.0,Self-Reported,N,1.00,Self-Reported,Informal measures,Self-Reported,65,Self-Reported,Informal commitment,Self-Reported,35,Self-Reported,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,Informal / ad hoc,Self-Reported,No certifications,Self-Reported,15,Legacy conventional supplier transitioning — minor compliance gaps identified.,0,30,No supplier traceability documentation provided.
ENT-010,Rustic Clay Works,,Micro A,Micro A,,None/Proxy,,None/Proxy,Landfill product,None/Proxy,,None/Proxy,Hazardous chemicals,Self-Reported,Conventional plastic,None/Proxy,12.0,Self-Reported,15.0,Self-Reported,N,0.90,Self-Reported,No system,None/Proxy,40,Self-Reported,No policy,Self-Reported,,None/Proxy,NO — Leave blank. Impact = E+S+G at 33.33% each,,,,,,,No system / no tracking,None/Proxy,No system / no tracking,None/Proxy,No system / no tracking,None/Proxy,No certifications,None/Proxy,35,ACTIVE RISK FLAG — labour law compliance gap identified during SAQ review; below-minimum-wage indication (wage ratio 0.9). Recommend Risk Review Hold pending investigation.,0,35,No sourcing documentation. Chemical inputs described as hazardous with no substitution plan.`;

const CSV_ENTERPRISE_MASTER = `"Enterprise ID","Enterprise Name","Brand Name (if different)","Evaluation Cluster","Sub-Sector (free text)",District,State,"NDMA Climate Risk Zone","Is Craft-Led (Y/N)","Is Material Innovation (Y/N)","Is Women-Led (Y/N)","Is Cooperative or SHG (Y/N)","Udyam Number",GSTIN,"Year Established","Annual Turnover Range (₹ Cr)","Employee Count","Years in Operation (auto)","Active Status",Notes,"Shipping Origin Port"
ENT-001,Bare Necessities Zero Waste Solutions Pvt. Ltd.,Bare Necessities,Climate Innovation,"Personal care — zero-waste FMCG (bathroom amenities, spa & wellness, guest amenities)",Bengaluru,Karnataka,LOW (unverified — pending NDMA cross-check),N,Y,Y,N,PENDING — Udyam confirmed by supplier (Y) but number not supplied in SAQ,"PENDING — value on file (U74993KA2019PTC127626) is the CIN, not GSTIN. Request correct GSTIN.",2019,3–10 Cr,18,7,Under Review,"B Corp Certified (first Indian FMCG brand). Founding narrative cites 2016; formal registration (Q1.3) cites 2019 — flagged for clarification. Certificates on file: ISO 9001 (QMS), ISO 14001 (EMS), ISO 45001 (OH&S), ISO 22716 (Cosmetic GMP), HACCP, PETA (cruelty-free), DPIIT, Import-Export License, Certificate of Incorporation, GST, Trade Licence, Supplier Code of Conduct.",Chennai (assumed nearest major port to Bengaluru — confirm actual dispatch port with supplier)
ENT-002,UKHI India Private Limited,UKHI,Material Innovation,"Compostable packaging and food-service disposables (cutlery, packaging) — agri-residue biopolymer (EcoGran, LCAR technology)",Faridabad,Haryana,LOW (unverified — pending NDMA cross-check),N,Y,Y,N,UDYAM-DL-03-0007936,06AAFCI1677K1ZB,2019,10–100 Cr,68,7,Under Review,"EcoGran (CPCB-certified compostable biopolymer from agri-residue) formally inaugurated at Vigyan Bhawan, World Environment Day, by Secretary DST. Incubated at IIT Mandi Catalyst, ICAR, NSRCEL IIM Bangalore. Recognised by Fashion for Good (Netherlands) and IIP Packathon Award. Commercial manufacturing launched Aug 2025. Carbon footprint calculation explicitly stated as ""in process"" (3.2f) — not yet available. Certificates on file: ISO 9001, ISO 14001, ISO 17088 (compostability), FSSAI, Halal, CPCB EPR Registration, CIPET compostable film test report (IS/ISO 17088:2021), Udyam, GST, ESI, MOA, Certificate of Incorporation.","Nhava Sheva/JNPT or Mundra (assumed — nearest major port to Faridabad, Haryana; confirm actual dispatch port with supplier)"
ENT-003,Kheoni Ventures Pvt Ltd,Kheoni,Material Innovation,"Natural wellness — bathroom amenities, spa & wellness, skincare, haircare",Indore,Madhya Pradesh,LOW (unverified — pending NDMA cross-check),N,Y,Y,N,UDYAM-MP-23-0025711,23AAKCK1231A1ZB,2023,Up to 3 Cr,15,3,Under Review,"NO SUPPORTING EVIDENCE OR CERTIFICATES RECEIVED AS OF THIS ASSESSMENT — all fields below are self-reported from SAQ only, unverified. Explicitly holds zero environmental or social certifications (SAQ 3.6, 4.7, 7.5 all ""None at the moment""). Self-reported carbon figure (7.7 tCO2e/year) has no named methodology, verifier, or uploaded report. GST/Udyam document links were pasted into the SAQ (5.9, 7.8) but not yet reviewed by Varna. Refused to name top 3 raw material suppliers (5.5: ""Cannot disclose the names"") — a real traceability gap. Craft claim (handcrafted mango-wood packaging on ""selected products"") assessed as NOT craft-led for scoring purposes: no GI tag, no Pehchaan Card, no Craftmark, no production video/tool photos provided, and enterprise itself states products are ""not based on a traditional Indian craft form."" Forest restoration initiative (Central India, 60+ community families) is a strong narrative but currently unverified by any third party. Product Line Sheet not yet received.",Mumbai/JNPT or Mundra (assumed — Indore is landlocked; confirm actual dispatch route with supplier)
ENT-004,Marikar Green Earth Private Limited,Qudrat,Material Innovation,"Disposable tableware and packaging — agri-residue based (rice husk, rice straw, sugarcane bagasse) alternatives to single-use plastic",Trivandrum,Kerala,LOW (unverified — pending NDMA cross-check),N,Y,N,N,UDYAM-KL-12-0020579,32AAOCM0595M1Z0,2020,Up to 3 Cr,28,6,Under Review,"Agricultural-waste-to-tableware manufacturer (rice husk, rice straw, sugarcane bagasse) displacing single-use plastic disposables; pivoted from the founders' family Royal Enfield dealership business. SAQ self-reports zero environmental/social certifications (3.6, 4.7 both ""None at the moment"") and no LCA, carbon footprint, or water-footprint measurement — but the brand's Drive folder shows real third-party product testing not reflected in those SAQ answers, confirmed both by the earlier certificate table and a direct listing of the Drive folder: FSSAI Registration, an RH-line Biodegradability Test, an RH Food Contact test, an RH USFDA compliance document, and an SB (sugarcane bagasse line) Food Contact & Heavy Metal test — five independent, document-confirmed items across the two product lines, not one. UPDATE (post-document-review): the actual RH Biodegradability Test report (CSIR-NIIST, ISO 14855-2:2018, sample S1(RH+GG)-01) has now been read in full — it explicitly identifies the material as ""Rice bran based biodegradable tableware"" (not Rice Husk, as the file naming had suggested); result was 99.67% biodegradation in 100 days, clearing the ASTM D6954 threshold, with clean eco-toxicity results. The ""RH USFDA"" document has also been read in full: it is an SGS India lab test (not a USFDA certificate) confirming Pentachlorophenol (PCP) was Not Detected per US FDA regulation 21 CFR 178.3800, for tableware exported to the US via Amazon — genuine and third-party, but a single narrow food-safety parameter, not a broad USFDA certification as the filename implied. The FSSAI Registration has also been read in full: valid, Reg. No. 21324131000927, issued 03-09-2024, valid to 02-09-2029 — but filed under the ""Registration"" tier (turnover under Rs 12 lakh/year) as a Distributor, not the ""License"" tier as a Manufacturer; worth confirming with Qudrat whether their manufacturing activity requires the higher FSSAI tier. The RH Food Contact test and SB Food Contact & Heavy Metal test remain unconfirmed by document content (Drive-listing only, not yet read). Not women-led (SAQ 1.11: No) — differs from Bare Necessities, UKHI, and Kheoni, all of which are women-led. No written ethics or sourcing policy (5.7: ""nothing written currently""), but — unlike Kheoni — named all three raw material suppliers with company and location (Double Horse–Pollachi; Yash Pakka–Ayodhya; Parisons–Trivandrum). Legal/registration set: GST (Kerala), Udyam/MSME Udyog Aadhaar, FSSAI, Import-Export License (IEC), DPIIT, Certificate of Incorporation, PAN, AD Code, Kerala Startup Mission (KSUM) recognition — all individually confirmed in the brand's Drive folder listing, not just claimed. G1 (Legal Compliance) scored 100/100 on this basis: GST✓, Udyam✓, no active proceedings✓, labour-law documentation✓ (written agreements, above-minimum wage, ESI legitimately exempt below the threshold), and FSSAI as a real, confirmed product certification. R4 (Certifications) was initially upgraded to ""Comprehensive certification portfolio"" on the strength of FSSAI, a US FDA compliance document, and four independent lab test reports across two product lines, plus the eight-document statutory set. CORRECTION (post-document-review): downgraded to ""Multiple verified certifications"" (75/100) — of the claimed lab tests, only two have actually been read in full (the NIIST biodegradability test, and one SGS test which turned out to be a narrow PCP check rather than a broad USFDA certification); the other two (RH Food Contact, SB Food Contact & Heavy Metal) are still Drive-listing-only. ""Comprehensive"" overstated a set that is genuinely strong but not yet fully verified end-to-end. Electricity tracked only via bill, not formally recorded; environmental/worker-policy changes described as informal and undocumented. GI tag status uncertain (6.4: ""not sure — please check""). CORRECTION (post-review): G1 was initially entered as 95/100 with no documented reason for the 5-point deduction — corrected to 100/100, since every checklist component (GST, Udyam, no proceedings, labour law, product cert) checks out. G3 (Responsible Sourcing) was initially entered as 40/100, which directly contradicted this same file's own narrative describing Qudrat's supplier disclosure as ""a relative strength"" — the checklist components (named suppliers with company name, city for each, no illegal-sourcing flags, confirmed on-time-or-early payment) support full marks; corrected to 100/100. The evidence tier for both remains Self-Reported/Third-Party Verified as originally set — only the raw checklist numbers were wrong, not the evidence tagging.","Kochi/Cochin Port (assumed nearest major container port to Trivandrum, Kerala; confirm actual dispatch port with supplier)"
ENT-005,Greensole Footwear Pvt Ltd,Greensole,Material Innovation,"In-room amenities — yoga mats and slides made from upcycled/recycled materials (recycled shoe dust, coffee waste, recycled PU)",Navi Mumbai,Maharashtra,LOW (unverified — pending NDMA cross-check),N,Y,N,N,UDYAM-MH-33-0676558,27AAFCG9757J1ZY,2015,Up to 3 Cr,10,11,Under Review,"Founded 2015 by two athletes to extend the usable life of discarded shoes; now runs two arms — a for-profit retail line (yoga mats and slides for hospitality, the subject of this assessment) and the Greensole Foundation (upcycling old shoes into slippers for children, 1M+ beneficiaries claimed). TIER FLAG: turnover (up to ₹3 Cr) and headcount (10) both place this at Micro A, but the enterprise is 11 years old (2015–2026) — well past Micro A's usual 0–3 year band. Scored as Micro A on the strength of the two hard financial/headcount criteria; flagging the age mismatch rather than silently resolving it. Product-level PCF data supplied directly by the brand (not yet independently verified — a formal LCA and carbon audit were promised within a month as of the SAQ, 3.2b): Yoga Mat 3.95 kgCO2e/unit vs a 5.80 kgCO2e/unit conventional-Asia baseline (31.9% lower); Slides 0.77 kgCO2e/unit vs 0.85 kgCO2e/unit baseline (9.4% lower). Enterprise-level E1 input (27.7%, rounded to 27.7) is a unit-weight-weighted average of the two (Yoga Mat 1.1kg, Slides 0.25kg) rather than a flat average — the heavier product is weighted more heavily since it carries proportionally more material/production footprint. This is a placeholder methodology pending real order-volume data; once Greensole has actual orders, this should switch to a revenue- or unit-sold-weighted figure. Water: SAQ 3.1 states 'very little or no water used' and 3.2 confirms no reduction action taken yet; the person separately supplied a measured 1,500 litres/month figure, but with no conventional-process baseline to compare it against, so no water-reduction % can be scored yet. Chemicals: uses adhesives/bonding agents and preservatives, described as 'mostly safe, natural inputs — very little or nothing harmful' (not claimed non-toxic). Not women-led (SAQ 1.11: No) — 2 of 10 employees are women (20%). ESI not applicable (below the employee threshold). Certificates on file per the brand's document table: PETA-Approved Vegan Certificate of Appreciation, Employee Handbook (FY 2025–26), Electricity Bill (sustainability-related); Certificate of Incorporation, GST Certificate, MSME Certificate, Employee Payslip (statutory). SAQ separately lists PETA Vegan, UDYAM, and RCS (Recycled Claim Standard — renewal in process) as certifications/schemes, and BIS certification under environmental certifications (3.6) — BIS and RCS certificate copies referenced as shared to the brand folder but not yet independently confirmed in the document table above. Scored conservatively pending that confirmation: G1 (Legal checklist) held at 90/100, not 100, withholding the 10-point product-certification credit until the BIS certificate copy is actually seen; R4 (Certifications) evidence downgraded to Self-Reported rather than Third-Party Verified for the same reason. PETA is genuinely confirmed (it appears in both the SAQ and the actual document table) and remains the one certification this assessment treats as solid. Suppliers named only generically by material and location (PU supplier — Himachal Pradesh; EVA/other materials supplier — Delhi), not by company name — weaker traceability than Qudrat's fully named supplier set, comparable to UKHI's. No written ethics/sourcing policy (SAQ 5.7: 'nothing written currently'), despite documented HR policies (7.3) and an Employee Handbook. All ten E/S input indicators for this assessment are currently Self-Reported — none Third-Party Verified yet — since the promised LCA, carbon audit, and water report had not landed as of this assessment. Expect RK2 (Data Reliability) to score low for exactly that reason, matching the framework's intended behaviour (a strong narrative without third-party evidence should not score like one with it).","Mumbai/JNPT (Navi Mumbai is the port's home district — high confidence, no assumption needed)"
ENT-006,Sundari Herbals Pvt Ltd,Sundari Herbals,Material Innovation,"Natural skincare, haircare",Jaipur,Rajasthan,LOW (unverified — pending NDMA cross-check),N,Y,Y,N,UDYAM-XX-00-1000009,90AAACX1009X1ZB,2018,10–100 Cr,60,8,Under Review,"DUMMY/ILLUSTRATIVE SUPPLIER — created for dashboard demonstration, not a real assessed enterprise.",Mumbai/JNPT (assumed)
ENT-007,Green Loom Cooperative,Green Loom,Material Innovation,Natural-dye textile cooperative,Bhuj,Gujarat,LOW (unverified — pending NDMA cross-check),N,Y,Y,N,UDYAM-XX-00-1000010,100AAACX1010X1ZB,2022,Up to 3 Cr,18,4,Under Review,"DUMMY/ILLUSTRATIVE SUPPLIER — created for dashboard demonstration, not a real assessed enterprise.",Mumbai/JNPT (assumed)
ENT-008,PureLeaf Packaging Pvt Ltd,PureLeaf,Material Innovation,Compostable packaging films,Pune,Maharashtra,LOW (unverified — pending NDMA cross-check),N,Y,N,N,UDYAM-XX-00-1000011,110AAACX1011X1ZB,2020,3–10 Cr,28,6,Under Review,"DUMMY/ILLUSTRATIVE SUPPLIER — created for dashboard demonstration, not a real assessed enterprise.",Mumbai/JNPT (assumed)
ENT-009,Nimbus Amenities Ltd,Nimbus,Material Innovation,Hotel bathroom amenities (transitioning to sustainable inputs),Ahmedabad,Gujarat,LOW (unverified — pending NDMA cross-check),N,Y,N,N,PENDING,PENDING,2016,10–100 Cr,80,10,Under Review,"DUMMY/ILLUSTRATIVE SUPPLIER — created for dashboard demonstration, not a real assessed enterprise.",Mumbai/JNPT (assumed)
ENT-010,Rustic Clay Works,Rustic Clay,Material Innovation,Handcrafted pottery-adjacent amenity ware,Khurja,Uttar Pradesh,LOW (unverified — pending NDMA cross-check),N,Y,N,N,PENDING,PENDING,2023,Up to 3 Cr,12,3,Under Review,"DUMMY/ILLUSTRATIVE SUPPLIER — created for dashboard demonstration, not a real assessed enterprise.",Mumbai/JNPT (assumed)`;

// ─── Geo & Logo Lookups for enterprise_master & scores_summary ───────────────

const SUPPLIER_METADATA = {
  'ENT-001': { logo_path: '/logos/suppliers/bare-necessities.png', lat: 12.9767936, lng: 77.590082, country: 'India', sdgs: [8, 9, 12, 16] },
  'ENT-002': { logo_path: '/logos/suppliers/ukhi.jpg', lat: 28.4031478, lng: 77.3105561, country: 'India', sdgs: [] },
  'ENT-003': { logo_path: '/logos/suppliers/kheoni.jpg', lat: 22.7203616, lng: 75.8681996, country: 'India', sdgs: [] },
  'ENT-004': { logo_path: null, lat: 8.4882267, lng: 76.947551, country: 'India', sdgs: [] },
  'ENT-005': { logo_path: null, lat: 19.0308262, lng: 73.0198537, country: 'India', sdgs: [] },
  'ENT-006': { logo_path: null, lat: 26.9124, lng: 75.7873, country: 'India', sdgs: [] },
  'ENT-007': { logo_path: null, lat: 23.2420, lng: 69.6669, country: 'India', sdgs: [] },
  'ENT-008': { logo_path: null, lat: 18.5204, lng: 73.8567, country: 'India', sdgs: [] },
  'ENT-009': { logo_path: null, lat: 23.0225, lng: 72.5714, country: 'India', sdgs: [] },
  'ENT-010': { logo_path: null, lat: 28.2560, lng: 77.8573, country: 'India', sdgs: [] },
};

const CLIENT_LOGOS = {
  'CLT-001': '/logos/clients/Astor_Dubai.jpeg',
  'CLT-002': '/logos/clients/six-senses.jpg',
  'CLT-003': '/logos/clients/dorchester-collection.png',
};

// ─── Main Execution Function ─────────────────────────────────────────────────

async function executeSeed() {
  console.log('═'.repeat(70));
  console.log('  VARNA COLLECTIVE DATABASE SEEDER');
  console.log('═'.repeat(70));

  const client = await pool.connect();

  try {
    console.log('\n[1/5] Ensuring schema prerequisites...');
    await client.query(`
      ALTER TABLE client_master ADD COLUMN IF NOT EXISTS parent_group TEXT;
      ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS parent_group TEXT;
      ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS car_km_avoided NUMERIC;
      ALTER TABLE client_summary ADD COLUMN IF NOT EXISTS trees_equivalent NUMERIC;
      ALTER TABLE supplier_detail_by_client ADD COLUMN IF NOT EXISTS parent_group TEXT;
      ALTER TABLE order_register ADD COLUMN IF NOT EXISTS parent_group TEXT;
      ALTER TABLE order_register ADD COLUMN IF NOT EXISTS car_km_avoided NUMERIC;
      ALTER TABLE order_register ADD COLUMN IF NOT EXISTS trees_equivalent NUMERIC;
    `);
    console.log('  ✓ Schema verified and updated.');

    console.log('\n[2/5] Parsing CSV datasets...');
    const parsedClientMaster = parseCSV(CSV_CLIENT_MASTER);
    const parsedCategorySpend = parseCSV(CSV_CATEGORY_SPEND_BY_CLIENT);
    const parsedSupplierDetail = parseCSV(CSV_SUPPLIER_DETAIL_BY_CLIENT);
    const parsedClientSummary = parseCSV(CSV_CLIENT_SUMMARY);
    const parsedOrderRegister = parseCSV(CSV_ORDER_REGISTER);
    const parsedProductCatalogue = parseCSV(CSV_PRODUCT_CATALOGUE);
    const parsedScoresSummary = parseCSV(CSV_SCORES_SUMMARY);
    const parsedAssessmentInputs = parseCSV(CSV_ASSESSMENT_INPUTS);
    const parsedEnterpriseMaster = parseCSV(CSV_ENTERPRISE_MASTER);

    console.log(`  ✓ 1. client_master: ${parsedClientMaster.length} rows`);
    console.log(`  ✓ 2. category_spend_by_client: ${parsedCategorySpend.length} rows`);
    console.log(`  ✓ 3. supplier_detail_by_client: ${parsedSupplierDetail.length} rows`);
    console.log(`  ✓ 4. client_summary: ${parsedClientSummary.length} rows`);
    console.log(`  ✓ 5. order_register: ${parsedOrderRegister.length} rows`);
    console.log(`  ✓ 6. product_catalogue: ${parsedProductCatalogue.length} rows`);
    console.log(`  ✓ 7. scores_summary: ${parsedScoresSummary.length} rows`);
    console.log(`  ✓ 8. assessment_inputs: ${parsedAssessmentInputs.length} rows`);
    console.log(`  ✓ 9. enterprise_master: ${parsedEnterpriseMaster.length} rows`);

    console.log('\n[3/5] Starting database transaction...');
    await client.query('BEGIN');

    console.log('\n[4/5] Truncating 9 tables (REPLACE, DO NOT APPEND)...');
    const targetTables = [
      'client_master',
      'category_spend_by_client',
      'supplier_detail_by_client',
      'client_summary',
      'order_register',
      'product_catalogue',
      'scores_summary',
      'assessment_inputs',
      'enterprise_master'
    ];

    for (const tbl of targetTables) {
      await client.query(`TRUNCATE TABLE ${tbl} RESTART IDENTITY CASCADE;`);
      console.log(`  ✓ Truncated: ${tbl}`);
    }

    // ─── INSERT 1: client_master ─────────────────────────────────────────────
    console.log('\n  Inserting into client_master...');
    for (const r of parsedClientMaster) {
      const parentGroup = str(r['Parent Group (optional — leave blank if standalone property)']);
      const clientId = str(r['Client ID']);
      await client.query(`
        INSERT INTO client_master (
          client_id, client_name, property_type, city, country,
          procurement_contact_name, contact_email, account_start_date,
          csrd_reporting_obligation, account_status, logo_path, parent_group
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        clientId,
        str(r['Client Name']),
        str(r['Property Type']),
        str(r['City']),
        str(r['Country']),
        str(r['Procurement Contact Name']),
        str(r['Contact Email']),
        parseDate(r['Account Start Date']),
        str(r['CSRD Reporting Obligation']),
        str(r['Account Status']),
        CLIENT_LOGOS[clientId] || null,
        parentGroup
      ]);
    }

    // ─── INSERT 2: category_spend_by_client ──────────────────────────────────
    console.log('  Inserting into category_spend_by_client...');
    for (const r of parsedCategorySpend) {
      await client.query(`
        INSERT INTO category_spend_by_client (
          client_id, category_name, total_spend_inr_auto, total_units_auto,
          total_co2e_kg_auto, co2e_avoided_kg_auto, pct_of_client_total_spend_auto
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        str(r['Client ID']),
        str(r['Category Name']),
        num(r['Total Spend ₹ (auto)']),
        num(r['Total Units (auto)']),
        num(r['Total CO2e kg (auto)']),
        num(r['CO2e Avoided kg (auto)']),
        num(r['% of Client Total Spend (auto)'])
      ]);
    }

    // ─── INSERT 3: supplier_detail_by_client ─────────────────────────────────
    console.log('  Inserting into supplier_detail_by_client...');
    for (const r of parsedSupplierDetail) {
      await client.query(`
        INSERT INTO supplier_detail_by_client (
          client_id, enterprise_id, enterprise_name_auto, tier_auto, evaluation_cluster_auto,
          varna_score_auto, band_auto, intersection_auto, e_score_auto, s_score_auto,
          g_score_auto, c_score_auto, readiness_auto, risk_auto, orders_inr_ytd_auto,
          units_ytd_auto, total_co2e_kg_auto, co2e_avoided_kg_auto, e1_carbon_auto,
          e2_material_pct_auto, e3_circularity_auto, e4_water_auto, e5_pollution_auto,
          e6_packaging_auto, s1_employment_auto, s2_gender_auto, s3_wages_auto,
          s4_health_auto, g1_legal_auto, g2_ethics_auto, g3_sourcing_auto,
          c1_craft_authenticity_auto, c2_skill_rarity_auto, c3_climatevulnerable_auto,
          parent_group
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35
        )
      `, [
        str(r['Client ID']),
        str(r['Enterprise ID']),
        str(r['Enterprise Name (auto)']),
        str(r['Tier (auto)']),
        str(r['Evaluation Cluster (auto)']),
        num(r['Varna Score (auto)']),
        str(r['Band (auto)']),
        str(r['Intersection (auto)']),
        num(r['E Score (auto)']),
        num(r['S Score (auto)']),
        num(r['G Score (auto)']),
        num(r['C Score (auto)']),
        num(r['Readiness (auto)']),
        num(r['Risk (auto)']),
        num(r['Orders ₹ YTD (auto)']),
        num(r['Units YTD (auto)']),
        num(r['Total CO2e kg (auto)']),
        num(r['CO2e Avoided kg (auto)']),
        num(r['E1 Carbon (auto)']),
        num(r['E2 Material% (auto)']),
        num(r['E3 Circularity (auto)']),
        num(r['E4 Water (auto)']),
        num(r['E5 Pollution (auto)']),
        num(r['E6 Packaging (auto)']),
        num(r['S1 Employment (auto)']),
        num(r['S2 Gender (auto)']),
        num(r['S3 Wages (auto)']),
        num(r['S4 Health (auto)']),
        num(r['G1 Legal (auto)']),
        num(r['G2 Ethics (auto)']),
        num(r['G3 Sourcing (auto)']),
        num(r['C1 Craft Authenticity (auto)']),
        num(r['C2 Skill Rarity (auto)']),
        str(r['C3 Climate-Vulnerable (auto)']),
        str(r['Parent Group (auto)'])
      ]);
    }

    // ─── INSERT 4: client_summary ────────────────────────────────────────────
    console.log('  Inserting into client_summary...');
    for (const r of parsedClientSummary) {
      const clientId = str(r['Client ID']);
      const isMeridian = clientId && /^CLT-0(0[4-9]|1[0-1])$/.test(clientId);
      const parentGroup = isMeridian ? 'Meridian Hospitality Group (DEMO)' : null;

      await client.query(`
        INSERT INTO client_summary (
          client_id, client_name_auto, reporting_period, total_spend_inr_auto,
          total_orders_auto, total_units_auto, total_co2e_kg_auto, total_co2e_avoided_kg_auto,
          co2_reduction_pct_auto, no_active_suppliers, avg_varna_score, avg_e_score,
          avg_s_score, avg_g_score, avg_c_score_craft_only, no_intersection_suppliers,
          no_varna_leaders, total_artisans_supported, women_workforce_pct,
          portfolio_craftled_pct, portfolio_innovation_pct, portfolio_hybrid_pct,
          avg_e1_carbon_auto, avg_e2_material_pct_auto, avg_e3_circularity_auto,
          avg_e4_water_auto, avg_e5_pollution_auto, avg_e6_packaging_auto,
          avg_s1_employment_auto, avg_s2_gender_auto, avg_s3_wages_auto,
          avg_s4_health_auto, avg_g1_legal_auto, avg_g2_ethics_auto,
          avg_g3_sourcing_auto, avg_c1_craft_auth_auto, avg_c2_skill_rarity_auto,
          avg_c3_climatevulnerable_auto, parent_group, car_km_avoided, trees_equivalent
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
        )
      `, [
        clientId,
        str(r['Client Name (auto)']),
        str(r['Reporting Period']),
        num(r['Total Spend ₹ (auto)']),
        num(r['Total Orders (auto)']),
        num(r['Total Units (auto)']),
        num(r['Total CO2e kg (auto)']),
        num(r['Total CO2e Avoided kg (auto)']),
        num(r['CO2 Reduction % (auto)']),
        num(r['No. Active Suppliers']),
        num(r['Avg Varna Score']),
        num(r['Avg E Score']),
        num(r['Avg S Score']),
        num(r['Avg G Score']),
        num(r['Avg C Score (craft only)']),
        num(r['No. Intersection Suppliers']),
        num(r['No. Varna Leaders']),
        str(r['Total Artisans Supported']),
        str(r['Women Workforce %']),
        num(r['Portfolio Craft-Led %']),
        num(r['Portfolio Innovation %']),
        num(r['Portfolio Hybrid %']),
        num(r['Avg E1 Carbon (auto)']),
        num(r['Avg E2 Material% (auto)']),
        num(r['Avg E3 Circularity (auto)']),
        num(r['Avg E4 Water (auto)']),
        num(r['Avg E5 Pollution (auto)']),
        num(r['Avg E6 Packaging (auto)']),
        num(r['Avg S1 Employment (auto)']),
        num(r['Avg S2 Gender (auto)']),
        num(r['Avg S3 Wages (auto)']),
        num(r['Avg S4 Health (auto)']),
        num(r['Avg G1 Legal (auto)']),
        num(r['Avg G2 Ethics (auto)']),
        num(r['Avg G3 Sourcing (auto)']),
        num(r['Avg C1 Craft Auth (auto)']),
        num(r['Avg C2 Skill Rarity (auto)']),
        num(r['Avg C3 Climate-Vulnerable (auto)']),
        parentGroup,
        num(r['Car Km Avoided (auto)']),
        num(r['Trees Equivalent (auto)'])
      ]);
    }

    // ─── INSERT 5: order_register ────────────────────────────────────────────
    console.log('  Inserting into order_register...');
    for (const r of parsedOrderRegister) {
      await client.query(`
        INSERT INTO order_register (
          order_id, order_line_no, order_date, client_id, client_name_auto,
          sku_id, product_name_auto, category_auto, enterprise_id_auto,
          enterprise_name_auto, varna_score_auto, band_auto, intersection_flag_auto,
          e_score_auto, s_score_auto, g_score_auto, c_score_auto, qty_units,
          unit_price_inr_auto, order_value_inr_auto, co2eunit_auto,
          conventional_baselineunit_auto, total_co2e_this_line_auto,
          conv_co2e_equivalent_auto, co2e_avoided_auto, co2_reduction_pct,
          order_status, expected_delivery, line_weight_kg, transport_kg_co2_eq_auto,
          parent_group, car_km_avoided, trees_equivalent
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33
        )
      `, [
        str(r['Order ID']),
        num(r['Order Line No.']),
        str(r['Order Date']),
        str(r['Client ID']),
        str(r['Client Name (auto)']),
        str(r['SKU ID']),
        str(r['Product Name (auto)']),
        str(r['Category (auto)']),
        str(r['Enterprise ID (auto)']),
        str(r['Enterprise Name (auto)']),
        num(r['Varna Score (auto)']),
        str(r['Band (auto)']),
        str(r['Intersection Flag (auto)']),
        num(r['E Score (auto)']),
        num(r['S Score (auto)']),
        num(r['G Score (auto)']),
        num(r['C Score (auto)']),
        num(r['Qty Units']),
        num(r['Unit Price ₹ (auto)']),
        num(r['ORDER VALUE ₹ (auto)']),
        num(r['CO2e/unit (auto)']),
        num(r['Conventional Baseline/unit (auto)']),
        num(r['Total CO2e This Line (auto)']),
        num(r['Conv CO2e Equivalent (auto)']),
        num(r['CO2e AVOIDED (auto)']),
        num(r['CO2 Reduction %']),
        str(r['Order Status']),
        str(r['Expected Delivery']),
        num(r['Line Weight (kg)']),
        num(r['Transport (Kg CO2 eq) (auto)']),
        str(r['Parent Group (auto)']),
        num(r['Car Km Avoided (auto)']),
        num(r['Trees Equivalent (auto)'])
      ]);
    }

    // ─── INSERT 6: product_catalogue ─────────────────────────────────────────
    console.log('  Inserting into product_catalogue...');
    for (const r of parsedProductCatalogue) {
      await client.query(`
        INSERT INTO product_catalogue (
          sku_id, enterprise_id, enterprise_name_auto, category_id, category_name,
          conventional_baseline_co2eunit_kg, baseline_source, product_name,
          product_description, unit_of_measure, unit_price_inr, moq,
          lead_time_days, carbon_intensity_kg_co2eunit_manual_entry,
          co2_reduction_vs_baseline_pct_auto, carbon_score_0100_auto,
          varna_score_auto_from_sheet_3, band_auto_from_sheet_3, active_yn,
          unit_weight_kg
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
      `, [
        str(r['SKU ID']),
        str(r['Enterprise ID']),
        str(r['Enterprise Name (auto)']),
        str(r['Category ID']),
        str(r['Category Name']),
        num(r['Conventional Baseline CO2e/unit kg']),
        str(r['Baseline Source']),
        str(r['Product Name']),
        str(r['Product Description']),
        str(r['Unit of Measure']),
        str(r['Unit Price ₹']),
        num(r['MOQ']),
        num(r['Lead Time (days)']),
        num(r['Carbon Intensity kg CO2e/unit (manual entry)']),
        num(r['CO2 Reduction vs Baseline % (auto)']),
        num(r['Carbon Score 0–100 (auto)']),
        num(r['Varna Score (auto from Sheet 3)']),
        str(r['Band (auto from Sheet 3)']),
        str(r['Active (Y/N)']),
        num(r['Unit Weight (kg)'])
      ]);
    }

    // ─── INSERT 7: scores_summary ────────────────────────────────────────────
    console.log('  Inserting into scores_summary...');
    for (const r of parsedScoresSummary) {
      const entId = str(r['Enterprise ID']);
      const meta = SUPPLIER_METADATA[entId] || {};
      await client.query(`
        INSERT INTO scores_summary (
          enterprise_id, enterprise_name, tier, is_craftled, is_material_innovation,
          assessment_date, e1_eff_score, e2_eff_score, e3_eff_score, e4_eff_score,
          e5_eff_score, e6_eff_score, s1_eff_score, s2_eff_score, s3_eff_score,
          s4_eff_score, g1_eff_score, g2_eff_score, g3_eff_score, c1_eff_score,
          c2_eff_score, c3_eff_score, e_pillar_score, s_pillar_score, g_pillar_score,
          c_pillar_score, r1_eff_score, r2_eff_score, r3_eff_score, r4_eff_score,
          readiness_score, rk1_score, rk2_score, rk3_score, risk_score,
          impact_score, final_varna_score, band, intersection_flag, score_confidence_pct,
          score_ceiling, environmental_narrative, social_narrative, governance_narrative,
          cultural_narrative, overall_assessor_summary, roadmap_action_1, action_1_uplift_pts,
          action_1_effort, roadmap_action_2, action_2_uplift_pts, action_2_effort,
          roadmap_action_3, action_3_uplift_pts, action_3_effort, logo_path, sdg_alignments
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
          $51, $52, $53, $54, $55, $56, $57
        )
      `, [
        entId,
        str(r['Enterprise Name']),
        str(r['Tier']),
        str(r['Is Craft-Led']),
        str(r['Is Material Innovation']),
        str(r['Assessment Date']),
        num(r['E1 Eff Score']),
        num(r['E2 Eff Score']),
        num(r['E3 Eff Score']),
        num(r['E4 Eff Score']),
        num(r['E5 Eff Score']),
        num(r['E6 Eff Score']),
        num(r['S1 Eff Score']),
        num(r['S2 Eff Score']),
        num(r['S3 Eff Score']),
        num(r['S4 Eff Score']),
        num(r['G1 Eff Score']),
        num(r['G2 Eff Score']),
        num(r['G3 Eff Score']),
        num(r['C1 Eff Score']),
        num(r['C2 Eff Score']),
        num(r['C3 Eff Score']),
        num(r['E PILLAR SCORE']),
        num(r['S PILLAR SCORE']),
        num(r['G PILLAR SCORE']),
        num(r['C PILLAR SCORE']),
        num(r['R1 Eff Score']),
        num(r['R2 Eff Score']),
        num(r['R3 Eff Score']),
        num(r['R4 Eff Score']),
        num(r['READINESS SCORE']),
        num(r['RK1 Score']),
        num(r['RK2 Score']),
        num(r['RK3 Score']),
        num(r['RISK SCORE']),
        num(r['IMPACT SCORE']),
        num(r['FINAL VARNA SCORE']),
        str(r['BAND']),
        str(r['INTERSECTION FLAG']),
        num(r['SCORE CONFIDENCE %']),
        num(r['SCORE CEILING']),
        str(r['Environmental Narrative']),
        str(r['Social Narrative']),
        str(r['Governance Narrative']),
        str(r['Cultural Narrative']),
        str(r['Overall Assessor Summary']),
        str(r['Roadmap Action 1']),
        num(r['Action 1 Uplift pts']),
        str(r['Action 1 Effort']),
        str(r['Roadmap Action 2']),
        num(r['Action 2 Uplift pts']),
        str(r['Action 2 Effort']),
        str(r['Roadmap Action 3']),
        num(r['Action 3 Uplift pts']),
        str(r['Action 3 Effort']),
        meta.logo_path || null,
        JSON.stringify(meta.sdgs || [])
      ]);
    }

    // ─── INSERT 8: assessment_inputs ─────────────────────────────────────────
    console.log('  Inserting into assessment_inputs...');
    for (const r of parsedAssessmentInputs) {
      await client.query(`
        INSERT INTO assessment_inputs (
          enterprise_id, enterprise_name_auto, tier_auto, manual_tier_override,
          tier_used_auto, e1_carbon_input_reduction_pct, e1_evidence,
          e2_material_input_pct_sustainable, e2_evidence, e3_circularity_input_condition,
          e3_evidence, e4_water_input_reduction_pct, e4_evidence,
          e5_pollution_input_condition, e5_evidence, e6_packaging_input_condition,
          e6_evidence, s1_employment_input_worker_count, s1_evidence,
          s2_gender_input_pct_women, s2_evidence, womenled_bonus_yn,
          s3_wages_input_wage_ratio, s3_evidence, s4_health_input_condition,
          s4_evidence, g1_legal_input_checklist_0100, g1_evidence,
          g2_ethics_input_condition, g2_evidence, g3_sourcing_input_checklist_0100,
          g3_evidence, cultural_pillar_applies_auto, c1_craft_input_condition,
          c1_evidence, c2_skillgi_input_condition, c2_evidence,
          c3_climate_input_condition, c3_evidence, r1_env_mgmt_input_condition,
          r1_evidence, r2_social_mgmt_input_condition, r2_evidence,
          r3_gov_mgmt_input_condition, r3_evidence, r4_certs_input_condition,
          r4_evidence, rk1_regulatory_deductions_0100, rk1_notes,
          rk2_data_reliability_auto, rk3_material_deductions_0100, rk3_notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
          $51, $52
        )
      `, [
        str(r['Enterprise ID']),
        str(r['Enterprise Name (auto)']),
        str(r['Tier (auto)']),
        str(r['Manual Tier Override']),
        str(r['TIER USED (auto)']),
        num(r['E1 Carbon Input: Reduction %']),
        str(r['E1 Evidence']),
        str(r['E2 Material Input: % Sustainable']),
        str(r['E2 Evidence']),
        str(r['E3 Circularity Input: Condition']),
        str(r['E3 Evidence']),
        str(r['E4 Water Input: Reduction %']),
        str(r['E4 Evidence']),
        str(r['E5 Pollution Input: Condition']),
        str(r['E5 Evidence']),
        str(r['E6 Packaging Input: Condition']),
        str(r['E6 Evidence']),
        num(r['S1 Employment Input: Worker Count']),
        str(r['S1 Evidence']),
        num(r['S2 Gender Input: % Women']),
        str(r['S2 Evidence']),
        str(r['Women-Led Bonus (Y/N)']),
        num(r['S3 Wages Input: Wage Ratio']),
        str(r['S3 Evidence']),
        str(r['S4 Health Input: Condition']),
        str(r['S4 Evidence']),
        num(r['G1 Legal Input: Checklist 0-100']),
        str(r['G1 Evidence']),
        str(r['G2 Ethics Input: Condition']),
        str(r['G2 Evidence']),
        num(r['G3 Sourcing Input: Checklist 0-100']),
        str(r['G3 Evidence']),
        str(r['Cultural Pillar Applies? (auto)']),
        str(r['C1 Craft Input: Condition']),
        str(r['C1 Evidence']),
        str(r['C2 Skill/GI Input: Condition']),
        str(r['C2 Evidence']),
        str(r['C3 Climate Input: Condition']),
        str(r['C3 Evidence']),
        str(r['R1 Env Mgmt Input: Condition']),
        str(r['R1 Evidence']),
        str(r['R2 Social Mgmt Input: Condition']),
        str(r['R2 Evidence']),
        str(r['R3 Gov Mgmt Input: Condition']),
        str(r['R3 Evidence']),
        str(r['R4 Certs Input: Condition']),
        str(r['R4 Evidence']),
        num(r['RK1 Regulatory Deductions (0-100)']),
        str(r['RK1 Notes']),
        num(r['RK2 Data Reliability (auto)']),
        num(r['RK3 Material Deductions (0-100)']),
        str(r['RK3 Notes'])
      ]);
    }

    // ─── INSERT 9: enterprise_master ─────────────────────────────────────────
    console.log('  Inserting into enterprise_master...');
    for (const r of parsedEnterpriseMaster) {
      const entId = str(r['Enterprise ID']);
      const meta = SUPPLIER_METADATA[entId] || {};
      await client.query(`
        INSERT INTO enterprise_master (
          enterprise_id, enterprise_name, brand_name_if_different, evaluation_cluster,
          subsector_free_text, district, state, ndma_climate_risk_zone,
          is_craftled_yn, is_material_innovation_yn, is_womenled_yn,
          is_cooperative_or_shg_yn, udyam_number, gstin, year_established,
          annual_turnover_range_inr_cr, employee_count, years_in_operation_auto,
          active_status, notes, shipping_origin_port, logo_path,
          latitude, longitude, country
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25
        )
      `, [
        entId,
        str(r['Enterprise Name']),
        str(r['Brand Name (if different)']),
        str(r['Evaluation Cluster']),
        str(r['Sub-Sector (free text)']),
        str(r['District']),
        str(r['State']),
        str(r['NDMA Climate Risk Zone']),
        str(r['Is Craft-Led (Y/N)']),
        str(r['Is Material Innovation (Y/N)']),
        str(r['Is Women-Led (Y/N)']),
        str(r['Is Cooperative or SHG (Y/N)']),
        str(r['Udyam Number']),
        str(r['GSTIN']),
        num(r['Year Established']),
        str(r['Annual Turnover Range (₹ Cr)']),
        num(r['Employee Count']),
        num(r['Years in Operation (auto)']),
        str(r['Active Status']),
        str(r['Notes']),
        str(r['Shipping Origin Port']),
        meta.logo_path || null,
        meta.lat || null,
        meta.lng || null,
        meta.country || 'India'
      ]);
    }

    await client.query('COMMIT');
    console.log('\n  ✓ Transaction committed successfully!');

    // ─── [5/5] Verify Counts ─────────────────────────────────────────────────
    console.log('\n[5/5] Verifying row counts in Supabase database...');
    for (const tbl of targetTables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${tbl}`);
      console.log(`  📊 ${tbl}: ${res.rows[0].count} rows`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('  DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(70));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR during database seed, transaction rolled back:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

executeSeed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
