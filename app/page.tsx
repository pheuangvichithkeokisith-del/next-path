"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSession } from "@/api/session";
import { clearSessionId, storeSessionId, useSessionId } from "@/hooks/useSession";
import { clearDraft, restoreDraft } from "@/utils/draft";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Compass,
  Layers,
  HelpCircle,
  Lightbulb,
  Heart,
  Target,
  Route,
  RotateCcw
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { sessionId } = useSessionId();
  const [hasExistingDraft, setHasExistingDraft] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = restoreDraft(window.localStorage);
      if (Object.keys(draft).length > 0) {
        setHasExistingDraft(true);
      }
    }
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      if (!sessionId) {
        const { session_id } = await createSession();
        storeSessionId(session_id);
      }
      router.push("/assessment");
    } catch {
      const fallbackId = `session-${Date.now()}`;
      storeSessionId(fallbackId);
      router.push("/assessment");
    } finally {
      setStarting(false);
    }
  };

  const handleStartFresh = async () => {
    if (hasExistingDraft && !window.confirm("ເລີ່ມຕົ້ນໃໝ່ທັງໝົດ? ຂໍ້ມູນເກົ່າທີ່ຕອບໄວ້ຈະຖືກລຶບ.")) {
      return;
    }
    setStarting(true);
    try {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      const { session_id } = await createSession();
      storeSessionId(session_id);
      router.push("/assessment");
    } catch {
      const fallbackId = `session-${Date.now()}`;
      storeSessionId(fallbackId);
      router.push("/assessment");
    } finally {
      setStarting(false);
    }
  };

  const DIMENSIONS = [
    {
      id: 1,
      titleLo: "1. ຄວາມສົນໃຈ (Interests)",
      descLo: "ສິ່ງທີ່ເຮັດແລ້ວມີຄວາມສຸກ ລືມເວລາ ແລະ ຢາກຄົ້ນຫາ",
      icon: Compass,
      color: "text-[#2D4C3E]",
      bg: "bg-[#EBF2EE]",
      count: "4 ຂໍ້"
    },
    {
      id: 2,
      titleLo: "2. ທັກສະ (Skills)",
      descLo: "ຈຸດແຂງທີ່ຄົນອື່ນຊົມเชย ແລະ ສິ່ງທີ່ເຄີຍເຮັດຈົນພູມໃຈ",
      icon: Sparkles,
      color: "text-[#8D5B28]",
      bg: "bg-[#F7EFE3]",
      count: "3 ຂໍ້"
    },
    {
      id: 3,
      titleLo: "3. ຄ່ານິຍົມ (Values)",
      descLo: "ສິ່ງທີ່ສຳຄັນທີ່ສຸດໃນການເຮັດວຽກ ແລະ ສິ່ງທີ່ຢາກໃຫ້ຄົນຈື່",
      icon: Heart,
      color: "text-[#7A3E2D]",
      bg: "bg-[#F9ECE7]",
      count: "2 ຂໍ້"
    },
    {
      id: 4,
      titleLo: "4. ຮູບແບບການເຮັດວຽກ (Work Style)",
      descLo: "ວິທີຮັບມືກັບບັນຫາ ການຕັດສິນໃຈ ແລະ ສະພາບແວດລ້ອມທີ່ເໝາະສົມ",
      icon: Layers,
      color: "text-[#3F4D5A]",
      bg: "bg-[#EAEBF0]",
      count: "4 ຂໍ້"
    },
    {
      id: 5,
      titleLo: "5. ການຮຽນ ແລະ ການຮຽນຮູ້ (Learning)",
      descLo: "ດ້ານທີ່ຢາກຮຽນຮູ້ເພີ່ມ ວິທີຮຽນທີ່ດີທີ່ສຸດ ແລະ ການສູ້ຊົນກັບຄວາມຍາກ",
      icon: Lightbulb,
      color: "text-[#2D4C3E]",
      bg: "bg-[#EBF2EE]",
      count: "5 ຂໍ້"
    },
    {
      id: 6,
      titleLo: "6. ເປົ້າໝາຍ (Goals)",
      descLo: "ພາບຕົນເອງໃນອີກ 5 ປີ ແລະ ຜົນດີທີ່ຢາກສ້າງໃຫ້ສັງຄົມ",
      icon: Target,
      color: "text-[#8D5B28]",
      bg: "bg-[#F7EFE3]",
      count: "3 ຂໍ້"
    },
    {
      id: 7,
      titleLo: "7. ຄວາມເປັນໄປໄດ້ຕົວຈິງ (Feasibility)",
      descLo: "ຂໍ້ຈຳກັດດ້ານເວລາ ສະຖານທີ່ ແລະ ຄວາມພ້ອມໃນການຍ້າຍພື້ນທີ່",
      icon: HelpCircle,
      color: "text-[#7A3E2D]",
      bg: "bg-[#F9ECE7]",
      count: "2 ຂໍ້"
    },
    {
      id: 8,
      titleLo: "8. ເສັ້ນທາງການເດີນຕໍ່ (Journey)",
      descLo: "ວິທີປັບຕົວເມື່ອບໍ່ເປັນໄປຕາມແຜນ ແລະ ຄວາມຍືດຢຸ່ນໃນອະນາຄົດ",
      icon: Route,
      color: "text-[#3F4D5A]",
      bg: "bg-[#EAEBF0]",
      count: "5 ຂໍ້"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20 max-w-5xl mx-auto">
        {/* Spatial Place Indicator */}
        <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#736856] bg-[#F1ECE1] px-3.5 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#2D4C3E]"></span>
          <span>ພື້ນທີ່ສຳຫຼວດຕົນເອງ ສຳລັບໄວໜຸ່ມລາວ (ອາຍຸ 15+)</span>
        </div>

        {/* Primary Statement */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171A1F] leading-[1.2] mb-6">
          ພື້ນທີ່ໃຫ້ເຈົ້າໄດ້ຢຸດພັກ, <br className="hidden sm:inline" />
          ເຂົ້າໃຈສິ່ງທີ່ຢູ່ພາຍໃນ, <br className="hidden sm:inline" />
          ແລະ ຄົ້ນພົບເສັ້ນທາງທີ່ຈະລອງກ້າວຕໍ່ໄປ.
        </h1>

        <p className="text-base sm:text-lg text-[#524B40] max-w-3xl leading-relaxed mb-8 font-normal">
          Next-path ຖືກສ້າງຂຶ້ນມາເພື່ອໄວໜຸ່ມທຸກຄົນ ບໍ່ວ່າເຈົ້າຈະຢູ່ແຂວງໃດ ຮຽນສາຍສາມັນ ຫຼື ສາຍອາຊີບ. ທີ່ນີ້ບໍ່ມີຄຳຕອບທີ່ຖືກຫຼືຜິດ, ບໍ່ມີຄະແນນ, ແລະ ບໍ່ມີໃຜມາກຳນົດຊີວິດຂອງເຈົ້າ. ເປັນພຽງພື້ນທີ່ທີ່ຊ່ວຍສະທ້ອນຄວາມຄິດຂອງເຈົ້າເອງອອກມາໃຫ້ຊັດເຈນຂຶ້ນ.
        </p>

        {/* Action Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-14">
          {hasExistingDraft ? (
            <>
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-6 py-3.5 rounded-xl bg-[#2D4C3E] hover:bg-[#22392F] text-white font-medium transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <span>ສຳຫຼວດຕໍ່ຈາກທີ່ຄ້າງໄວ້</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleStartFresh}
                disabled={starting}
                className="px-5 py-3.5 rounded-xl bg-white subtle-border hover:bg-[#F3EFE7] text-[#1D2229] font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#8D5B28]" />
                <span>ເລີ່ມຕົ້ນໃໝ່ທັງໝົດ</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStartFresh}
              disabled={starting}
              className="px-7 py-3.5 rounded-xl bg-[#1D2229] hover:bg-[#2D4C3E] text-white font-medium transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <span>ເລີ່ມຕົ້ນການສຳຫຼວດ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <span className="text-xs text-[#7D7565] text-center sm:text-left">
            ຕອບແບບຕໍ່ເນື່ອງ 28 ຂໍ້ · ບັນທຶກອັດຕະໂນມັດ
          </span>
        </div>

        {/* 3 Grounded Truths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 subtle-border-t">
          <div className="p-5 rounded-2xl bg-white/80 subtle-border shadow-2xs">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#1A1E24] mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D4C3E]" />
              <span>ຄວາມເປັນສ່ວນຕົວ 100%</span>
            </div>
            <p className="text-xs text-[#6A6357] leading-relaxed">
              ຄຳຕອບທັງໝົດເກັບໄວ້ໃນອຸປະກອນຂອງເຈົ້າ ບໍ່ມີການເກັບຊື່ຈິງ ຫຼື ເບີໂທລະສັບ.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 subtle-border shadow-2xs">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#1A1E24] mb-1.5">
              <Clock className="w-4 h-4 text-[#8D5B28]" />
              <span>ບໍ່ມີການຈັບເວລາ</span>
            </div>
            <p className="text-xs text-[#6A6357] leading-relaxed">
              ຄ່ອຍໆຕອບໄປຕາມຈັງຫວະຂອງເຈົ້າ. ລະບົບຈະບັນທຶກຄຳຕອບໄວ້ໃຫ້ຕະຫຼອດເວລາ.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 subtle-border shadow-2xs">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#1A1E24] mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7A3E2D]" />
              <span>ບໍ່ແມ່ນບົດສອບເສັງ</span>
            </div>
            <p className="text-xs text-[#6A6357] leading-relaxed">
              ບໍ່ມີຄະແນນຜ່ານ-ຕົກ ແລະ ບໍ່ແມ່ນການຕັດສິນ ແຕ່ເປັນແວ່ນແຍງສະທ້ອນຄວາມຄິດຂອງເຈົ້າ.
            </p>
          </div>
        </div>
      </section>

      {/* 8 Dimensions Architecture Grid */}
      <section className="bg-[#F2EFE8] py-14 sm:py-20 subtle-border-t subtle-border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#847863]">
              ໂຄງສ້າງການສຳຫຼວດ 8 ໝວດ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171A1F] mt-1.5">
              ການເດີນທາງຜ່ານ 8 ມິຕິຂອງຊີວິດ ແລະ ການຮຽນຮູ້
            </h2>
            <p className="text-sm text-[#61584A] mt-2 max-w-2xl">
              ອອກແບບມາເພື່ອໃຫ້ເຈົ້າໄດ້ຄິດເຖິງຊີວິດປະຈຳວັນ, ທັກສະ, ຄ່ານິຍົມ, ແລະ ຄວາມຍືດຢຸ່ນໃນອະນາຄົດ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((dim) => {
              const IconComp = dim.icon;
              return (
                <div
                  key={dim.id}
                  className="p-5 rounded-2xl bg-white subtle-border flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-lg ${dim.bg} flex items-center justify-center`}>
                        <IconComp className={`w-4 h-4 ${dim.color}`} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#8A8170] px-2 py-0.5 rounded bg-[#F4F1EA]">
                        {dim.count}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1A1E24] mb-1.5 leading-snug">
                      {dim.titleLo}
                    </h3>

                    <p className="text-xs text-[#5D5547] leading-relaxed">
                      {dim.descLo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest Distinction: What Next-path is and is NOT */}
      <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-7 sm:p-10 rounded-3xl bg-white subtle-border shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D4C3E] mb-2 block">
                ສິ່ງທີ່ Next-path ເປັນ
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#171A1F] mb-4">
                ພື້ນທີ່ທີ່ເປັນຂອງເຈົ້າເອງ
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#4E473B]">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4C3E] mt-2 shrink-0"></span>
                  <span>ບ່ອນໃຫ້ເຈົ້າໄດ້ຄິດເຖິງຊີວິດຂອງຕົນເອງ ໂດຍບໍ່ມີໃຜມາຕັດສິນ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4C3E] mt-2 shrink-0"></span>
                  <span>ແວ່ນແຍງທີ່ຊ່ວຍຈັດລະບຽບຄວາມຄິດ, ຄວາມມັກ ແລະ ຄວາມກັງວົນ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4C3E] mt-2 shrink-0"></span>
                  <span>ຈຸດເລີ່ມຕົ້ນສຳລັບການລອງເຮັດສິ່ງນ້ອຍໆ ແລະ ກຽມບົດສົນທະນາ</span>
                </li>
              </ul>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-[#EAE6DC] pt-6 md:pt-0 md:pl-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A4F3E] mb-2 block">
                ສິ່ງທີ່ Next-path ບໍ່ແມ່ນ
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#171A1F] mb-4">
                ບໍ່ແມ່ນການວັດຜົນ ຫຼື ບອກອະນາຄົດ
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#575043]">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A4F3E] mt-2 shrink-0"></span>
                  <span>ບໍ່ແມ່ນແບບທົດສອບບຸກຄະລິກກະພາບ (ເຊັ່ນ MBTI ຫຼື ແຍກກຸ່ມຄົນ)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A4F3E] mt-2 shrink-0"></span>
                  <span>ບໍ່ແມ່ນລະບົບບັງຄັບເລືອກອາຊີບ ຫຼື ຕັດສິນອະນາຄົດແທນເຈົ້າ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A4F3E] mt-2 shrink-0"></span>
                  <span>ບໍ່ແມ່ນ Chatbot ສົນທະນາທົ່ວໄປ ຫຼື ລະບົບປິ່ນປົວສຸຂະພາບຈິດ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom invitation */}
        <div className="mt-12 text-center">
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#2D4C3E] hover:bg-[#22392F] text-white font-medium transition-all shadow-xs cursor-pointer text-sm sm:text-base"
          >
            <span>ພ້ອມແລ້ວ, ເລີ່ມຕົ້ນກ້າວທຳອິດ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
