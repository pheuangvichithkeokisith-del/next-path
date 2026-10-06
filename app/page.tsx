"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionStatus } from "@/api/session";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { clearDraft, restoreDraft } from "@/utils/draft";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  RotateCcw,
  Cpu,
  Brain,
  Palette,
  Leaf,
  ChevronDown,
  HeartHandshake,
  CheckCircle2,
  Flame,
} from "lucide-react";

interface DemoArchetype {
  id: string;
  nameLo: string;
  enTitle: string;
  icon: typeof Cpu;
  accent: string;
  descriptionLo: string;
  traits: { label: string; score: number }[];
  realJobLo: string;
  whyFit: string;
}

const DEMO_ARCHETYPES: DemoArchetype[] = [
  {
    id: "applied-tech",
    nameLo: "ນັກປະດິດ & ໂປຣແກຣມນັກພັດທະນາ",
    enTitle: "Applied Tech & IoT Prototyper",
    icon: Cpu,
    accent: "#2D4C3E",
    descriptionLo: "ມັກເອົາຄວາມຮູ້ດ້ານໂປຣແກຣມມາສ້າງສິ່ງຂອງທີ່ຈັບຕ້ອງໄດ້ ຫຼື ແກ້ໄຂບັນຫາແທ້ໃນຊີວິດ",
    traits: [
      { label: "Hands-on (ລົງມືສ້າງ)", score: 92 },
      { label: "Coding / Tech", score: 88 },
      { label: "Creative Problem Solving", score: 85 },
      { label: "Analytical Thinking", score: 78 },
    ],
    realJobLo: "Hardware/IoT Specialist, Web/Mobile App Developer, Embedded Systems Engineer",
    whyFit: "ເໝາະສຳລັບຄົນທີ່ບໍ່ມັກນັ່ງທ່ອງຈຳທິດສະດີລ້າໆ ແຕ່ມັກທົດລອງສ້າງລະບົບທີ່ໃຊ້ວຽກໄດ້ແທ້",
  },
  {
    id: "data-science",
    nameLo: "ນັກວິເຄາະຂໍ້ມູນ & ວິທະຍາສາດຄອມ",
    enTitle: "Data Science & Technical Analytics",
    icon: Brain,
    accent: "#8D5B28",
    descriptionLo: "ມັກຄົ້ນຫາແບບແຜນ (Pattern) ທີ່ເຊື່ອງຢູ່ໃນຂໍ້ມູນໃຫຍ່ໆ ເພື່ອຕອບຄຳຖາມທີ່ຊັບຊ້ອນ",
    traits: [
      { label: "Analytical Thinking", score: 95 },
      { label: "Data & Statistics", score: 90 },
      { label: "System Logic", score: 86 },
      { label: "Business Insight", score: 72 },
    ],
    realJobLo: "Data Analyst ໃນທະນາຄານ/ໂທລະຄົມ, Business Intelligence, Machine Learning Engineer",
    whyFit: "ເໝາະສຳລັບຜູ້ທີ່ມັກໃຊ້ເຫດຜົນ ແລະ ຕົວເລກໃນການຕັດສິນໃຈແທນຄວາມຮູ້ສຶກ",
  },
  {
    id: "creative-problem-solving",
    nameLo: "ນັກຄິດ & ສະຖາປັດຕະຍະກຳນະວັດຕະກຳ",
    enTitle: "Product & System Architect",
    icon: Palette,
    accent: "#7A3E2D",
    descriptionLo: "ເຊື່ອມໂຍງລະຫວ່າງຄວາມຕ້ອງການຂອງຄົນ (UX) ກັບຄວາມເປັນໄປໄດ້ທາງເທັກໂນໂລຊີ",
    traits: [
      { label: "Creative Innovation", score: 90 },
      { label: "System Design / UX", score: 88 },
      { label: "Communication / Empathy", score: 84 },
      { label: "Technical Grounding", score: 76 },
    ],
    realJobLo: "Product Manager, Technical UX/UI Designer, Digital Transformation Strategist",
    whyFit: "ມັກຄິດພາບລວມ ແລະ ສື່ສານກັບຄົນຫຼາກຫຼາຍສາຍງານ ເພື່ອສ້າງຜະລິດຕະພັນທີ່ໃຊ້ງ່າຍ",
  },
  {
    id: "eco-community-tech",
    nameLo: "ນັກເຕັກໂນໂລຊີຊຸມຊົນ & ສິ່ງແວດລ້ອມ",
    enTitle: "Agro-Tech & Sustainable Solutions",
    icon: Leaf,
    accent: "#2D4C3E",
    descriptionLo: "ນຳໃຊ້ເຕັກໂນໂລຊີມາພັດທະນາການກະເສດ, ພະລັງງານທົດແທນ ຫຼື ຍົກລະດັບຄຸນນະພາບຊີວິດຊຸມຊົນ",
    traits: [
      { label: "Nature & Ecology", score: 94 },
      { label: "Community Focus", score: 88 },
      { label: "Practical Innovation", score: 82 },
      { label: "Resource Management", score: 80 },
    ],
    realJobLo: "Smart Farming Specialist, Renewable Energy Planner, Eco-Tourism & Supply Chain",
    whyFit: "ເໝາະສຳລັບຜູ້ທີ່ຕ້ອງການເຫັນຜົນກະທົບຕໍ່ສັງຄົມ ແລະ ທຳມະຊາດໃນບ້ານເກີດຕົນເອງ",
  },
];

