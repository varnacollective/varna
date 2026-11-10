"use client";

import React from "react";
import { FormAnswers, PartnerDocument } from "./types";
import { FileUploadSlot } from "./FileUploadSlot";
import { Video, Link as LinkIcon, MessageSquare, AlertCircle, Sparkles } from "lucide-react";

interface Section6Props {
  slug: string;
  answers: FormAnswers;
  onChange: (updates: Partial<FormAnswers>) => void;
  documents: PartnerDocument[];
  onDocumentsChange: (docs: PartnerDocument[]) => void;
}

const TRADITION_AGE_OPTIONS = [
  "Less than 50 years",
  "50 to 100 years",
  "100 to 500 years",
  "More than 500 years",
  "I am not sure",
];

const GI_OPTIONS = [
  "Yes: our craft has a GI tag",
  "No: our craft does not have a GI tag",
  "I am not sure: please check for me",
];

const PEHCHAAN_OPTIONS = [
  "Yes: I or some of our artisans hold a Pehchaan Card",
  "No: we do not hold one",
  "I am not sure",
];

const CRAFTMARK_OPTIONS = [
  "Yes: we hold Craftmark certification",
  "No",
  "I am not sure what this is",
];

const CLIMATE_OPTIONS = [
  "Yes: our area regularly faces drought or severe water shortage",
  "Yes: our area regularly experiences severe flooding during monsoon",
  "Yes: we are in a cyclone or storm-prone area",
  "We experience some climate stress but not severely",
  "No significant climate challenges in our area",
  "I am not sure: please check for me",
];

const ARTISAN_LIVELIHOOD_OPTIONS = [
  "Yes: for most artisan families in our community, this craft is their main income",
  "For some families yes, for others it is additional income on top of another activity",
  "For most families this is additional income, they have another primary livelihood",
  "I am not sure",
];

