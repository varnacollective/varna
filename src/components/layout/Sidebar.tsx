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
      className="fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-8 justify-between z-50 bg-midnight-blue dark:bg-[#17181A] border-r border-slate-mist/20 dark:border-midnight-blue text-white dark:text-warm-stone shadow-xl selection:bg-deep-clay selection:text-warm-stone"
    >
      {/* Top Logo - Light/Dark Theme Switcher */}
      <div className="flex flex-col items-center w-full px-2">
        <img src="/logo-light.svg" alt="Varna" className="block dark:hidden h-12 w-auto object-contain" />
        <img src="/logo-dark.svg" alt="Varna" className="hidden dark:block h-12 w-auto object-contain" />
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col items-center gap-1.5 w-full px-2 mt-8 flex-1">
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
                    ? "bg-warm-stone/10 text-white dark:text-warm-stone border-l-2 border-l-sage-mineral"
                    : "text-white/60 dark:text-warm-stone/60 hover:text-white dark:hover:text-warm-stone hover:bg-white/5 dark:hover:bg-warm-stone/5"
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] tracking-wider font-light uppercase">
                {item.label}
              </span>
              
              {/* Tooltip */}
              <div className="
                absolute left-full ml-3
                px-3 py-1.5 rounded-none
                bg-carbon-ink text-warm-stone border border-slate-mist/30
                text-[10px] font-sans tracking-widest uppercase whitespace-nowrap
                opacity-0 group-hover:opacity-100
                -translate-x-1 group-hover:translate-x-0
                transition-all duration-200
                pointer-events-none z-50 shadow-md
              ">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="w-full px-2">
        <button
          onClick={onLogout}
          className="
            flex flex-col items-center justify-center
            w-full py-4 transition-all duration-200 cursor-pointer
            text-white/60 dark:text-warm-stone/60 hover:text-red-400 hover:bg-red-500/10
          "
          title="Logout"
        >
          <LogOut className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[9px] tracking-wider font-light uppercase">Exit</span>
        </button>
      </div>
    </motion.aside>
  );
}
