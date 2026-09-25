"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, BookOpen, RotateCcw } from "lucide-react";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { clearDraft } from "@/utils/draft";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { sessionId } = useSessionId();

  const handleReset = () => {
    if (window.confirm("ເລີ່ມຕົ້ນໃໝ່ທັງໝົດ ຫຼື ບໍ່? ຂໍ້ມູນທີ່ຕອບໄວ້ຈະຖືກລຶບ.")) {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      router.push("/");
      router.refresh();
    }
  };

  const isHome = pathname === "/";
  const isAssessment = pathname === "/assessment";
  const isReport = pathname === "/report" || pathname === "/processing";

  return (
    <header className="sticky top-0 z-40 bg-[#F9F8F5]/90 backdrop-blur-md subtle-border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/"
            className="group flex items-baseline space-x-2"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1E24] group-hover:text-[#2D4C3E] transition-colors">
              Next-path
            </span>
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#7D7565] font-medium pl-2 border-l border-[#DCD7CB]">
              ພື້ນທີ່ສຳຫຼວດຕົນເອງ
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              isHome
                ? "bg-[#EFECE4] text-[#1A1E24]"
                : "text-[#615B50] hover:text-[#1A1E24] hover:bg-[#F2EFE8]"
            }`}
          >
            ໜ້າຫຼັກ
          </Link>

          <Link
            href="/assessment"
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-all text-xs sm:text-sm ${
              isAssessment
                ? "bg-[#EFECE4] text-[#1A1E24]"
                : "text-[#615B50] hover:text-[#1A1E24] hover:bg-[#F2EFE8]"
            }`}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8D5B28]" />
            <span>ການສຳຫຼວດ</span>
          </Link>

          {sessionId && (
            <Link
              href="/report"
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-all text-xs sm:text-sm ${
                isReport
                  ? "bg-[#EFECE4] text-[#1A1E24]"
                  : "text-[#615B50] hover:text-[#1A1E24] hover:bg-[#F2EFE8]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D4C3E]" />
              <span>ບົດສະທ້ອນ</span>
            </Link>
          )}

          {sessionId && (
            <button
              onClick={handleReset}
              type="button"
              aria-label="ເລີ່ມການສຳຫຼວດໃໝ່ ແລະ ລຶບຄຳຕອບເກົ່າ"
              className="min-h-11 min-w-11 p-2 ml-1 text-[#888173] hover:text-[#1A1E24] rounded-lg hover:bg-[#EFECE4] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