export function Section6Craft({
  slug,
  answers,
  onChange,
  documents,
  onDocumentsChange,
}: Section6Props) {
  // Check if enterprise qualifies for craft section
  const descList = answers.q1_10_description || [];
  const isCraftEnterprise = descList.some(
    (d) =>
      d.includes("Craft-based production") ||
      d.includes("We combine more than one of the above")
  );

  if (!isCraftEnterprise) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
          <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
            SECTION 6: Craft and cultural heritage
          </h2>
        </div>
        <div className="inv-card p-8 text-center space-y-3 bg-[#FAF7F2]">
          <div className="w-12 h-12 rounded-full bg-[#F3EEE6] text-[#9A4A2E] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-medium text-[#1E1A16]">
            Section Not Applicable
          </h3>
          <p className="text-sm text-[#6B6259] max-w-lg mx-auto">
            Based on your answers in Section 1, your enterprise is not classified as a craft-based
            or artisan production business. You can proceed directly to Section 7.
          </p>
        </div>
      </div>
    );
  }

  const videoMode = answers.q6_9_video_mode || "upload";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-[#E7DFD3] pb-4">
        <h2 className="text-2xl font-serif text-[#1E1A16] font-normal">
          SECTION 6: Craft and cultural heritage
        </h2>
        <p className="text-sm text-[#6B6259]">
          Intro: This is where your most distinctive story lives. Take your time here.
        </p>
      </div>

      <div className="space-y-6">
        {/* 6.1 Craft Forms */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            6.1 Name(s) of the primary craft forms used in your products
          </label>
          <p className="inv-hint">
            Examples: Bagru block printing / Kutch embroidery / Dhokra metalwork / Kantha quilting /
            Bidriware / Kondapalli toys / Paithani weaving / Madhubani painting / Grass weaving etc.
          </p>
          <input
            type="text"
            value={answers.q6_1_craft_forms || ""}
            onChange={(e) => onChange({ q6_1_craft_forms: e.target.value })}
            placeholder="e.g. Bagru block printing and natural indigo dyeing"
            className="inv-input"
          />
        </div>

        {/* 6.2 Craft Tradition Age */}
        <div className="inv-card p-5 space-y-3">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            6.2 How long has this craft tradition existed in your region or community?
          </label>
          <div className="space-y-2 pt-1">
            {TRADITION_AGE_OPTIONS.map((opt) => {
              const isSelected = answers.q6_2_craft_tradition_age === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_2_craft_tradition_age: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.3 Artisan Lineage */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            6.3 How did your artisans learn this craft?
          </label>
          <p className="inv-hint">
            Describe the lineage: who they learned from, and who that person learned from if you
            know it. Example: "They learned block printing from their mother, who learned from her
            father. The technique has been in their family for four generations. Artisan mother was
            trained by a master artisan from the Chhipa community in Bagru."
          </p>
          <textarea
            rows={3}
            value={answers.q6_3_artisan_lineage || ""}
            onChange={(e) => onChange({ q6_3_artisan_lineage: e.target.value })}
            className="inv-textarea"
            placeholder="Describe intergenerational training, master artisan mentors, or apprenticeships..."
          />
        </div>

        {/* 6.4 GI Tag */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.4 Does your craft tradition have a Geographical Indication tag (GI tag)?
            </label>
            <p className="inv-hint">
              A GI tag is a government recognition that a specific craft belongs to a specific
              place. Examples: Bagru Print, Kutch Embroidery, Kanjivaram Silk, Madhubani Painting,
              Bidriware, Kondapalli Toys. Not sure? Check at ipindia.gov.in/girindia.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {GI_OPTIONS.map((opt) => {
              const isSelected = answers.q6_4_gi_tag_held === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_4_gi_tag_held: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.5 Conditional on GI Tag = Yes */}
        {answers.q6_4_gi_tag_held === "Yes: our craft has a GI tag" && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.5 Exact name of the GI tag
            </label>
            <p className="inv-hint">As it appears on the GI Registry at ipindia.gov.in</p>
            <input
              type="text"
              value={answers.q6_5_gi_tag_name || ""}
              onChange={(e) => onChange({ q6_5_gi_tag_name: e.target.value })}
              className="inv-input"
              placeholder="e.g. Bagru Hand Block Print"
            />
          </div>
        )}

        {/* 6.6 Pehchaan Card */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.6 Do you or any of your artisans hold a Pehchaan Card?
            </label>
            <p className="inv-hint">
              The Pehchaan Card is an Artisan Identity Card issued by the Government of India's
              Development Commissioner for Handicrafts. It is a free registration. Not sure? Check
              with your nearest District Industries Centre or state handicrafts board, or apply free
              at handicrafts.gov.in.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {PEHCHAAN_OPTIONS.map((opt) => {
              const isSelected = answers.q6_6_pehchaan_card === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_6_pehchaan_card: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.7 Conditional on Pehchaan Card = Yes */}
        {answers.q6_6_pehchaan_card === "Yes: I or some of our artisans hold a Pehchaan Card" && (
          <div className="inv-card p-5 space-y-2 bg-[#FAF7F2] border-[#9A4A2E]/40 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.7 Share one Pehchaan Card number for verification
            </label>
            <p className="inv-hint">
              We will verify this against the national artisan database.
            </p>
            <input
              type="text"
              value={answers.q6_7_pehchaan_card_number || ""}
              onChange={(e) => onChange({ q6_7_pehchaan_card_number: e.target.value })}
              className="inv-input"
              placeholder="e.g. RJ/JAIPUR/1234567"
            />
          </div>
        )}

        {/* 6.8 Craftmark Certification */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.8 Do you hold a Craftmark certification?
            </label>
            <p className="inv-hint">
              Craftmark is a certification issued by AIACA (All India Artisans and Craftworkers
              Welfare Association) that confirms your product is genuinely handmade. Not sure? Check
              at craftmark.in.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {CRAFTMARK_OPTIONS.map((opt) => {
              const isSelected = answers.q6_8_craftmark_cert === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_8_craftmark_cert: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.9 Production Video (Highlighted as most important) */}
        <div className="inv-card p-6 border-2 border-[#9A4A2E]/40 bg-[#FDF0EB]/20 space-y-4">
          <div className="flex items-center gap-2 text-[#9A4A2E]">
            <Video className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-serif text-lg font-medium text-[#1E1A16]">
              6.9 Production Video (Highlighted as the most important item in this section)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#3D3630]">
            <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#E7DFD3] space-y-1">
              <span className="font-bold text-[#2D7D46] uppercase">WHAT TO FILM:</span>
              <p>
                Your complete production process from start to finish. Show your tools, your hands
                working, the materials, and the finished product. 5 to 10 minutes. Phone camera is
                perfectly fine.
              </p>
            </div>
            <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#E7DFD3] space-y-1">
              <span className="font-bold text-[#C0392B] uppercase">WHAT NOT TO DO:</span>
              <p>
                Do not edit it into a polished marketing video. We need to see the actual process,
                not a highlight reel.
              </p>
            </div>
          </div>

          <div className="inv-why-box text-xs">
            <strong>Why we ask:</strong> This is how we verify that your production is genuinely
            craft-led. We are looking for the hands, the tools, the time, and the skill. This video
            is reviewed only by our assessment team and never shared publicly.
          </div>

          {/* 3 Video Options */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-[#1E1A16]">Choose how to provide the video:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChange({ q6_9_video_mode: "upload" })}
                className={`inv-btn-secondary text-xs py-2 px-3 ${videoMode === "upload" ? "border-[#9A4A2E] bg-[#FDF0EB] text-[#9A4A2E]" : ""}`}
              >
                <Video className="w-3.5 h-3.5 mr-1" />
                Upload File (up to 500 MB)
              </button>
              <button
                type="button"
                onClick={() => onChange({ q6_9_video_mode: "link" })}
                className={`inv-btn-secondary text-xs py-2 px-3 ${videoMode === "link" ? "border-[#9A4A2E] bg-[#FDF0EB] text-[#9A4A2E]" : ""}`}
              >
                <LinkIcon className="w-3.5 h-3.5 mr-1" />
                Drive / YouTube Link
              </button>
              <button
                type="button"
                onClick={() => onChange({ q6_9_video_mode: "whatsapp" })}
                className={`inv-btn-secondary text-xs py-2 px-3 ${videoMode === "whatsapp" ? "border-[#9A4A2E] bg-[#FDF0EB] text-[#9A4A2E]" : ""}`}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                Send via WhatsApp
              </button>
            </div>

            {videoMode === "upload" && (
              <FileUploadSlot
                slug={slug}
                questionRef="6.9_production_video"
                label="Upload raw video file"
                hint="Accepts MP4, MOV, WebM up to 500 MB"
                accept="video/*,.mp4,.mov,.webm,.mkv"
                documents={documents}
                onDocumentsChange={onDocumentsChange}
                allowLater={true}
              />
            )}

            {videoMode === "link" && (
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-medium text-[#1E1A16]">
                  Paste Google Drive, Dropbox, or YouTube Link
                </label>
                <input
                  type="url"
                  value={answers.q6_9_video_link || ""}
                  onChange={(e) => onChange({ q6_9_video_link: e.target.value })}
                  placeholder="https://drive.google.com/... or https://youtu.be/..."
                  className="inv-input text-xs"
                />
                <p className="text-[11px] text-[#9A8E84]">
                  Please ensure sharing permission is set to "Anyone with the link can view".
                </p>
              </div>
            )}

            {videoMode === "whatsapp" && (
              <div className="p-3 bg-[#EAF7ED] text-[#1A5C30] rounded-lg text-xs space-y-1">
                <p className="font-medium">WhatsApp Submission Selected</p>
                <p>
                  You can send your video directly to our Relationship Team at +91 98765 43210 or via
                  your dedicated manager. We have recorded your preference.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 6.10 Tool and Workspace Photos */}
        <div className="inv-card p-5 space-y-3">
          <FileUploadSlot
            slug={slug}
            questionRef="6.10_workspace_photos"
            label="6.10 Tool and workspace photos: upload 5 to 10 photos"
            hint="Examples: block printing blocks, loom, dyeing vessels, embroidery frames, kiln, whatever tools are central to your process."
            accept="image/*"
            documents={documents}
            onDocumentsChange={onDocumentsChange}
            allowLater={true}
            laterDate={answers.q6_10_photos_later || ""}
            onLaterDateChange={(date) => onChange({ q6_10_photos_later: date })}
          />
        </div>

        {/* 6.11 Climate Challenges */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.11 Is your district or area exposed to significant climate challenges?
            </label>
            <p className="inv-hint">
              Why we ask: Enterprises in climate-vulnerable communities are part of an important
              sustainability story, their livelihoods are directly connected to the climate. This is
              one of the things that makes Indian craft production distinctively valuable to global
              hospitality buyers. If you are not sure about your district's climate risk, select "I am
              not sure" and we will check for you.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {CLIMATE_OPTIONS.map((opt) => {
              const isSelected = answers.q6_11_climate_challenges === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_11_climate_challenges: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.12 Artisan Livelihood */}
        <div className="inv-card p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1E1A16]">
              6.12 Is this craft the primary livelihood for the artisan families in your community?
            </label>
            <p className="inv-hint">
              Primary livelihood means this craft is the main source of income for artisan
              families, not a side activity alongside farming or another job.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            {ARTISAN_LIVELIHOOD_OPTIONS.map((opt) => {
              const isSelected = answers.q6_12_artisan_livelihood === opt;
              return (
                <div
                  key={opt}
                  onClick={() => onChange({ q6_12_artisan_livelihood: opt })}
                  className={`inv-choice-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="inv-choice-circle">
                    {isSelected && <div className="inv-choice-circle-inner" />}
                  </div>
                  <span className="text-sm text-[#1E1A16]">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6.13 Craft Certificates Upload */}
        <div className="inv-card p-5 space-y-3">
          <FileUploadSlot
            slug={slug}
            questionRef="6.13_craft_certificates"
            label="6.13 Craft certificates and artisan documents: upload (optional)"
            hint="Upload GI tag user certificate, Pehchaan Cards, Craftmark certificate, state/national artisan award certificates, or master artisan recognition."
            documents={documents}
            onDocumentsChange={onDocumentsChange}
            allowLater={true}
            laterDate={answers.q6_13_craft_docs_later || ""}
            onLaterDateChange={(date) => onChange({ q6_13_craft_docs_later: date })}
          />
        </div>

        {/* 6.14 Craft Story */}
        <div className="inv-card p-5 space-y-2">
          <label className="block text-sm font-semibold text-[#1E1A16]">
            6.14 Tell us your craft story <span className="text-[#9A4A2E]">*</span>
          </label>
          <p className="inv-hint">
            Describe your tradition: its history in your region, what makes your technique special,
            what challenges your artisans face, and what you hope to achieve.
          </p>
          <textarea
            rows={5}
            required
            value={answers.q6_14_craft_story || ""}
            onChange={(e) => onChange({ q6_14_craft_story: e.target.value })}
            className="inv-textarea"
            placeholder="Share the cultural heritage, artisan generational stories, and preserving the craft..."
          />
        </div>
      </div>
    </div>
  );
}
