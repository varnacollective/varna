export interface PartnerInvitation {
  id: string;
  slug: string;
  supplier_id?: string | null;
  client_id?: string | null;
  enterprise_name: string;
  brand_name?: string | null;
  contact_person: string;
  contact_email: string;
  phone?: string | null;
  state?: string | null;
  category?: string | null;
  personal_note?: string | null;
  validity_days: number;
  status: 'pending' | 'sent' | 'delivered' | 'accepted' | 'registration_completed' | 'submitted' | 'expired' | 'declined' | 'bounced' | string;
  invitation_url?: string | null;
  sent_at?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface PartnerDocument {
  id: string;
  invitation_id: string;
  question_ref?: string | null;
  file_path: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  storage_bucket: string;
  status: 'uploaded' | 'flagged' | 'verified' | 'rejected' | 'expired' | 'missing_info' | 'awaiting_verification' | 'approved' | 're_upload_requested' | string;
  uploaded_at: string;
}

export interface SupplierRow {
  name: string;
  location: string;
  supplies: string;
  isSelfSourced?: boolean;
}

export interface FormAnswers {
  // Section 1
  q1_1_legal_name?: string;
  q1_2_brand_name?: string;
  q1_3_year_founded?: number | string;
  q1_4_district?: string;
  q1_5_state?: string;
  q1_6_email?: string;
  q1_7_phone?: string;
  q1_8_udyam?: string;
  q1_9_gstin?: string;
  q1_10_description?: string[];
  q1_11_women_owned?: string;
  q1_12_cooperative?: string;
  q1_13_cooperative_desc?: string;
  q1_14_turnover?: string;
  q1_15_workers_count?: number | string;
  q1_16_founding_story?: string;
  q1_17_differentiation?: string;

  // Section 2
  q2_1_products_overview?: string;

  // Section 3
  q3_1_water_source?: string;
  q3_2_water_reduction_action?: string;
  q3_2a_water_reduction_desc?: string;
  q3_2b_water_measured?: string;
  q3_2c_water_consumption_per_unit?: string;
  q3_2d_water_comparison?: string;
  q3_2e_water_report_later?: string;
  q3_2f_carbon_footprint_done?: string;
  q3_2g_carbon_footprint_val?: string;
  q3_2h_carbon_footprint_verifier?: string;
  q3_2i_carbon_report_later?: string;
  q3_3_uses_chemicals?: string;
  q3_4_chemicals_list?: string[];
  q3_4_chemicals_other?: string;
  q3_5_chemical_approach?: string;
  q3_6_environmental_certs?: string[];
  q3_6_certs_other?: string;
  q3_6a_lca_done?: string;
  q3_6c_lca_later?: string;
  q3_7_env_certs_later?: string;

  // Section 4
  q4_1_women_workers_count?: number | string;
  q4_2_primary_income_source?: string;
  q4_3_minimum_wage?: string;
  q4_4_esi_enrolled?: string;
  q4_5_written_agreements?: string;
  q4_6_health_safety?: string;
  q4_7_social_certs?: string[];
  q4_7_certs_other?: string;
  q4_8_social_docs_later?: string;
  q4_9_community_support?: string;

  // Section 5
  q5_1_gst_registered?: string;
  q5_2_udyam_registered?: string;
  q5_3_legal_cases?: string;
  q5_3a_legal_cases_desc?: string;
  q5_4_product_recalls?: string;
  q5_4a_product_recalls_desc?: string;
  q5_5_top_suppliers?: SupplierRow[];
  q5_6_pay_suppliers_on_time?: string;
  q5_7_ethics_policy?: string;
  q5_8_ethics_policy_later?: string;
  q5_9_gst_later?: string;
  q5_9_udyam_later?: string;

  // Section 6 (Conditional)
  q6_1_craft_forms?: string;
  q6_2_craft_tradition_age?: string;
  q6_3_artisan_lineage?: string;
  q6_4_gi_tag_held?: string;
  q6_5_gi_tag_name?: string;
  q6_6_pehchaan_card?: string;
  q6_7_pehchaan_card_number?: string;
  q6_8_craftmark_cert?: string;
  q6_9_video_mode?: 'upload' | 'link' | 'whatsapp';
  q6_9_video_link?: string;
  q6_10_photos_later?: string;
  q6_11_climate_challenges?: string;
  q6_12_artisan_livelihood?: string;
  q6_13_craft_docs_later?: string;
  q6_14_craft_story?: string;

  // Section 7
  q7_1_track_energy?: string;
  q7_2_environmental_changes?: string;
  q7_2a_changes_desc?: string;
  q7_2b_sustainability_report?: string;
  q7_3_worker_policies?: string;
  q7_4_supplier_consideration?: string;
  q7_5_all_certifications?: string;
  q7_6_sdgs?: string[];
  q7_7_sdg_contribution_sentence?: string;
  q7_8_certs_later?: string;
  q7_final_notes?: string;

  // Any additional key/value
  [key: string]: any;
}
