"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, RotateCcw, HeartHandshake, Sparkles } from "lucide-react";
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
  const isFeedback = pathname === "/feedback";

  return (
    <header className="sticky top-0 z-40 bg-[#F9F8F5]/90 backdrop-blur-md border-b border-[#E5E1D8] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <Link
          href="/"
          className="flex items-center gap-3 text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8D5B28] rounded-lg p-1"
          aria-label="Next-path ໜ້າຫຼັກ"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center shadow-xs transition-transform group-hover:rotate-12 duration-300">
            <Compass className="w-5 h-5 text-[#E5E1D8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xl tracking-tight text-[#2D4C3E]">Next-path</span>
              <span className="text-xs text-[#8D5B28] font-medium hidden sm:inline">· ເວັບໄຊສຳຫຼວດຕົນເອງ</span>
            </div>
            <p className="text-xs text-[#2D4C3E]/70 line-clamp-1">ສຳລັບໄວໜຸ່ມລາວ (Lao Youth)</p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="ເມນູຫຼັກ">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer ${
              isHome
                ? "font-semibold text-[#2D4C3E] bg-[#E5E1D8]/70"
                : "text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30"
            }`}
          >
            ໜ້າຫຼັກ
          </Link>

          <Link
            href="/assessment"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
              isAssessment
                ? "font-semibold text-[#2D4C3E] bg-[#E5E1D8]/70"
                : "text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#8D5B28]" />
            <span>ການສຳຫຼວດ</span>
          </Link>

          {sessionId && (
            <Link
              href="/report"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                isReport
                  ? "font-semibold text-[#2D4C3E] bg-[#E5E1D8]/70"
                  : "text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
              <span>ພາບລວມ</span>
            </Link>
          )}

          <Link
            href="/feedback"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              isFeedback
                ? "font-semibold text-[#2D4C3E] bg-[#E5E1D8]/70"
                : "text-[#2D4C3E]/80 hover:text-[#2D4C3E] hover:bg-[#E5E1D8]/30"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#7A3E2D]" />
            <span>ຕິຊົມ</span>
          </Link>

          {sessionId && (
            <button
              onClick={handleReset}
              type="button"
              aria-label="ເລີ່ມການສຳຫຼວດໃໝ່ ແລະ ລຶບຄຳຕອບເກົ່າ"
              title="ເລີ່ມຕົ້ນໃໝ່"
              className="p-2 text-[#888173] hover:text-[#2D4C3E] rounded-lg hover:bg-[#EFECE4] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {!isAssessment && pathname !== "/processing" && (
            <Link
              href="/introduction"
              className="ml-1 sm:ml-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#2D4C3E] text-[#F9F8F5] hover:bg-[#233c31] transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
            >
              ເລີ່ມສຳຫຼວດ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
