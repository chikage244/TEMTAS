"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/tasks",
      label: "タスク",
      icon: "\u2611",
      active: pathname === "/tasks",
    },
    {
      href: "/",
      label: "ホーム",
      icon: "\u2302",
      active: pathname === "/",
    },
    {
      href: "/schedule",
      label: "予定",
      icon: "\uD83D\uDCC5",
      active: pathname === "/schedule",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-green-100 z-30 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all ${
              tab.active
                ? "text-green-600"
                : "text-gray-400 active:text-gray-600"
            }`}
          >
            <span className={`text-xl ${tab.active ? "scale-110" : ""}`}>
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-medium ${
                tab.active ? "font-bold" : ""
              }`}
            >
              {tab.label}
            </span>
            {tab.active && (
              <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
