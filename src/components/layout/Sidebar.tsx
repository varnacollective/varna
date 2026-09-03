"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Leaf,
  Network,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "suppliers", label: "Suppliers", icon: Store },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "impact", label: "Impact", icon: Leaf },
  { id: "algorithm", label: "Framework", icon: Network },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SidebarProps) {
  usePathname();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-8 justify-between z-50 bg-[#2F3C52] dark:bg-[#1C1E22] border-r border-[#6F848F]/25 text-[#D8CFB8] shadow-2xl selection:bg-[#7A3F1E] selection:text-[#D8CFB8]"
    >
      {/* Top Logo */}
      <div className="flex flex-col items-center w-full px-2">
        <img src="/logo-light.svg" alt="Varna Collective" className="block dark:hidden h-12 w-auto object-contain" />
        <img src="/logo-dark.svg" alt="Varna Collective" className="hidden dark:block h-12 w-auto object-contain" />
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col items-center gap-2 w-full px-2 mt-8 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center
                w-full py-3.5 transition-all duration-200
                group rounded-none border-y border-transparent cursor-pointer
                ${
                  isActive
                    ? "bg-[#D8CFB8]/15 text-[#D8CFB8] border-l-2 border-l-[#738678]"
                    : "text-[#D8CFB8]/60 hover:text-[#D8CFB8] hover:bg-[#D8CFB8]/5"
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5 mb-1 text-inherit" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] tracking-widest font-sans font-light uppercase">
                {item.label}
              </span>

              {/* Tooltip */}
              <div className="
                absolute left-full ml-3
                px-3 py-1.5 rounded-none
                bg-[#222326] text-[#D8CFB8] border border-[#6F848F]/40
                text-[10px] font-sans tracking-widest uppercase whitespace-nowrap
                opacity-0 group-hover:opacity-100
                -translate-x-1 group-hover:translate-x-0
                transition-all duration-200
                pointer-events-none z-50 shadow-xl
              ">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Exit / Logout — Brand alert tone (Deep Clay), no generic red */}
      <div className="w-full px-2">
        <button
          onClick={onLogout}
          className="
            flex flex-col items-center justify-center
            w-full py-4 transition-all duration-200 cursor-pointer
            text-[#D8CFB8]/60 hover:text-[#7A3F1E] hover:bg-[#7A3F1E]/10
          "
          title="Exit Session"
        >
          <LogOut className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest font-sans font-light uppercase">Exit</span>
        </button>
      </div>
    </motion.aside>
  );
}
