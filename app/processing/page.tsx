"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionNotFound } from "@/api/errors";
import { getSessionStatus } from "@/api/session";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { Compass, Sparkles, AlertCircle, ArrowRight, RotateCw, Check } from "lucide-react";

const WARM_MESSAGES = [
  "ກຳລັງອ່ານຮູບແບບຄວາມສົນໃຈ ແລະ ທ່າແຮງຈາກຄຳຕອບ...",
  "ກຳລັງຈັດຮຽງຄຸນຄ່າ ແລະ ບັນຍາກາດການເຮັດວຽກທີ່ທ່ານມັກ...",
  "ກຳລັງເຊື່ອມໂຍງລະຫວ່າງທັກສະ ແລະ ໂອກາດຕົວຈິງໃນປະເທດລາວ...",
  "ກຳລັງສ້າງຄຳແນະນຳການທົດລອງນ້ອຍໆ (Micro-experiments)...",
  "ກຳລັງກຽມຄຳແປສຳລັບອະທິບາຍໃຫ້ຄອບຄົວເຂົ້າໃຈ (Family Bridge)...",
];

const ORBIT_DOMAINS = [
  { label: "Software & AI", color: "#2D4C3E", angle: 0 },
  { label: "Data & Analytics", color: "#8D5B28", angle: 60 },
  { label: "Hardware & IoT", color: "#7A3E2D", angle: 120 },
  { label: "Climate & Ecology", color: "#2D4C3E", angle: 180 },
  { label: "Enterprise / PM", color: "#8D5B28", angle: 240 },
  { label: "Creative Tech", color: "#7A3E2D", angle: 300 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [hasError, setHasError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isDone, setIsDone] = useState(false);
  const reportNavigationStarted = useRef<string | null>(null);

  // Cycle messages smoothly
  useEffect(() => {
    if (hasError) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % WARM_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [hasError]);

  // Gentle progress animation
  useEffect(() => {
    if (hasError) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95 && !isDone) return 95;
        if (isDone) return 100;
        return prev + 8;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [hasError, isDone]);

  // Session status polling
  useEffect(() => {
    if (!resolved) return;
    if (!sessionId) {
      router.replace("/");
      return;
    }

    let active = true;
    let timer: number | undefined;

    const openReportOnce = () => {
      if (!active || reportNavigationStarted.current === sessionId) return;
      reportNavigationStarted.current = sessionId;
      router.replace("/report");
    };

    const poll = () => {
      getSessionStatus(sessionId)
        .then(({ status }) => {
          if (!active) return;
          if (status === "completed") {
            setIsDone(true);
            setProgress(100);
            timer = window.setTimeout(() => {
              openReportOnce();
            }, 1200);
          } else if (status === "failed") {
            setHasError(true);
          } else {
            timer = window.setTimeout(poll, 1500);
          }
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (isSessionNotFound(error)) {
            clearSessionId();
            router.replace("/");
          } else {
            setHasError(true);
          }
        });
    };

    poll();

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [retryToken, router, resolved, sessionId]);

  const handleRetry = () => {
    setHasError(false);
    setProgress(15);
    setRetryToken((t) => t + 1);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Dynamic ambient backdrop light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8D5B28]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden animate-fade-in-scale">
        {hasError ? (
          /* Error State */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#7A3E2D]">
                ເກີດຂໍ້ຂັດຂ້ອງໃນການປະມວນຜົນ
              </h2>
              <p className="text-sm text-[#2D4C3E]/80 leading-relaxed">
                ຂໍອະໄພ, ບໍ່ສາມາດສັງເຄາະຜົນສະທ້ອນໄດ້ໃນຕອນນີ້. ຂໍ້ມູນຄຳຕອບຂອງທ່ານຍັງຄົງປອດໄພ.
              </p>
            </div>

            <button
              onClick={handleRetry}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.985]"
            >
              <RotateCw className="w-4 h-4" />
              <span>ລອງໃໝ່ອີກຄັ້ງ (Retry)</span>
            </button>
          </div>
        ) : (
          /* Multi-Orbit Compass Synthesis Animation */
          <div className="space-y-8 relative z-10">
            {/* Multi-orbit animation container */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Outer Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#E5E1D8] animate-orbit">
                {/* Orbital Domain Dots */}
                {ORBIT_DOMAINS.map((domain, idx) => {
                  const rad = (domain.angle * Math.PI) / 180;
                  const r = 74; // orbit radius
                  const x = 80 + r * Math.cos(rad) - 5;
                  const y = 80 + r * Math.sin(rad) - 5;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: "absolute",
                        left: `${x}px`,
                        top: `${y}px`,
                        backgroundColor: domain.color,
                      }}
                      className="w-2.5 h-2.5 rounded-full shadow-xs"
                    />
                  );
                })}
              </div>

              {/* Middle Reverse Rotating Ring */}
              <div className="absolute w-28 h-28 rounded-full border border-[#8D5B28]/25 animate-orbit-reverse" />

              {/* Center Pulsing Compass Core */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-colors duration-500 ${
                  isDone ? "bg-[#2D4C3E] text-[#F9F8F5]" : "bg-[#2D4C3E] text-[#F9F8F5]"
                }`}
              >
                {isDone ? (
                  <Check className="w-8 h-8 text-[#E5E1D8]" />
                ) : (
                  <Compass className="w-8 h-8 text-[#E5E1D8]" />
                )}
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
                <span>
                  {isDone ? "ສັງເຄາະສຳເລັດແລ້ວ!" : "ລະບົບກຳລັງສັງເຄາະຜົນສະທ້ອນ"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#2D4C3E] tracking-tight">
                {isDone ? "ພ້ອມເປີດແວ່ນແຍງສະທ້ອນຕົນເອງ" : "ກະລຸນາລໍຖ້າຈັກໜ່ອຍ..."}
              </h2>

              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 min-h-[40px] flex items-center justify-center leading-relaxed">
                {WARM_MESSAGES[currentMessageIndex]}
              </p>
            </div>

            {/* Gentle Progress Bar */}
            <div className="space-y-2">
              <div
                className="w-full h-2 rounded-full bg-[#E5E1D8] overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-[#2D4C3E] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#2D4C3E]/60">
                <span>ກຳລັງເຊື່ອມຕໍ່ຂໍ້ມູນ</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Manual Open Button if ready */}
            {isDone && (
              <button
                onClick={() => router.replace("/report")}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.985] animate-fade-in-up"
              >
                <span>ເປີດເບິ່ງບົດສະທ້ອນດຽວນີ້</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
