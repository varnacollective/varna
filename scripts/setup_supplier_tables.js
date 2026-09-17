const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres",
});

// Helper function to remove em dashes and format text naturally
function cleanEmDashes(text) {
  if (!text) return text;
  return text
    .replace(/\s*—\s*/g, ": ") // Convert em dashes between phrases to colons or clean separators
    .replace(/\s*–\s*/g, ": ") // Also clean en dashes used as separators
    .replace(/:\s*:\s*/g, ": ");
}

async function setupTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("Creating supplier schema tables...");

    // 1. supplier_assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_assessments (
        id BIGSERIAL PRIMARY KEY,
        enterprise_id TEXT UNIQUE NOT NULL,
        legal_name TEXT NOT NULL,
        brand_name TEXT,
        year_founded INTEGER,
        district TEXT,
        state TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        udyam_number TEXT,
        gstin TEXT,
        entity_type TEXT,
        is_women_owned_led BOOLEAN DEFAULT FALSE,
        is_cooperative_shg BOOLEAN DEFAULT FALSE,
        cooperative_structure TEXT,
        turnover_band TEXT,
        headcount INTEGER,
        founding_story TEXT,
        product_differentiation TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. supplier_sustainability
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_sustainability (
        id BIGSERIAL PRIMARY KEY,
        enterprise_id TEXT UNIQUE NOT NULL REFERENCES supplier_assessments(enterprise_id) ON DELETE CASCADE,
        water_main_source TEXT,
        water_reduction_actions BOOLEAN DEFAULT FALSE,
        water_reduction_description TEXT,
        water_footprint_measured BOOLEAN DEFAULT FALSE,
        water_consumption_per_unit TEXT,
        water_comparison TEXT,
        has_water_report BOOLEAN DEFAULT FALSE,
        carbon_footprint_measured BOOLEAN DEFAULT FALSE,
        carbon_footprint_value TEXT,
        carbon_verifier TEXT,
        has_carbon_report BOOLEAN DEFAULT FALSE,
        uses_chemicals BOOLEAN DEFAULT FALSE,
        chemical_types TEXT,
        chemical_policy_approach TEXT,
        environmental_certifications TEXT,
        has_lca BOOLEAN DEFAULT FALSE,
        tracks_energy BOOLEAN DEFAULT FALSE,
        energy_reduction_description TEXT,
        has_sustainability_report BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. supplier_social
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_social (
        id BIGSERIAL PRIMARY KEY,
        enterprise_id TEXT UNIQUE NOT NULL REFERENCES supplier_assessments(enterprise_id) ON DELETE CASCADE,
        women_workers_count INTEGER,
        is_primary_income_source BOOLEAN DEFAULT FALSE,
        minimum_wage_compliant BOOLEAN DEFAULT FALSE,
        esi_enrolled BOOLEAN DEFAULT FALSE,
        has_written_worker_agreements BOOLEAN DEFAULT FALSE,
        health_safety_description TEXT,
        social_certifications TEXT,
        has_social_cert_documents BOOLEAN DEFAULT FALSE,
        community_livelihood_support TEXT,
        supplier_payment_terms TEXT,
        has_ethics_policy BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. supplier_craft
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_craft (
        id BIGSERIAL PRIMARY KEY,
        enterprise_id TEXT UNIQUE NOT NULL REFERENCES supplier_assessments(enterprise_id) ON DELETE CASCADE,
        primary_craft_forms TEXT,
        craft_tradition_age TEXT,
        craft_learning_method TEXT,
        has_gi_tag BOOLEAN DEFAULT FALSE,
        gi_tag_name TEXT,
        has_pehchaan_card BOOLEAN DEFAULT FALSE,
        pehchaan_card_number TEXT,
        has_craftmark BOOLEAN DEFAULT FALSE,
        climate_exposure TEXT,
        is_artisan_primary_livelihood BOOLEAN DEFAULT FALSE,
        craft_story TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. supplier_sdgs
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_sdgs (
        id BIGSERIAL PRIMARY KEY,
        enterprise_id TEXT NOT NULL REFERENCES supplier_assessments(enterprise_id) ON DELETE CASCADE,
        sdg_number INTEGER NOT NULL,
        sdg_name TEXT NOT NULL,
        sdg_rationale TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        primary_narrative TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(enterprise_id, sdg_number)
      );
    `);

    console.log("Tables created successfully.");

    // Define Supplier Data array
    const suppliers = [
      {
        enterprise_id: "ENT-001",
        legal_name: "Bare Necessities Zero Waste Solutions Pvt. Ltd.",
        brand_name: "Bare Necessities",
        year_founded: 2019,
        district: "Bengaluru",
        state: "Karnataka",
        contact_email: "sahar@barenecessities.in",
        contact_phone: "+91 98440 28630",
        udyam_number: "UDYAM-KR-03-0142405",
        gstin: "U74993KA2019PTC127626",
        entity_type: "Sustainable materials, Responsible manufacturing",
        is_women_owned_led: true,
        is_cooperative_shg: false,
        cooperative_structure: "N.A",
        turnover_band: "₹3 crore to ₹10 crore per year",
        headcount: 18,
        founding_story: cleanEmDashes("Bare Necessities is a Certified B Corporation and one of India's leading zero-waste brands, founded in 2016 with the vision of making zero waste the norm, not the exception. We create circular alternatives to everyday personal care, home care, and lifestyle products while empowering consumers to make more conscious choices through sustainability education."),
        product_differentiation: cleanEmDashes("Unlike conventional hotel amenities that are typically packaged in single-use plastic and disposed of after one use, our products are built on circular design principles. Our soaps are wrapped in home-compostable paper instead of plastic film, our moisturisers and deodorants are housed in refillable glass jars and aluminium tins."),
        // Sustainability
        water_main_source: "Very little or no water in production",
        water_reduction_actions: true,
        water_reduction_description: cleanEmDashes("Reducing water consumption has been a key design principle at Bare Necessities. We have pioneered waterless formulations across much of our personal and home care range."),
        water_footprint_measured: false,
        water_consumption_per_unit: "N.A",
        water_comparison: "N.A",
        has_water_report: false,
        carbon_footprint_measured: true,
        carbon_footprint_value: cleanEmDashes("Total estimated emissions: 200.36 tonnes CO2e (April 2025: March 2026). Scope 1: 0 tCO2e, Scope 2: 1.84 tCO2e, Scope 3: 198.53 tCO2e."),
        carbon_verifier: "SME Climate Hub using GHG Protocol methodology",
        has_carbon_report: true,
        uses_chemicals: false,
        chemical_types: "None",
        chemical_policy_approach: cleanEmDashes("Everything we use is non-toxic and safe: we have completely moved away from harmful chemicals"),
        environmental_certifications: "ISO 14001, BCorp Certified, ISO 9001, PETA Certified",
        has_lca: false,
        tracks_energy: true,
        energy_reduction_description: cleanEmDashes("Segregate waste at source and compost all biodegradable waste generated on-site."),
        has_sustainability_report: true,
        // Social
        women_workers_count: 15,
        is_primary_income_source: true,
        minimum_wage_compliant: true,
        esi_enrolled: false,
        has_written_worker_agreements: true,
        health_safety_description: "Basic informal safety measures and protective equipment",
        social_certifications: "ISO 45001, BCorp",
        has_social_cert_documents: true,
        community_livelihood_support: cleanEmDashes("Women-led manufacturing team providing fair wages and safe working conditions for women from low-income communities."),
        supplier_payment_terms: "Always pay on time or early",
        has_ethics_policy: true,
        // Craft
        primary_craft_forms: "N/A",
        craft_tradition_age: "N/A",
        craft_learning_method: "N/A",
        has_gi_tag: false,
        gi_tag_name: "",
        has_pehchaan_card: false,
        pehchaan_card_number: "",
        has_craftmark: false,
        climate_exposure: "Moderate climate stress experienced",
        is_artisan_primary_livelihood: false,
        craft_story: "",
        // SDGs
        sdgs: [
          { number: 5, name: "Gender Equality", rationale: "women ownership, women workforce, women-led cooperatives" },
          { number: 8, name: "Decent Work and Economic Growth", rationale: "fair wages, safe conditions, dignified employment" },
          { number: 9, name: "Industry, Innovation and Infrastructure", rationale: "material innovation, circular production systems" },
          { number: 10, name: "Reduced Inequalities", rationale: "rural employment, marginalised community support" },
          { number: 11, name: "Sustainable Cities and Communities", rationale: "local procurement, community resilience" },
          { number: 12, name: "Responsible Consumption and Production", rationale: "sustainable materials, circular economy, low waste", is_primary: true, primary_narrative: cleanEmDashes("We advance SDG 12: Responsible Consumption and Production by designing everyday products using circular principles, natural formulations, refill and reuse systems, and compostable or reusable packaging that minimise waste at every stage of their lifecycle.") },
          { number: 13, name: "Climate Action", rationale: "carbon reduction, climate-resilient communities, low-impact production" },
        ]
      },
      {
        enterprise_id: "ENT-002",
        legal_name: "UKHI INDIA PRIVATE LIMITED",
        brand_name: "UKHI",
        year_founded: 2019,
        district: "Faridabad",
        state: "Haryana",
        contact_email: "paras@ukhi.com",
        contact_phone: "829957277",
        udyam_number: "UDYAM-DL-03-0007936",
        gstin: "06AAFCI1677K1ZB",
        entity_type: "Sustainable materials, Innovation-led, Responsible manufacturing",
        is_women_owned_led: true,
        is_cooperative_shg: false,
        cooperative_structure: "NA",
        turnover_band: "₹10 crore to ₹100 crore per year",
        headcount: 68,
        founding_story: cleanEmDashes("Ukhi India Pvt. Ltd. was born in 2019 out of a conviction to turn agricultural residue into a genuine, certified, compostable alternative to conventional plastic using proprietary LCAR technology."),
        product_differentiation: cleanEmDashes("Engineered compostable solutions powered by EcoGran biopolymer compounds, replacing conventional single-use plastics in hospitality."),
        // Sustainability
        water_main_source: "Very little or no water in production",
        water_reduction_actions: true,
        water_reduction_description: "Production does not require water consumption.",
        water_footprint_measured: false,
        water_consumption_per_unit: "NA",
        water_comparison: "NA",
        has_water_report: false,
        carbon_footprint_measured: false,
        carbon_footprint_value: "In process of calculation",
        carbon_verifier: "In progress",
        has_carbon_report: false,
        uses_chemicals: true,
        chemical_types: "Natural dyes, Preservatives or stabilisers",
        chemical_policy_approach: cleanEmDashes("Everything we use is non-toxic and safe: we have completely moved away from harmful chemicals"),
        environmental_certifications: "ISO 14001, CPCB, CIPET, ISO 17088, ISO 9001",
        has_lca: false,
        tracks_energy: true,
        energy_reduction_description: "Regularly record electricity usage",
        has_sustainability_report: false,
        // Social
        women_workers_count: 25,
        is_primary_income_source: true,
        minimum_wage_compliant: true,
        esi_enrolled: true,
        has_written_worker_agreements: true,
        health_safety_description: "Documented safety practices followed regularly",
        social_certifications: "ESI, ISO 9001",
        has_social_cert_documents: true,
        community_livelihood_support: "Livelihoods created for agricultural workers",
        supplier_payment_terms: "Always pay on time or early",
        has_ethics_policy: true,
        // Craft
        primary_craft_forms: "N/A",
        craft_tradition_age: "Less than 50 years",
        craft_learning_method: "N/A",
        has_gi_tag: false,
        gi_tag_name: "",
        has_pehchaan_card: false,
        pehchaan_card_number: "",
        has_craftmark: false,
        climate_exposure: "No significant climate challenges",
        is_artisan_primary_livelihood: false,
        craft_story: "",
        // SDGs
        sdgs: [
          { number: 9, name: "Industry, Innovation and Infrastructure", rationale: "material innovation, circular production systems" },
          { number: 12, name: "Responsible Consumption and Production", rationale: "sustainable materials, circular economy, low waste", is_primary: true, primary_narrative: cleanEmDashes("UKHI advances SDG 12 (Responsible Consumption and Production) by developing innovative compostable materials and packaging solutions that help businesses reduce plastic waste without compromising on performance or scalability.") },
          { number: 13, name: "Climate Action", rationale: "carbon reduction, climate-resilient communities, low-impact production" },
          { number: 14, name: "Life Below Water", rationale: "ocean-safe inputs, plastic-free, no marine pollutants" },
          { number: 15, name: "Life on Land", rationale: "biodiversity-safe sourcing, forest-friendly materials, land stewardship" },
        ]
      },
      {
        enterprise_id: "ENT-003",
        legal_name: "Kheoni Ventures Pvt Ltd",
        brand_name: "Kheoni",
        year_founded: 2023,
        district: "Indore",
        state: "Madhya Pradesh",
        contact_email: "admin@kheoni.com",
        contact_phone: "+91 9425319113",
        udyam_number: "UDYAM-MP-23-0025711",
        gstin: "23AAKCK1231A1ZB",
        entity_type: "Craft-based, Sustainable materials, Innovation-led, Responsible manufacturing",
        is_women_owned_led: true,
        is_cooperative_shg: false,
        cooperative_structure: "N.A",
        turnover_band: "Up to ₹3 crore per year",
        headcount: 15,
        founding_story: cleanEmDashes("Kheoni is a clean beauty and sustainability-led wellness brand, born from a mission to restore nature by planting a forest: now a biodiversity-awarded site in Central India."),
        product_differentiation: cleanEmDashes("Luxury wellness combined with purpose: every product is ethically sourced from forest communities and packaged using sustainable materials."),
        // Sustainability
        water_main_source: "Very little or no water in production",
        water_reduction_actions: false,
        water_reduction_description: "Actively work to minimize water usage through efficient manufacturing.",
        water_footprint_measured: false,
        water_consumption_per_unit: "N.A",
        water_comparison: "N.A",
        has_water_report: false,
        carbon_footprint_measured: true,
        carbon_footprint_value: "7.7 tons of CO2 every year",
        carbon_verifier: "Self-calculated using recognised methodology",
        has_carbon_report: true,
        uses_chemicals: false,
        chemical_types: "None",
        chemical_policy_approach: cleanEmDashes("Everything we use is non-toxic and safe: we have completely moved away from harmful chemicals"),
        environmental_certifications: "Forest Restoration Award",
        has_lca: false,
        tracks_energy: true,
        energy_reduction_description: "Formal environmental plan with targets reviewed regularly",
        has_sustainability_report: true,
        // Social
        women_workers_count: 6,
        is_primary_income_source: true,
        minimum_wage_compliant: true,
        esi_enrolled: true,
        has_written_worker_agreements: true,
        health_safety_description: "Basic informal safety measures and protective equipment",
        social_certifications: "ESI",
        has_social_cert_documents: true,
        community_livelihood_support: cleanEmDashes("Created sustainable livelihood opportunities for more than 60 forest-dependent families in Central India."),
        supplier_payment_terms: "Mostly yes: occasional delays happen",
        has_ethics_policy: true,
        // Craft
        primary_craft_forms: "Handcrafted wooden packaging",
        craft_tradition_age: "Less than 50 years",
        craft_learning_method: "Intergenerational family tradition in woodworking",
        has_gi_tag: false,
        gi_tag_name: "",
        has_pehchaan_card: false,
        pehchaan_card_number: "",
        has_craftmark: false,
        climate_exposure: "Uncertain",
        is_artisan_primary_livelihood: true,
        craft_story: cleanEmDashes("Rooted in living in harmony with nature and preserving forest-based wellness knowledge passed down through local communities."),
        // SDGs
        sdgs: [
          { number: 1, name: "No Poverty", rationale: "providing primary livelihoods, supporting low-income communities" },
          { number: 5, name: "Gender Equality", rationale: "women ownership, women workforce, women-led cooperatives" },
          { number: 11, name: "Sustainable Cities and Communities", rationale: "local procurement, community resilience" },
          { number: 12, name: "Responsible Consumption and Production", rationale: "sustainable materials, circular economy, low waste" },
          { number: 13, name: "Climate Action", rationale: "carbon reduction, climate-resilient communities, low-impact production" },
          { number: 15, name: "Life on Land", rationale: "biodiversity-safe sourcing, forest-friendly materials, land stewardship", is_primary: true, primary_narrative: cleanEmDashes("Kheoni advances SDG 15 (Life on Land) by restoring biodiversity through forest regeneration, promoting responsible sourcing, and creating sustainable livelihood opportunities for forest-dependent communities.") },
        ]
      },
      {
        enterprise_id: "ENT-004",
        legal_name: "Greensole Footwear Pvt Ltd",
        brand_name: "Greensole",
        year_founded: 2015,
        district: "Navi Mumbai",
        state: "Maharashtra",
        contact_email: "shriyans@greensole.in",
        contact_phone: "+91-9819451805",
        udyam_number: "UDYAM-MH-33-0676558",
        gstin: "27AAFCG9757J1ZY",
        entity_type: "Sustainable materials, Innovation-led",
        is_women_owned_led: false,
        is_cooperative_shg: false,
        cooperative_structure: "N.A",
        turnover_band: "Up to ₹3 crore per year",
        headcount: 10,
        founding_story: cleanEmDashes("Founded by athletes Shriyans and Ramesh to extend shoe lifespan by converting discarded footwear into comfortable slippers and circular materials."),
        product_differentiation: cleanEmDashes("Yoga mats made from recycled shoe dust and coffee waste, plus custom washable PU slippers replacing disposable hotel room slides."),
        // Sustainability
        water_main_source: "Very little or no water in production",
        water_reduction_actions: false,
        water_reduction_description: "Focus on dry production processes",
        water_footprint_measured: false,
        water_consumption_per_unit: "N.A",
        water_comparison: "N.A",
        has_water_report: false,
        carbon_footprint_measured: true,
        carbon_footprint_value: "Saves 4.8 kg CO2e emissions per pair upcycled",
        carbon_verifier: "Greensole Carbon Audit Report",
        has_carbon_report: true,
        uses_chemicals: true,
        chemical_types: "Chemical adhesives, Preservatives",
        chemical_policy_approach: cleanEmDashes("Mostly moved to safe, natural inputs: very little or nothing harmful used"),
        environmental_certifications: "BIS certification, PETA Vegan, RCS",
        has_lca: false,
        tracks_energy: true,
        energy_reduction_description: "Base level conservation and electricity tracking",
        has_sustainability_report: true,
        // Social
        women_workers_count: 2,
        is_primary_income_source: true,
        minimum_wage_compliant: true,
        esi_enrolled: false,
        has_written_worker_agreements: true,
        health_safety_description: "Documented safety practices followed regularly",
        social_certifications: "PETA Vegan",
        has_social_cert_documents: true,
        community_livelihood_support: cleanEmDashes("Donates 2% of profits to Greensole Foundation to upcycle old shoes into usable slippers for children in need."),
        supplier_payment_terms: "Always pay on time or early",
        has_ethics_policy: false,
        // Craft
        primary_craft_forms: "Circular economy footwear upcycling",
        craft_tradition_age: "New innovation aiming at circularity",
        craft_learning_method: "In-house research and material innovation",
        has_gi_tag: false,
        gi_tag_name: "",
        has_pehchaan_card: false,
        pehchaan_card_number: "",
        has_craftmark: false,
        climate_exposure: "N/A",
        is_artisan_primary_livelihood: true,
        craft_story: cleanEmDashes("Transforming discarded shoe waste into high-value circular products for hospitality and retail."),
        // SDGs
        sdgs: [
          { number: 9, name: "Industry, Innovation and Infrastructure", rationale: "material innovation, circular production systems" },
          { number: 12, name: "Responsible Consumption and Production", rationale: "sustainable materials, circular economy, low waste" },
          { number: 13, name: "Climate Action", rationale: "carbon reduction, climate-resilient communities, low-impact production", is_primary: true, primary_narrative: cleanEmDashes("SDG 13: we are replacing the use of virgin materials with alternates like recovered shoe dust, coffee, granules dust: these are replacing originally leather and synthetic materials and creating impact at scale.") },
        ]
      },
      {
        enterprise_id: "ENT-005",
        legal_name: "Marikar Green Earth Private Limited",
        brand_name: "Qudrat",
        year_founded: 2020,
        district: "Trivandrum",
        state: "Kerala",
        contact_email: "sayhello@qudrat.co.in",
        contact_phone: "9412288845",
        udyam_number: "UDYAM-KL-12-0020579",
        gstin: "32AAOCM0595M1Z0",
        entity_type: "Agricultural waste biopolymer innovation",
        is_women_owned_led: false,
        is_cooperative_shg: false,
        cooperative_structure: "3 co-founders decision making",
        turnover_band: "Up to ₹3 crore per year",
        headcount: 28,
        founding_story: cleanEmDashes("Born with the ambition to turn abundant agricultural waste (rice husk and sugarcane residue) into commercially viable, sustainable alternatives to single-use plastic."),
        product_differentiation: cleanEmDashes("Transforms agricultural waste into functional single-use disposable packaging alternatives for hotels."),
        // Sustainability
        water_main_source: "Rainwater collected and stored",
        water_reduction_actions: true,
        water_reduction_description: "Recycling of water at production facilities",
        water_footprint_measured: false,
        water_consumption_per_unit: "N.A",
        water_comparison: "N.A",
        has_water_report: false,
        carbon_footprint_measured: false,
        carbon_footprint_value: "Not measured",
        carbon_verifier: "N/A",
        has_carbon_report: false,
        uses_chemicals: false,
        chemical_types: "None",
        chemical_policy_approach: cleanEmDashes("Everything we use is non-toxic and safe: we have completely moved away from harmful chemicals"),
        environmental_certifications: "FSSAI, IEC",
        has_lca: false,
        tracks_energy: false,
        energy_reduction_description: "Check bill but do not track formally",
        has_sustainability_report: false,
        // Social
        women_workers_count: 8,
        is_primary_income_source: true,
        minimum_wage_compliant: true,
        esi_enrolled: false,
        has_written_worker_agreements: true,
        health_safety_description: "Basic informal safety measures available",
        social_certifications: "FSSAI",
        has_social_cert_documents: true,
        community_livelihood_support: "Helps farmers get better prices for rice husk and straw.",
        supplier_payment_terms: "Always pay on time or early",
        has_ethics_policy: false,
        // Craft
        primary_craft_forms: "N/A",
        craft_tradition_age: "N/A",
        craft_learning_method: "N/A",
        has_gi_tag: false,
        gi_tag_name: "",
        has_pehchaan_card: false,
        pehchaan_card_number: "",
        has_craftmark: false,
        climate_exposure: "N/A",
        is_artisan_primary_livelihood: false,
        craft_story: "",
        // SDGs
        sdgs: [
          { number: 9, name: "Industry, Innovation and Infrastructure", rationale: "material innovation, circular production systems" },
          { number: 11, name: "Sustainable Cities and Communities", rationale: "local procurement, community resilience" },
          { number: 12, name: "Responsible Consumption and Production", rationale: "sustainable materials, circular economy, low waste", is_primary: true, primary_narrative: cleanEmDashes("Qudrat transforms agricultural waste into functional alternatives to single-use plastic products, advancing responsible consumption and production.") },
        ]
      }
    ];

    for (const s of suppliers) {
      console.log(`Upserting supplier ${s.enterprise_id} (${s.brand_name})...`);

      // Ensure entry in enterprise_master
      const emCheck = await client.query('SELECT id FROM enterprise_master WHERE enterprise_id = $1', [s.enterprise_id]);
      if (emCheck.rows.length > 0) {
        await client.query(`
          UPDATE enterprise_master SET
            enterprise_name = $2,
            brand_name_if_different = $3,
            district = $4,
            state = $5,
            udyam_number = $6,
            gstin = $7,
            year_established = $8,
            annual_turnover_range_inr_cr = $9,
            employee_count = $10,
            is_womenled_yn = $11,
            is_cooperative_or_shg_yn = $12,
            notes = $13
          WHERE enterprise_id = $1;
        `, [
          s.enterprise_id,
          s.legal_name,
          s.brand_name,
          s.district,
          s.state,
          s.udyam_number,
          s.gstin,
          s.year_founded,
          s.turnover_band,
          s.headcount,
          s.is_women_owned_led ? "Y" : "N",
          s.is_cooperative_shg ? "Y" : "N",
          s.founding_story
        ]);
      } else {
        await client.query(`
          INSERT INTO enterprise_master (
            enterprise_id, enterprise_name, brand_name_if_different, district, state, udyam_number, gstin, year_established, annual_turnover_range_inr_cr, employee_count, is_womenled_yn, is_cooperative_or_shg_yn, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [
          s.enterprise_id,
          s.legal_name,
          s.brand_name,
          s.district,
          s.state,
          s.udyam_number,
          s.gstin,
          s.year_founded,
          s.turnover_band,
          s.headcount,
          s.is_women_owned_led ? "Y" : "N",
          s.is_cooperative_shg ? "Y" : "N",
          s.founding_story
        ]);
      }

      // Ensure entry in scores_summary
      const ssCheck = await client.query('SELECT id FROM scores_summary WHERE enterprise_id = $1', [s.enterprise_id]);
      if (ssCheck.rows.length > 0) {
        await client.query(`
          UPDATE scores_summary SET
            enterprise_name = $2,
            overall_assessor_summary = $3
          WHERE enterprise_id = $1;
        `, [
          s.enterprise_id,
          s.legal_name,
          s.product_differentiation
        ]);
      } else {
        await client.query(`
          INSERT INTO scores_summary (
            enterprise_id, enterprise_name, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score, overall_assessor_summary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [
          s.enterprise_id,
          s.legal_name,
          s.enterprise_id === "ENT-001" ? 78 : s.enterprise_id === "ENT-002" ? 56 : s.enterprise_id === "ENT-003" ? 64 : s.enterprise_id === "ENT-004" ? 68 : 62,
          65, 70, 60, 55,
          s.product_differentiation
        ]);
      }

      // Upsert supplier_assessments
      await client.query(`
        INSERT INTO supplier_assessments (
          enterprise_id, legal_name, brand_name, year_founded, district, state, contact_email, contact_phone, udyam_number, gstin, entity_type, is_women_owned_led, is_cooperative_shg, cooperative_structure, turnover_band, headcount, founding_story, product_differentiation
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (enterprise_id) DO UPDATE SET
          legal_name = EXCLUDED.legal_name,
          brand_name = EXCLUDED.brand_name,
          year_founded = EXCLUDED.year_founded,
          district = EXCLUDED.district,
          state = EXCLUDED.state,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          udyam_number = EXCLUDED.udyam_number,
          gstin = EXCLUDED.gstin,
          entity_type = EXCLUDED.entity_type,
          is_women_owned_led = EXCLUDED.is_women_owned_led,
          is_cooperative_shg = EXCLUDED.is_cooperative_shg,
          cooperative_structure = EXCLUDED.cooperative_structure,
          turnover_band = EXCLUDED.turnover_band,
          headcount = EXCLUDED.headcount,
          founding_story = EXCLUDED.founding_story,
          product_differentiation = EXCLUDED.product_differentiation;
      `, [
        s.enterprise_id, s.legal_name, s.brand_name, s.year_founded, s.district, s.state, s.contact_email, s.contact_phone, s.udyam_number, s.gstin, s.entity_type, s.is_women_owned_led, s.is_cooperative_shg, s.cooperative_structure, s.turnover_band, s.headcount, s.founding_story, s.product_differentiation
      ]);

      // Upsert supplier_sustainability
      await client.query(`
        INSERT INTO supplier_sustainability (
          enterprise_id, water_main_source, water_reduction_actions, water_reduction_description, water_footprint_measured, water_consumption_per_unit, water_comparison, has_water_report, carbon_footprint_measured, carbon_footprint_value, carbon_verifier, has_carbon_report, uses_chemicals, chemical_types, chemical_policy_approach, environmental_certifications, has_lca, tracks_energy, energy_reduction_description, has_sustainability_report
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (enterprise_id) DO UPDATE SET
          water_main_source = EXCLUDED.water_main_source,
          water_reduction_actions = EXCLUDED.water_reduction_actions,
          water_reduction_description = EXCLUDED.water_reduction_description,
          water_footprint_measured = EXCLUDED.water_footprint_measured,
          carbon_footprint_measured = EXCLUDED.carbon_footprint_measured,
          carbon_footprint_value = EXCLUDED.carbon_footprint_value,
          carbon_verifier = EXCLUDED.carbon_verifier,
          has_carbon_report = EXCLUDED.has_carbon_report,
          uses_chemicals = EXCLUDED.uses_chemicals,
          chemical_types = EXCLUDED.chemical_types,
          chemical_policy_approach = EXCLUDED.chemical_policy_approach,
          environmental_certifications = EXCLUDED.environmental_certifications,
          has_lca = EXCLUDED.has_lca,
          tracks_energy = EXCLUDED.tracks_energy,
          energy_reduction_description = EXCLUDED.energy_reduction_description,
          has_sustainability_report = EXCLUDED.has_sustainability_report;
      `, [
        s.enterprise_id, s.water_main_source, s.water_reduction_actions, s.water_reduction_description, s.water_footprint_measured, s.water_consumption_per_unit, s.water_comparison, s.has_water_report, s.carbon_footprint_measured, s.carbon_footprint_value, s.carbon_verifier, s.has_carbon_report, s.uses_chemicals, s.chemical_types, s.chemical_policy_approach, s.environmental_certifications, s.has_lca, s.tracks_energy, s.energy_reduction_description, s.has_sustainability_report
      ]);

      // Upsert supplier_social
      await client.query(`
        INSERT INTO supplier_social (
          enterprise_id, women_workers_count, is_primary_income_source, minimum_wage_compliant, esi_enrolled, has_written_worker_agreements, health_safety_description, social_certifications, has_social_cert_documents, community_livelihood_support, supplier_payment_terms, has_ethics_policy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (enterprise_id) DO UPDATE SET
          women_workers_count = EXCLUDED.women_workers_count,
          is_primary_income_source = EXCLUDED.is_primary_income_source,
          minimum_wage_compliant = EXCLUDED.minimum_wage_compliant,
          esi_enrolled = EXCLUDED.esi_enrolled,
          has_written_worker_agreements = EXCLUDED.has_written_worker_agreements,
          health_safety_description = EXCLUDED.health_safety_description,
          social_certifications = EXCLUDED.social_certifications,
          has_social_cert_documents = EXCLUDED.has_social_cert_documents,
          community_livelihood_support = EXCLUDED.community_livelihood_support,
          supplier_payment_terms = EXCLUDED.supplier_payment_terms,
          has_ethics_policy = EXCLUDED.has_ethics_policy;
      `, [
        s.enterprise_id, s.women_workers_count, s.is_primary_income_source, s.minimum_wage_compliant, s.esi_enrolled, s.has_written_worker_agreements, s.health_safety_description, s.social_certifications, s.has_social_cert_documents, s.community_livelihood_support, s.supplier_payment_terms, s.has_ethics_policy
      ]);

      // Upsert supplier_craft
      await client.query(`
        INSERT INTO supplier_craft (
          enterprise_id, primary_craft_forms, craft_tradition_age, craft_learning_method, has_gi_tag, gi_tag_name, has_pehchaan_card, pehchaan_card_number, has_craftmark, climate_exposure, is_artisan_primary_livelihood, craft_story
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (enterprise_id) DO UPDATE SET
          primary_craft_forms = EXCLUDED.primary_craft_forms,
          craft_tradition_age = EXCLUDED.craft_tradition_age,
          craft_learning_method = EXCLUDED.craft_learning_method,
          has_gi_tag = EXCLUDED.has_gi_tag,
          gi_tag_name = EXCLUDED.gi_tag_name,
          has_pehchaan_card = EXCLUDED.has_pehchaan_card,
          pehchaan_card_number = EXCLUDED.pehchaan_card_number,
          has_craftmark = EXCLUDED.has_craftmark,
          climate_exposure = EXCLUDED.climate_exposure,
          is_artisan_primary_livelihood = EXCLUDED.is_artisan_primary_livelihood,
          craft_story = EXCLUDED.craft_story;
      `, [
        s.enterprise_id, s.primary_craft_forms, s.craft_tradition_age, s.craft_learning_method, s.has_gi_tag, s.gi_tag_name, s.has_pehchaan_card, s.pehchaan_card_number, s.has_craftmark, s.climate_exposure, s.is_artisan_primary_livelihood, s.craft_story
      ]);

      // Upsert supplier_sdgs
      for (const sdg of s.sdgs) {
        await client.query(`
          INSERT INTO supplier_sdgs (
            enterprise_id, sdg_number, sdg_name, sdg_rationale, is_primary, primary_narrative
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (enterprise_id, sdg_number) DO UPDATE SET
            sdg_name = EXCLUDED.sdg_name,
            sdg_rationale = EXCLUDED.sdg_rationale,
            is_primary = EXCLUDED.is_primary,
            primary_narrative = EXCLUDED.primary_narrative;
        `, [
          s.enterprise_id,
          sdg.number,
          sdg.name,
          sdg.rationale,
          sdg.is_primary || false,
          sdg.primary_narrative || null
        ]);
      }
    }

    await client.query('COMMIT');
    console.log("Database schema setup and supplier seeding completed successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error setting up database tables:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupTables();
