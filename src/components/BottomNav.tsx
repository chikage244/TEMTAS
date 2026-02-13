"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/tasks",
      label: "タスク",
      icon: "/icon-task.png",
      isImage: true,
      active: pathname === "/tasks",
    },
    {
      href: "/",
      label: "ホーム",
      icon: "\u2302",
      isImage: false,
      active: pathname === "/",
    },
    {
      href: "/schedule",
      label: "予定",
      icon: "/icon-schedule.png",
      isImage: true,
      active: pathname === "/schedule",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#e8dcc8] z-30">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all ${
              tab.active
                ? "text-[#8b6b3d]"
                : "text-[#c4b89a] active:text-[#a0845c]"
            }`}
          >
            {tab.isImage ? (
              <Image
                src={tab.icon}
                alt={tab.label}
                width={24}
                height={24}
                className={`w-6 h-6 rounded-md ${tab.active ? "scale-110" : "opacity-60"} transition-all`}
              />
            ) : (
              <span className={`text-xl ${tab.active ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
            )}
            <span
              className={`text-[10px] ${
                tab.active ? "font-bold" : "font-medium"
              }`}
            >
              {tab.label}
            </span>
            {tab.active && (
              <div className="w-1 h-1 bg-[#a0845c] rounded-full mt-0.5" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
