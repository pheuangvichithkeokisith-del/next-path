"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadExport, getReport } from "@/api/report";
import type { ReportResponse, ReportPattern, ReportPath } from "@/types/report";
import { isSessionNotFound } from "@/api/errors";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { restoreDraft } from "@/utils/draft";
import type { DraftAnswers } from "@/types/form";
import {
  Compass,
  Layers,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Download,
  Share2,
  Bot,
  MessageSquare,
  Quote,
  HeartHandshake
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "patterns" | "paths" | "unknowns" | "experiments">("all");
  const [userDraft, setUserDraft] = useState<DraftAnswers>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserDraft(restoreDraft(window.localStorage));
    }
  }, []);

  useEffect(() => {
    if (!resolved) return;
    if (!sessionId) {
      router.replace("/");
      return;
    }

    let active = true;

    getReport(sessionId)
      .then((data: ReportResponse) => {
        if (active) setReport(data);
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

    return () => {
      active = false;
    };
  }, [resolved, sessionId, router]);

  // Generate a comprehensive, high-quality prompt for external AIs (ChatGPT, Claude, Gemini)
  const aiPromptText = useMemo(() => {
    if (!report) return "";

    const patternLines = (report.response_pattern || [])
      .map((p: ReportPattern) => `- [${p.section}] ${p.label_lao}`)
      .join("\n");

    const pathLines = (report.possible_paths || [])
      .map((p: ReportPath) => `- ${p.label_lao} (${p.group_id})`)
      .join("\n");

    const unknownLines = (report.unknowns || [])
      .map((u: string) => `- ${u}`)
      .join("\n");

    // Gather user free text or notable answers from draft
    const writtenNotes: string[] = [];
    if (userDraft["Q7"]?.extra_text) {
      writtenNotes.push(`- ສິ່ງທີ່ເຄີຍເຮັດແລະພູມໃຈ: "${userDraft["Q7"].extra_text}"`);
    }
    if (userDraft["D2"]?.text_value) {
      writtenNotes.push(`- ລະດັບການສຶກສາ: ${userDraft["D2"].text_value}`);
    }

    return `### ບົດສະຫຼຸບການສຳຫຼວດຕົນເອງຈາກ PATHAI (Self-Exploration Profile)

**1. ບົດສະຫຼຸບພາບລວມ (Summary):**
${report.summary_text}

**2. ຮູບແບບຄວາມຄິດ ແລະ ທັກສະທີ່ພົບ (Identified Patterns):**
${patternLines || "- ບໍ່ພົບຮູບແບບສະເພາະ"}

**3. ທິດທາງເສັ້ນທາງທີ່ລະບົບແນະນຳ (Suggested Possible Paths):**
${pathLines || "- ບໍ່ພົບເສັ້ນທາງສະເພາະ"}

**4. ປັດໃຈບໍລິບົດ (Context Factors):**
- ອາຍຸ: ${report.context_factors.age_band || "ບໍ່ໄດ້ລະບຸ"}
- ແຂວງ: ${report.context_factors.province_code || "ບໍ່ໄດ້ລະບຸ"}
${writtenNotes.join("\n")}

**5. ສິ່ງທີ່ຍັງເປີດກວ້າງສຳລັບການສຳຫຼວດຕໍ່ (Unknowns / Open Questions):**
${unknownLines || "- ບໍ່ມີ"}

---
### ຄຳຖາມສຳລັບ AI (Instructions for AI Analysis):
ຂ້າພະເຈົ້າໄດ້ເຮັດແບບສຳຫຼວດ PATHAI ແລະ ໄດ້ຮັບຜົນສະທ້ອນຂ້າງເທິງ. ກະລຸນາຊ່ວຍ:
1. ວິເຄາະວ່າ ຮູບແບບ ແລະ ທິດທາງຂ້າງເທິງນີ້ ມີຄວາມສອດຄ່ອງກັນແນວໃດ?
2. ແນະນຳທັກສະຍ່ອຍ ຫຼື ໂອກາດຕົວຈິງທີ່ຂ້າພະເຈົ້າສາມາດເລີ່ມທົດລອງເຮັດໄດ້ໃນໄລຍະ 1-3 ເດືອນນີ້?
3. ຊ່ວຍຕັ້ງຄຳຖາມສຳຄັນ 3 ຂໍ້ ທີ່ຂ້າພະເຈົ້າຄວນນຳໄປຄິດທົບທວນຕົນເອງຕື່ມ?
`;
  }, [report, userDraft]);

  const handleCopyAiPrompt = async () => {
    if (!aiPromptText) return;
    try {
      await navigator.clipboard.writeText(aiPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = async () => {
    if (!sessionId) return;
    setDownloading(true);
    try {
      const blob = await downloadExport(sessionId, "json");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pathai-reflection-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (hasError) {
    return (
      <main className="flex-1 px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <ErrorBanner onRetry={() => router.refresh()} />
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl text-center space-y-4">
          <Loading className="h-48" />
          <p className="text-sm text-[#7D7565]">ກຳລັງສ້າງບົດສະທ້ອນຄວາມຄິດ...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* Header of the Reflection Space */}
      <div className="pb-8 subtle-border-b space-y-4">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#796F5F] bg-[#EFEBE0] px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D4C3E]"></span>
          <span>ແວ່ນແຍງສະທ້ອນຄວາມຄິດ</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171A1F] tracking-tight">
          ຮູບແບບ ແລະ ສິ່ງທີ່ສະທ້ອນອອກມາຈາກຕົວເຈົ້າ
        </h1>

        <p className="text-sm sm:text-base text-[#5B5345] max-w-3xl leading-relaxed">
          ບົດລາຍງານນີ້ບໍ່ແມ່ນການສອບເສັງ ຫຼື ການຕັດສິນວ່າເຈົ້າຕ້ອງເປັນໃຜ. ມັນຄືການຮວບຮວມສິ່ງທີ່ເຈົ້າແບ່ງປັນ ມາຈັດເປັນລະບຽບ ເພື່ອໃຫ້ເຈົ້າໄດ້ເຫັນຄວາມຊັດເຈນໃນຕົວເອງ.
        </p>

        {/* Narrative Summary Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white subtle-border shadow-2xs mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D4C3E] block mb-2">
            ບົດສະຫຼຸບພາບລວມ (Reflection Summary)
          </span>
          <p className="text-base sm:text-lg font-medium text-[#1A1E24] leading-relaxed">
            {report.summary_text}
          </p>
        </div>

        {/* Filter Tab Bar */}
        <div className="flex flex-wrap gap-2 pt-6">
          {[
            { id: "all", labelLo: "ພາບລວມທັງໝົດ" },
            { id: "patterns", labelLo: "ຮູບແບບທີ່ພົບ (Patterns)" },
            { id: "paths", labelLo: "ທິດທາງສຳຫຼວດ (Possible Paths)" },
            { id: "unknowns", labelLo: "ສິ່ງທີ່ຍັງເປີດກວ້າງ (Unknowns)" },
            { id: "experiments", labelLo: "ການທົດລອງນ້ອຍໆ (Experiments)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1D2229] text-white shadow-2xs"
                  : "bg-white subtle-border text-[#5E5546] hover:bg-[#F2EFE8]"
              }`}
            >
              {tab.labelLo}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: OBSERVED PATTERNS */}
      {(activeTab === "all" || activeTab === "patterns") && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2D4C3E]">
            <Layers className="w-4 h-4" />
            <span>1. ຮູບແບບຄວາມຄິດ ແລະ ທັກສະທີ່ສັງເກດເຫັນ (Observed Patterns)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F]">
            ຈຸດເຊື່ອມໂຍງລະຫວ່າງ ສິ່ງທີ່ເຈົ້າສົນໃຈ, ວິທີຄິດ ແລະ ສະພາບແວດລ້ອມ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {report.response_pattern && report.response_pattern.length > 0 ? (
              report.response_pattern.map((pattern: ReportPattern) => (
                <div
                  key={pattern.pattern_id}
                  className="p-5 sm:p-6 rounded-2xl bg-white subtle-border hover:shadow-2xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#695F4F] px-2.5 py-0.5 rounded-md bg-[#F4F1EA] mb-2.5">
                      {pattern.section}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#171A1F] mb-1.5">
                      {pattern.label_lao}
                    </h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-white subtle-border col-span-2 text-xs text-[#7A7365]">
                ບໍ່ພົບຮູບແບບສະເພາະ
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: POSSIBLE PATHS */}
      {(activeTab === "all" || activeTab === "paths") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#8D5B28]">
            <Compass className="w-4 h-4" />
            <span>2. ທິດທາງ ແລະ ໂອກາດສຳຫຼວດ (Possible Paths in Laos)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F]">
            ທາງເລືອກທີ່ສອດຄ່ອງກັບຈຸດພິເສດຂອງເຈົ້າ
          </h2>
          <p className="text-xs sm:text-sm text-[#6A6357]">
            ບໍ່ແມ່ນການບັງຄັບເລືອກອາຊີບ ແຕ່ເປັນຕົວຢ່າງຂອງສິ່ງທີ່ກຳລັງພັດທະນາໃນສັງຄົມລາວ ບໍ່ມີການຈັດອັນດັບຄະແນນ.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {report.possible_paths && report.possible_paths.length > 0 ? (
              report.possible_paths.map((path: ReportPath) => (
                <div
                  key={path.group_id}
                  className="p-5 sm:p-6 rounded-2xl bg-white subtle-border hover:border-[#2D4C3E] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-[#EBF2EE] text-[#2D4C3E] mb-2.5">
                      {path.group_id}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#171A1F] leading-snug">
                      {path.label_lao}
                    </h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-white subtle-border col-span-3 text-xs text-[#7A7365]">
                ບໍ່ພົບເສັ້ນທາງສະເພາະ
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: UNKNOWNS & OPEN QUESTIONS */}
      {(activeTab === "all" || activeTab === "unknowns") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#7A3E2D]">
            <HelpCircle className="w-4 h-4" />
            <span>3. ສິ່ງທີ່ຍັງເປີດກວ້າງ ແລະ ຄຳຖາມປາຍເປີດ (Uncharted Territory)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F]">
            ສິ່ງທີ່ຍັງບໍ່ຈຳເປັນຕ້ອງມີຄຳຕອບໃນຕອນນີ້
          </h2>
          <p className="text-xs sm:text-sm text-[#6A6357]">
            ຄວາມບໍ່ແນ່ໃຈຄືໂອກາດໃນການຄົ້ນຫາ ບໍ່ແມ່ນຄວາມອ່ອນແອ.
          </p>

          <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F3] subtle-border space-y-3">
            <h3 className="text-sm font-bold text-[#171A1F] flex items-center space-x-2">
              <span>✦</span>
              <span>ພື້ນທີ່ທີ່ເຈົ້າສາມາດຄົ້ນຫາຕໍ່ໄດ້:</span>
            </h3>
            {report.unknowns && report.unknowns.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-[#4D4537] list-disc list-inside leading-relaxed pl-1">
                {report.unknowns.map((u: string, idx: number) => (
                  <li key={idx} className="font-medium">{u}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#7D7565]">
                ບໍ່ມີສິ່ງທີ່ຍັງບໍ່ແນ່ໃຈສະເພາະ
              </p>
            )}
          </div>
        </section>
      )}

      {/* SECTION 4: MICRO-EXPERIMENTS */}
      {(activeTab === "all" || activeTab === "experiments") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#8D5B28]">
            <Sparkles className="w-4 h-4" />
            <span>4. ການທົດລອງນ້ອຍໆສຳລັບອາທິດນີ້ (Low-Stakes Micro-Experiments)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F]">
            ລອງເຮັດສິ່ງເຫຼົ່ານີ້ ໂດຍບໍ່ມີຄວາມກົດດັນ
          </h2>
          <p className="text-xs sm:text-sm text-[#6A6357]">
            ການລົງມືເຮັດຕົວຈິງ 20-30 ນາທີ ຈະຊ່ວຍຕອບຄຳຖາມໃນໃຈໄດ້ດີກວ່າການນັ່ງຄິດຄົນດຽວ.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 sm:p-6 rounded-2xl bg-white subtle-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#2D4C3E] block mb-1">1. ສົນທະນາສັ້ນໆ</span>
                <p className="text-xs sm:text-sm text-[#4D4537] leading-relaxed">
                  ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ທ່ານສົນໃຈ (15-20 ນາທີ)
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white subtle-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#8D5B28] block mb-1">2. ທົດລອງເຮັດຈິງ</span>
                <p className="text-xs sm:text-sm text-[#4D4537] leading-relaxed">
                  ລອງເຮັດໂປຣເຈັກນ້ອຍໆ 1 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍສັ້ນໆ
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white subtle-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#7A3E2D] block mb-1">3. ສັງເກດຕົວຈິງ</span>
                <p className="text-xs sm:text-sm text-[#4D4537] leading-relaxed">
                  ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ ຫຼື ງານອາສາສະໝັກໃນຊຸມຊົນ
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUPERCHARGED AI PROMPT COPY BOX */}
      <div className="mt-12 p-7 sm:p-9 rounded-3xl bg-[#1D2229] text-white space-y-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B5AEA0] mb-2">
              <Bot className="w-4 h-4 text-[#EBF2EE]" />
              <span>ຄັດລອກຂໍ້ມູນໄປຖາມ AI ຕໍ່ (AI Prompt Export)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              ນຳບົດສະທ້ອນນີ້ໄປປຶກສາ AI ອື່ນ (ChatGPT, Claude, Gemini)
            </h3>
            <p className="text-xs sm:text-sm text-[#BDB7A9] mt-1.5 max-w-2xl leading-relaxed">
              ລະບົບໄດ້ຮວບຮວມຄຳຕອບ ແລະ ຮູບແບບຂອງທ່ານ ຈັດເປັນ Prompt ທີ່ພ້ອມນຳໄປຖາມ AI ຕົວອື່ນ ເພື່ອໃຫ້ຊ່ວຍວິເຄາະ ຫຼື ວາງແຜນພັດທະນາຕົນເອງຕໍ່ໄດ້ຢ່າງອິດສະຫຼະ.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleCopyAiPrompt}
            className="px-5 py-3 rounded-xl bg-white text-[#1D2229] font-medium text-xs sm:text-sm hover:bg-[#F2EFE8] transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            {copiedPrompt ? <Check className="w-4 h-4 text-[#2D4C3E]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedPrompt ? "ຄັດລອກ Prompt ແລ້ວ! ✓" : "ຄັດລອກ Prompt ສຳລັບຖາມ AI"}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            disabled={downloading}
            className="px-5 py-3 rounded-xl bg-[#2A3038] text-white border border-[#424A54] font-medium text-xs sm:text-sm hover:bg-[#343C46] transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#B5AEA0]" />
            <span>{downloading ? "ກຳລັງດາວໂຫຼດ..." : "ດາວໂຫຼດ JSON"}</span>
          </button>
        </div>
      </div>

      {/* Voluntary Feedback Link */}
      <div className="pt-6 text-center">
        <button
          onClick={() => router.push("/feedback")}
          className="text-xs text-[#7A7365] hover:text-[#1D2229] underline transition-colors cursor-pointer"
        >
          ຕ້ອງການໃຫ້ຄຳເຫັນກ່ຽວກັບລະບົບ PATHAI (Feedback)
        </button>
      </div>
    </div>
  );
}
