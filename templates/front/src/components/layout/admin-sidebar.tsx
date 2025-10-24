"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MENU_ADMIN_CONFIG } from "@/config/menu-admin.config";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const LOCAL_KEY = "adminSidebarOpenSections";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    const initial =
      stored && JSON.parse(stored)
        ? JSON.parse(stored)
        : Object.fromEntries(
          MENU_ADMIN_CONFIG.filter((s) => s.title && s.items?.length).map((s) => [s.title!, true])
        );
    setOpenSections(initial);
  }, []);

  useEffect(() => {
    if (Object.keys(openSections).length)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggle = (title: string) =>
    setOpenSections((p) => ({ ...p, [title]: !p[title] }));

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#254355] text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          flex flex-col bg-[#254355] text-white transition-all duration-300
          md:relative md:translate-x-0 md:h-auto md:z-0
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-64 translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:static"}
        `}
      >
        <div className="p-6 text-xl font-bold border-b border-[#1D3647] flex items-center justify-between relative">
          {!isCollapsed && <span>Goosee</span>}

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute right-4 top-5 text-white"
          >
            <X size={20} />
          </button>

          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="hidden md:block absolute -right-3 top-6 bg-[#1D3647] p-1.5 rounded-md shadow-md text-white transition"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {MENU_ADMIN_CONFIG.map((s) => {
            const isOpen = openSections[s.title!];
            const expandable = s.items?.length;
            const Icon = s.icon;

            return (
              <div key={s.title || s.name}>
                {s.name && s.path && !expandable && (
                  <Link
                    href={s.path}
                    className={`flex items-center gap-3 md:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === s.path
                        ? "bg-[#1D3647] text-white"
                        : "text-gray-300 hover:bg-[#1D3647]"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {Icon && <Icon size={18} />}
                    {!isCollapsed && s.name}
                  </Link>
                )}

                {expandable && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggle(s.title!)}
                      className={`w-full flex items-center justify-between text-xs font-semibold text-white uppercase mb-1 px-3 mt-3 hover:text-white`}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} />}
                        {!isCollapsed && s.title}
                      </div>
                      {!isCollapsed &&
                        (isOpen ? (
                          <ChevronDown size={16} className="duration-200" />
                        ) : (
                          <ChevronRight size={16} className="duration-200" />
                        ))}
                    </button>

                    {!isCollapsed && (
                      <div
                        className={`transition-all overflow-hidden duration-300 ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {s.items?.map((item) => {
                          const active =
                            pathname === item.path ||
                            pathname.startsWith(item.path ?? "");
                          const ItemIcon = item.icon;

                          return (
                            <Link
                              key={item.name}
                              href={item.path ?? "#"}
                              className={`flex items-center gap-3 px-6 py-2 rounded-md text-sm transition-colors ${
                                active
                                  ? "bg-[#1D3647] text-white"
                                  : "text-gray-300 hover:bg-[#1D3647]"
                              }`}
                              onClick={() => setIsMobileOpen(false)}
                            >
                              {ItemIcon && <ItemIcon size={16} />}
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