const FAQS = [
  {
    question: "ຖ້າຂ້ອຍຍັງບໍ່ຮູ້ວ່າຕົນເອງມັກຫຍັງເລີຍ ຈະຕອບໄດ້ບໍ?",
    answer: "ຕອບໄດ້ແນ່ນອນ 100%! Next-path ບໍ່ໄດ້ຖາມຫາອາຊີບໃນຝັນ ແຕ່ຖາມພຽງວ່າ 'ກິດຈະກຳແບບໃດໃນຊີວິດປະຈຳວັນທີ່ເຮັດໃຫ້ເຈົ້າຮູ້ສຶກບໍ່ອິດເມື່ອຍ' ຄຳຕອບແບບຊື່ສັດແມ່ນສິ່ງທີ່ມີຄ່າທີ່ສຸດ.",
  },
  {
    question: "ພໍ່ແມ່ຢາກໃຫ້ຮຽນຢ່າງອື່ນ ແຕ່ຂ້ອຍຢາກໄປສາຍອື່ນ ຄວນເຮັດແນວໃດ?",
    answer: "ໃນໜ້າພາບລວມ ເຮົາມີລະບົບ 'Stakeholder Translation Layer (Family Bridge)' ເຊິ່ງຊ່ວຍແປສິ່ງທີ່ເຈົ້າສົນໃຈໃຫ້ກາຍເປັນພາສາ ແລະ ມຸມມອງຄວາມໝັ້ນຄົງທີ່ພໍ່ແມ່ເຂົ້າໃຈ ແລະ ພ້ອມສະໜັບສະໜູນ.",
  },
  {
    question: "ຜົນທີ່ໄດ້ຈະຕັດສິນອະນາຄົດຂ້ອຍເລີຍບໍ?",
    answer: "ບໍ່ແມ່ນເລີຍ. Next-path ຊ່ວຍສະຫຼຸບຄວາມສາມາດ ແລະ ເປີດໃຫ້ເຫັນທິດທາງຫຼາຍທາງເລືອກ. ພ້ອມໃຫ້ 'ການທົດລອງນ້ອຍໆ (Micro-experiments)' 1-2 ຊົ່ວໂມງໃຫ້ລອງເຮັດເບິ່ງກ່ອນຕັດສິນໃຈໃຫຍ່.",
  },
  {
    question: "ຂໍ້ມູນຄຳຕອບຂອງຂ້ອຍປອດໄພແທ້ບໍ?",
    answer: "ປອດໄພທີ່ສຸດ! ພວກເຮົາບໍ່ຂໍຊື່ແທ້, ບໍ່ຂໍເບີໂທ, ບໍ່ຂໍອີເມວ. ຂໍ້ມູນຖືກນຳໃຊ້ເພື່ອສະທ້ອນຜົນໃຫ້ເຈົ້າເຫັນເທົ່ານັ້ນ ແລະ ບໍ່ມີການສົ່ງຕໍ່ໃຫ້ບຸກຄົນທີສາມ.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [hasExistingDraft, setHasExistingDraft] = useState(() => {
    if (typeof window === "undefined") return false;
    return Object.keys(restoreDraft(window.localStorage, sessionId)).length > 0;
  });
  const [selectedArchetype, setSelectedArchetype] = useState<string>(DEMO_ARCHETYPES[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const [checkedSessionId, setCheckedSessionId] = useState<string | null>(null);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);

  // A missing session is already a clean state; keep stale state from a
  // previous session from changing the landing-page actions.
  const visibleHasExistingDraft = Boolean(sessionId) && hasExistingDraft;
  const visibleSessionCheckFailed = Boolean(sessionId) && sessionCheckFailed;
  const visibleSessionCheckComplete =
    resolved && (!sessionId || (sessionCheckComplete && checkedSessionId === sessionId));

  useEffect(() => {
    if (!resolved || typeof window === "undefined") return;

    const hasAnswers = Object.keys(restoreDraft(window.localStorage, sessionId)).length > 0;
    if (!sessionId) {
      return;
    }

    getSessionStatus(sessionId)
      .then(({ status }) => {
        setSessionCheckFailed(false);
        if (status === "completed") {
          clearSessionId();
          clearDraft(window.localStorage);
          setHasExistingDraft(false);
        } else {
          setHasExistingDraft(hasAnswers);
        }
      })
      .catch(() => {
        // Do not resume a local draft when its server status cannot be confirmed.
        setSessionCheckFailed(true);
        setHasExistingDraft(false);
      })
      .finally(() => {
        setCheckedSessionId(sessionId);
        setSessionCheckComplete(true);
      });
  }, [resolved, sessionId]);

  const handleStart = async () => {
    setStarting(true);
    try {
      if (sessionId) {
        try {
          const { status } = await getSessionStatus(sessionId);
          if (status === "completed") {
            clearSessionId();
            if (typeof window !== "undefined") {
              clearDraft(window.localStorage);
            }
            router.push("/introduction");
            return;
          }
        } catch {
          clearSessionId();
          if (typeof window !== "undefined") {
            clearDraft(window.localStorage);
          }
          router.push("/introduction");
          return;
        }
        router.push("/assessment");
      } else {
        router.push("/introduction");
      }
    } catch {
      router.push("/introduction");
    } finally {
      setStarting(false);
    }
  };

  const handleStartFresh = async () => {
    const confirmMessage = visibleSessionCheckFailed
      ? "ບໍ່ສາມາດກວດສອບຮ່າງເກົ່າໄດ້. ຕ້ອງການເລີ່ມໃໝ່ ແລະ ລ້າງຂໍ້ມູນຮ່າງໃນເຄື່ອງນີ້ບໍ?"
      : "ເລີ່ມຕົ້ນໃໝ່ທັງໝົດ? ຂໍ້ມູນເກົ່າທີ່ຕອບໄວ້ຈະຖືກລຶບ.";
    if ((visibleHasExistingDraft || visibleSessionCheckFailed) && !window.confirm(confirmMessage)) {
      return;
    }
    setStarting(true);
    try {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      router.push("/introduction");
    } catch {
      router.push("/introduction");
    } finally {
      setStarting(false);
    }
  };

  const activeDemo = DEMO_ARCHETYPES.find((a) => a.id === selectedArchetype) || DEMO_ARCHETYPES[0];

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 relative">
        {/* Animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#8D5B28]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        {/* Soft tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5E1D8]/70 border border-[#E5E1D8] text-[#2D4C3E] text-xs sm:text-sm font-medium mb-6 shadow-2xs">
          <Compass className="w-4 h-4 text-[#8D5B28]" />
          <span>ເວັບໄຊສຳຫຼວດຕົນເອງສຳລັບໄວໜຸ່ມລາວ (ອາຍຸ 15 ປີຂຶ້ນໄປ)</span>
        </div>

        {/* Headline with curved underline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D4C3E] tracking-tight leading-tight sm:leading-snug mb-6">
          ຄົ້ນຫາເສັ້ນທາງທີ່ເປັນເຈົ້າ <br className="hidden sm:inline" />
          <span className="text-[#8D5B28] relative inline-block">
            ໂດຍບໍ່ມີຄວາມກົດດັນ
            <svg
              className="absolute -bottom-1.5 left-0 w-full text-[#8D5B28]/40"
              height="8"
              viewBox="0 0 200 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5.5C50 1.5 150 1.5 199 5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Narrative Description */}
        <p className="text-base sm:text-lg text-[#2D4C3E]/85 leading-relaxed mb-8 max-w-2xl mx-auto">
          Next-path ເປັນພື້ນທີ່ປອດໄພທີ່ຊ່ວຍໃຫ້ເຈົ້າໄດ້ຄິດທົບທວນກັບຕົນເອງ, ເຂົ້າໃຈສິ່ງທີ່ມັກ ແລະ ບໍ່ມັກ,
          ພ້ອມທັງເປີດມຸມມອງໃໝ່ໆ ກ່ຽວກັບການຮຽນ ແລະ ຊີວິດ. ທີ່ນີ້ບໍ່ແມ່ນບົດສອບເສັງ, ບໍ່ມີຄະແນນຖືກ-ຜິດ,
          ແລະ ບໍ່ມີໃຜຕັດສິນອະນາຄົດແທນເຈົ້າ.
        </p>

        {/* Call to action & Time estimate */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={visibleHasExistingDraft ? handleStart : handleStartFresh}
            disabled={starting || !visibleSessionCheckComplete}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
          >
            <span>{visibleHasExistingDraft ? "ຕອບຕໍ່ຈາກຮ່າງເກົ່າ" : "ເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ"}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {visibleHasExistingDraft && (
            <button
              onClick={handleStartFresh}
              disabled={starting}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E1D8] text-[#8D5B28] text-base font-medium hover:bg-[#F4EFEA] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.985]"
            >
              <RotateCcw className="w-4 h-4 text-[#8D5B28]" />
              <span>ເລີ່ມຕົ້ນໃໝ່ທັງໝົດ</span>
            </button>
          )}
        </div>

        {/* Time and Peace Indicator */}
        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-[#2D4C3E]/70 pt-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#8D5B28]" />
            <span>ໃຊ້ເວລາປະມານ 10 - 15 ນາທີ</span>
          </div>
          <span>•</span>
          <span>ບໍ່ຟ້າວ ຕອບສະບາຍໆ ຕາມໃຈເຈົ້າ</span>
        </div>
      </section>

      {/* Interactive Archetype Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[#8D5B28] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
                <span>ລອງສຳຜັດຕົວຢ່າງ (Interactive Preview)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D4C3E]">
                ລອງກົດເບິ່ງ 4 ຕົ້ນແບບອາຊີບຕົວຢ່າງ
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                ກົດເລືອກສາຍຕ່າງໆ ເພື່ອເບິ່ງວິທີທີ່ລະບົບ Next-path ວິເຄາະທ່າແຮງ ແລະ ຕົວຢ່າງວຽກຈິງໃນລາວ:
              </p>
            </div>
          </div>

          {/* Archetype Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
            {DEMO_ARCHETYPES.map((arch) => {
              const isSelected = selectedArchetype === arch.id;
              const IconComponent = arch.icon;
              return (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-full ${
                    isSelected
                      ? "bg-[#EBF2EE] border-[#2D4C3E] text-[#2D4C3E] shadow-2xs ring-1 ring-[#2D4C3E]"
                      : "bg-[#F9F8F5]/80 border-[#E5E1D8] hover:bg-[#F4EFEA] text-[#2D4C3E]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F9F8F5]"
                      style={{ backgroundColor: arch.accent }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#2D4C3E]" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block line-clamp-1">
                      {arch.nameLo}
                    </span>
                    <span className="text-[11px] opacity-70 block line-clamp-1">
                      {arch.enTitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Archetype Detail Display */}
          <div className="bg-[#F9F8F5] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Description & Fit */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#F9F8F5]"
                    style={{ backgroundColor: activeDemo.accent }}
                  >
                    {activeDemo.enTitle}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D4C3E]">
                  {activeDemo.nameLo}
                </h3>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/80 mt-2 leading-relaxed">
                  {activeDemo.descriptionLo}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] space-y-2">
                <span className="text-xs font-semibold text-[#8D5B28] block">
                  💡 ເປັນຫຍັງຈຶ່ງເໝາະກັບເຈົ້າ:
                </span>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/85 leading-relaxed">
                  {activeDemo.whyFit}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] space-y-2">
                <span className="text-xs font-semibold text-[#2D4C3E] block">
                  🇱🇦 ຕົວຢ່າງອາຊີບຈິງໃນຕະຫຼາດແຮງງານລາວ:
                </span>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/85 leading-relaxed">
                  {activeDemo.realJobLo}
                </p>
              </div>
            </div>

            {/* Right: Trait Breakdown Score Bars */}
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 space-y-5 shadow-2xs">
              <h4 className="font-bold text-sm text-[#2D4C3E] flex items-center justify-between">
                <span>ແຜນຜັງທັກສະ ແລະ ທ່າແຮງທີ່ໂດດເດັ່ນ</span>
                <span className="text-xs font-normal text-[#2D4C3E]/60">(ຈາກຄຳຕອບຕົວຈິງ)</span>
              </h4>

              <div className="space-y-4">
                {activeDemo.traits.map((trait, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#2D4C3E]">
                      <span>{trait.label}</span>
                      <span className="font-bold text-[#8D5B28]">{trait.score}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#E5E1D8]/70 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${trait.score}%`,
                          backgroundColor: activeDemo.accent,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E5E1D8]/60 text-[11px] text-[#2D4C3E]/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8D5B28] shrink-0" />
                <span>ເມື່ອຕອບຄົບ 28 ຂໍ້ ລະບົບຈະຄິດໄລ່ກາຟສະເພາະຕົວຂອງເຈົ້າອອກມາແບບລະອຽດ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Exploration Journey */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8D5B28] block mb-2">
            3 ຂັ້ນຕອນງ່າຍໆ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E]">
            ວິທີການເຮັດວຽກຂອງ Next-path
          </h2>
          <p className="text-xs sm:text-sm text-[#2D4C3E]/70 mt-2">
            ບໍ່ມີຄວາມຫຍຸ້ງຍາກ ທຸກຢ່າງອອກແບບມາເພື່ອໃຫ້ເຈົ້າຮູ້ສຶກຜ່ອນຄາຍທີ່ສຸດ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
                ສຳຫຼວດຕົນເອງ (28 ຂໍ້)
              </h3>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
                ຕອບຄຳຖາມກ່ຽວກັບກິດຈະກຳທີ່ມັກ, ຄຸນຄ່າທີ່ໃຫ້ຄວາມສຳຄັນ ແລະ ບັນຍາກາດການເຮັດວຽກທີ່ສະບາຍໃຈ.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E5E1D8]/60 text-xs text-[#2D4C3E]/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8D5B28]" />
              <span>ໃຊ້ເວລາ 10 - 15 ນາທີ</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F7EFE3] text-[#8D5B28] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
                ສັງເຄາະສັນຍານທ່າແຮງ
              </h3>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
                ຄຳຕອບຂອງເຈົ້າຈະຖືກນຳມາອ່ານເປັນຮູບແບບຄວາມສົນໃຈ, ຈຸດແຂງ ແລະ ທິດທາງທີ່ນ່າລອງສຳຫຼວດໃນລາວ.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E5E1D8]/60 text-xs text-[#2D4C3E]/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
              <span>ໂປ່ງໃສ ບໍ່ມີການຕັດສິນ</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
                ທົດລອງນ້ອຍໆ (Micro-experiments)
              </h3>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
                ຮັບແຜນທົດລອງ 1 ອາທິດເພື່ອລອງລົງມືເຮັດຈິງ ພ້ອມບົດສົນທະນາສຳລັບອະທິບາຍໃຫ້ພໍ່ແມ່ເຂົ້າໃຈ.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E5E1D8]/60 text-xs text-[#2D4C3E]/60 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4C3E]" />
              <span>ລອງກ່ອນຕັດສິນໃຈໃຫຍ່</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Principles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D4C3E] block mb-2">
            ຄຸນຄ່າທີ່ພວກເຮົາໃຫ້ຄວາມສຳຄັນ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E]">
            ເປັນຫຍັງ Next-path ຈຶ່ງແຕກຕ່າງ?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
              1. ບໍ່ແມ່ນບົດສອບເສັງ
            </h3>
            <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
              ບໍ່ມີຄຳຕອບຖືກ ຫຼື ຜິດ, ບໍ່ມີຄະແນນເສັງໄດ້ ຫຼື ຕົກ. ທຸກຄຳຕອບສະທ້ອນຄວາມເປັນຕົວເຈົ້າໃນຕອນນີ້ ບໍ່ມີໃຜດີກວ່າໃຜ.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7EFE3] text-[#8D5B28] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
              2. ບໍ່ຕັດສິນ ຫຼື ບອກວ່າເຈົ້າຕ້ອງເປັນຫຍັງ
            </h3>
            <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
              ເຮົາບໍ່ມີຄຳສັ່ງວ່າເຈົ້າ &apos;ຕ້ອງຮຽນອັນນັ້ນ&apos; ແຕ່ເປັນພາບລວມຄວາມສາມາດ ແລະ ທາງເລືອກທີ່ຊ່ວຍໃຫ້ເຈົ້າຕັດສິນໃຈເອງ.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
              3. ທົດລອງນ້ອຍໆ ກ່ອນຕັດສິນໃຈໃຫຍ່
            </h3>
            <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
              ແທນທີ່ຈະເລືອກຮຽນ 4-5 ປີແລ້ວຜິດຫວັງ, ພວກເຮົາສະເໜີ &apos;Micro-experiments&apos; ທີ່ໃຊ້ເວລາ 1 ອາທິດ ເພື່ອໃຫ້ລອງລົງມືເຮັດຈິງກ່ອນ.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#2D4C3E]">
              4. ພາສາທີ່ພໍ່ແມ່ເຂົ້າໃຈ (Family Bridge)
            </h3>
            <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
              ຊ່ວຍແປຄວາມຝັນ ຫຼື ຄວາມສົນໃຈຂອງເຈົ້າໃຫ້ກາຍເປັນມຸມມອງຄວາມໝັ້ນຄົງ ແລະ ໂອກາດສ້າງລາຍຮັບ ເພື່ອໃຫ້ລົມກັບຄອບຄົວໄດ້ງ່າຍຂຶ້ນ.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8D5B28] block mb-2">
            ຄຳຖາມທີ່ພົບເລື້ອຍ (FAQ)
          </span>
          <h2 className="text-2xl font-bold text-[#2D4C3E]">
            ຂໍ້ສົງໄສກ່ອນເລີ່ມຕົ້ນ
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#2D4C3E] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9F8F5] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8D5B28] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed border-t border-[#E5E1D8]/60 bg-[#F9F8F5]/50 animate-fade-in-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#2D4C3E] text-[#F9F8F5] rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8D5B28]/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ພ້ອມທີ່ຈະເລີ່ມຕົ້ນສຳຫຼວດແລ້ວຫຼືຍັງ?
            </h2>
            <p className="text-xs sm:text-sm text-[#F9F8F5]/80 leading-relaxed">
              ໃຊ້ເວລາພຽງ 10 - 15 ນາທີ ໃນພື້ນທີ່ທີ່ສະຫງົບ ແລະ ຕອບຕາມຄວາມຮູ້ສຶກທີ່ແທ້ຈິງຂອງທ່ານ.
            </p>
          </div>
          <div className="relative z-10 pt-2">
            <button
              onClick={visibleHasExistingDraft ? handleStart : handleStartFresh}
              disabled={starting || !visibleSessionCheckComplete}
              className="px-8 py-4 rounded-2xl bg-[#F9F8F5] text-[#2D4C3E] text-base font-semibold hover:bg-[#FFFFFF] transition-all shadow-md inline-flex items-center gap-3 cursor-pointer group active:scale-[0.985]"
            >
              <span>{visibleHasExistingDraft ? "ຕອບຕໍ່ຈາກຮ່າງເກົ່າ" : "ເລີ່ມຕົ້ນການສຳຫຼວດ"}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
