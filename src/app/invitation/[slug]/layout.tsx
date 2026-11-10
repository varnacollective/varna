import React from "react";
import Image from "next/image";
import "../invitation-styles.css";

export const metadata = {
  title: "Varna Enterprise Assessment | Partner Onboarding",
  description: "Proprietary Sustainability Standard framework for partner evaluation.",
};

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="inv-root min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E1A16] antialiased">
      {/* Top Header */}
      <header className="w-full border-b border-[#E7DFD3] bg-[#FFFFFF]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Varnawordmark.svg"
              alt="Varna Collective"
              width={130}
              height={32}
              priority
              className="h-7 w-auto"
            />
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-[#6B6259] font-medium border-l border-[#E7DFD3] pl-3 py-0.5">
              Enterprise Assessment
            </span>
          </div>

          <div className="text-xs text-[#6B6259] flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2D7D46]" />
            <span>Secure Partner Portal</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="w-full border-t border-[#E7DFD3] bg-[#FAF7F2] py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6259]">
          <p className="font-serif italic text-sm text-[#1E1A16]">
            Varna Collective · Evidence to Impact
          </p>
          <p>
            Confidential partner assessment · Need help? Contact{" "}
            <a
              href="mailto:yuvraj@varnacollective.com"
              className="text-[#9A4A2E] hover:underline font-medium"
            >
              yuvraj@varnacollective.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
