"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadExport, getReport } from "@/api/report";
import type { ReportResponse, ReportPattern, ReportPath } from "@/types/report";
import { isSessionNotFound } from "@/api/errors";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { createSession } from "@/api/session";
import { clearSessionId, storeSessionId, useSessionId } from "@/hooks/useSession";
import { clearDraft, restoreDraft } from "@/utils/draft";
import type { DraftAnswers } from "@/types/form";
import staticQuestions from "@/data/questions.json";
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
  HeartHandshake,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp
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
  const [showProof, setShowProof] = useState(false);

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

  // Generate a comprehensive, high-quality prompt containing transparent raw evidence + calculation results
  const aiPromptText = useMemo(() => {
    if (!report) return "";

    // 1. Lookup dictionary for options and questions
    const optionsMap: Record<string, string> = {};
    const questionsMap: Record<string, string> = {};

    for (const d of (staticQuestions.demographics || [])) {
      questionsMap[d.id] = d.stem;
      if (d.options) {
        for (const opt of d.options) {
          optionsMap[opt.code] = opt.text;
        }
      }
    }
    for (const q of (staticQuestions.questions || [])) {
      questionsMap[q.id] = q.stem;
      if (q.options) {
        for (const opt of q.options) {
          optionsMap[opt.code] = opt.text;
        }
      }
    }

    // 2. Format Raw Answers grouped by section
    const answersBySection: Record<string, string[]> = {
      "ຄວາມສົນໃຈ (Interests - Q1–Q4)": [],
      "ທັກສະ & ຫຼັກຖານຜົນງານ (Skills & Evidence - Q5–Q7)": [],
      "ຄ່ານິຍົມ (Values - Q8–Q9)": [],
      "ຮູບແບບການເຮັດວຽກ (Work Style - Q10–Q13)": [],
      "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)": [],
      "ເປົ້າໝາຍ (Goals - Q19–Q21)": [],
      "ຄວາມເປັນໄປໄດ້ & ຂໍ້ຈຳກັດ (Feasibility & Constraints - Q22–Q23)": [],
      "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)": [],
    };

    const secMapping: Record<string, string> = {
      Q1: "ຄວາມສົນໃຈ (Interests - Q1–Q4)",
      Q2: "ຄວາມສົນໃຈ (Interests - Q1–Q4)",
      Q3: "ຄວາມສົນໃຈ (Interests - Q1–Q4)",
      Q4: "ຄວາມສົນໃຈ (Interests - Q1–Q4)",
      Q5: "ທັກສະ & ຫຼັກຖານຜົນງານ (Skills & Evidence - Q5–Q7)",
      Q6: "ທັກສະ & ຫຼັກຖານຜົນງານ (Skills & Evidence - Q5–Q7)",
      Q7: "ທັກສະ & ຫຼັກຖານຜົນງານ (Skills & Evidence - Q5–Q7)",
      Q8: "ຄ່ານິຍົມ (Values - Q8–Q9)",
      Q9: "ຄ່ານິຍົມ (Values - Q8–Q9)",
      Q10: "ຮູບແບບການເຮັດວຽກ (Work Style - Q10–Q13)",
      Q11: "ຮູບແບບການເຮັດວຽກ (Work Style - Q10–Q13)",
      Q12: "ຮູບແບບການເຮັດວຽກ (Work Style - Q10–Q13)",
      Q13: "ຮູບແບບການເຮັດວຽກ (Work Style - Q10–Q13)",
      Q14: "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)",
      Q15: "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)",
      Q16: "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)",
      Q17: "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)",
      Q18: "ການຮຽນ & ສິ່ງທີ່ຍັງຍາກ (Learning & Challenges - Q14–Q18)",
      Q19: "ເປົ້າໝາຍ (Goals - Q19–Q21)",
      Q20: "ເປົ້າໝາຍ (Goals - Q19–Q21)",
      Q21: "ເປົ້າໝາຍ (Goals - Q19–Q21)",
      Q22: "ຄວາມເປັນໄປໄດ້ & ຂໍ້ຈຳກັດ (Feasibility & Constraints - Q22–Q23)",
      Q23: "ຄວາມເປັນໄປໄດ້ & ຂໍ້ຈຳກັດ (Feasibility & Constraints - Q22–Q23)",
      Q24: "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)",
      Q25: "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)",
      Q26: "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)",
      Q27: "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)",
      Q28: "ເສັ້ນທາງການເດີນຕໍ່ (Journey & Flexibility - Q24–Q28)",
    };

    for (const [qid, ans] of Object.entries(userDraft)) {
      const sec = secMapping[qid];
      if (!sec) continue;
      const optTexts = (ans.option_codes || []).map((code) => optionsMap[code] || code);
      let desc = optTexts.join(", ");
      if (ans.extra_text) desc += ` (ລາຍລະອຽດເພີ່ມເຕີມ: "${ans.extra_text}")`;
      if (ans.other_text) desc += ` (ອື່ນໆ: "${ans.other_text}")`;
      if (ans.text_value) desc += ` ("${ans.text_value}")`;
      if (desc.trim()) {
        answersBySection[sec].push(`• [${qid}] ${desc}`);
      }
    }

    const answersSummary = Object.entries(answersBySection)
      .filter(([_, lines]) => lines.length > 0)
      .map(([sec, lines]) => `### ${sec}\n${lines.join("\n")}`)
      .join("\n\n");

    const patternLines = (report.response_pattern || [])
      .map((p: ReportPattern) => `- [${p.section}] ${p.label_lao}`)
      .join("\n");

    const pathLines = (report.possible_paths || [])
      .map((p: ReportPath) => `- ${p.label_lao} (${p.group_id})`)
      .join("\n");

    const unknownLines = (report.unknowns || [])
      .map((u: string) => `- ${u}`)
      .join("\n");

    const ageText = userDraft["D1"]?.option_codes?.[0] ? optionsMap[userDraft["D1"].option_codes[0]] || userDraft["D1"].option_codes[0] : (report.context_factors.age_band || "ບໍ່ໄດ້ລະບຸ");
    const eduText = userDraft["D2"]?.text_value || "ບໍ່ໄດ້ລະບຸ";
    const provText = userDraft["D3"]?.option_codes?.[0] ? optionsMap[userDraft["D3"].option_codes[0]] || userDraft["D3"].option_codes[0] : (report.context_factors.province_code || "ບໍ່ໄດ້ລະບຸ");

    return `# 🧭 ໂປຣໄຟລ໌ສຳຫຼວດຕົນເອງຈາກ PATHAI (Self-Reflection & Pure Evidence Profile)

## 👤 1. ຂໍ້ມູນບໍລິບົດຂອງຜູ້ຕອບ (Context Factors)
- ອາຍຸ: ${ageText}
- ລະດັບການສຶກສາ: ${eduText}
- ແຂວງ: ${provText}

## 📊 2. ຫຼັກຖານຄຳຕອບຕົວຈິງທີ່ສົ່ງເຂົ້າລະບົບຄຳນວນ (Raw Answers Submitted to Backend)
${answersSummary || "- ບໍ່ມີຂໍ້ມູນຄຳຕອບລະອຽດ"}

## 🧠 3. ຜົນການວິເຄາະທາງສະຖິຕິຈາກລະບົບ (Signal Engine Diagnostics)
**ບົດສະຫຼຸບພາບລວມ (Summary):**
${report.summary_text}

**ຮູບແບບຄວາມຄິດ ແລະ ທັກສະທີ່ພົບ (Identified Patterns):**
${patternLines || "- ບໍ່ພົບຮູບແບບສະເພາະ"}

**ທິດທາງເສັ້ນທາງທີ່ແນະນຳໃຫ້ສຳຫຼວດ (Suggested Exploration Paths in Laos):**
${pathLines || "- ບໍ່ພົບເສັ້ນທາງສະເພາະ"}

**ສິ່ງທີ່ຍັງເປີດກວ້າງສຳລັບການສຳຫຼວດຕໍ່ (Unknowns / Open Reflections):**
${unknownLines || "- ບໍ່ມີ"}

---
## 🤖 4. ຄຳຖາມເຈາະເລິກສຳລັບ AI ພາຍນອກ (Prompt for ChatGPT / Claude / Gemini)
ຂ້າພະເຈົ້າເປັນໄວໜຸ່ມໃນປະເທດລາວ. ຈາກຂໍ້ມູນຄຳຕອບຕົວຈິງ ແລະ ຜົນວິເຄາະທາງສະຖິຕິຈາກລະບົບ PATHAI ຂ້າງເທິງນີ້, ກະລຸນາຊ່ວຍ:
1. ວິເຄາະຈຸດເຊື່ອມໂຍງລະຫວ່າງ "ທັກສະ/ປະສົບການຕົວຈິງ" ກັບ "ທິດທາງເສັ້ນທາງທີ່ລະບົບແນະນຳ" ໃນບໍລິບົດຂອງປະເທດລາວ?
2. ແນະນຳ **Micro-Experiments (ການທົດລອງນ້ອຍໆ 1-2 ຢ່າງ)** ທີ່ຂ້າພະເຈົ້າສາມາດເລີ່ມລົງມືເຮັດໄດ້ໃນໄລຍະ 1-2 ອາທິດນີ້ ໂດຍໃຊ້ຕົ້ນທຶນຕ່ຳ ແລະ ບໍ່ມີຄວາມກົດດັນ?
3. ຕັ້ງຄຳຖາມສຳຄັນ 3 ຂໍ້ ເພື່ອໃຫ້ຂ້າພະເຈົ້ານຳໄປຄິດທົບທວນຕົນເອງ ແລະ ປຶກສາກັບຄອບຄົວ/ອາຈານຕື່ມ?
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
      a.download = `nextpath-reflection-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleStartNew = async () => {
    if (window.confirm("ເລີ່ມຕົ້ນການສຳຫຼວດຮອບໃໝ່? ຂໍ້ມູນເກົ່າຈະຖືກລຶບ ແລະ ສ້າງ Session ໃໝ່.")) {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      try {
        const { session_id } = await createSession();
        storeSessionId(session_id);
      } catch {
        storeSessionId(`session-${Date.now()}`);
      }
      router.push("/assessment");
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

      {/* SUPERCHARGED AI PROMPT MASTER BOX */}
      <div className="mt-12 p-7 sm:p-9 rounded-3xl bg-[#1D2229] text-white space-y-6 shadow-md border border-[#2D3540]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B5AEA0]">
              <Bot className="w-4 h-4 text-[#8D5B28]" />
              <span>1-Click AI Prompt Export (ພ້ອມຫຼັກຖານຕົວຈິງ)</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              ນຳບົດສະທ້ອນ ແລະ ຫຼັກຖານຄຳຕອບ ໄປປຶກສາ AI ອື່ນ
            </h3>
            <p className="text-xs sm:text-sm text-[#BDB7A9] max-w-2xl leading-relaxed">
              ລະບົບໄດ້ຮວບຮວມຄຳຕອບຕົວຈິງທີ່ທ່ານເລືອກ ພ້ອມຜົນວິເຄາະທາງສະຖິຕິຈາກ Signal Engine ຈັດເປັນ Master Prompt ທີ່ໂປ່ງໃສ ເພື່ອໃຫ້ນຳໄປຖາມ ChatGPT, Claude ຫຼື Gemini ຕໍ່ໄດ້ທັນທີ.
            </p>
          </div>
        </div>

        {/* SINGLE MASTER CTA BUTTON */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
          <button
            onClick={handleCopyAiPrompt}
            className={`px-8 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-lg active:scale-98 ${
              copiedPrompt
                ? "bg-[#2D4C3E] text-white"
                : "bg-white text-[#1D2229] hover:bg-[#F2EFE8]"
            }`}
          >
            {copiedPrompt ? (
              <>
                <Check className="w-5 h-5 text-[#85E3B3]" />
                <span>ຄັດລອກ Master Prompt ສຳເລັດແລ້ວ! ✓ (Paste ຖາມ AI ໄດ້ເລີຍ)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#8D5B28]" />
                <span>ຄັດລອກ Prompt ພ້ອມຫຼັກຖານ ໄປຖາມ AI ຕໍ່</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            disabled={downloading}
            className="px-5 py-4 rounded-2xl bg-[#2A3038] text-white border border-[#424A54] font-medium text-xs sm:text-sm hover:bg-[#343C46] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#B5AEA0]" />
            <span>{downloading ? "ກຳລັງດາວໂຫຼດ..." : "ດາວໂຫຼດ JSON"}</span>
          </button>
        </div>

        {/* QUICK SHORTCUT LINKS TO EXTERNAL AIs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#A8A193]">
          <span className="font-medium text-[#C8C2B5]">ເປີດໃຊ້ງານ AI:</span>
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2A3038] hover:bg-[#38414D] text-white transition-colors cursor-pointer"
          >
            <span>ChatGPT</span>
            <ExternalLink className="w-3 h-3 text-[#8A92A0]" />
          </a>
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2A3038] hover:bg-[#38414D] text-white transition-colors cursor-pointer"
          >
            <span>Claude</span>
            <ExternalLink className="w-3 h-3 text-[#8A92A0]" />
          </a>
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2A3038] hover:bg-[#38414D] text-white transition-colors cursor-pointer"
          >
            <span>Gemini</span>
            <ExternalLink className="w-3 h-3 text-[#8A92A0]" />
          </a>
        </div>

        {/* TRANSPARENCY & CALCULATION PROOF ACCORDION */}
        <div className="pt-4 border-t border-[#313842]">
          <button
            onClick={() => setShowProof(!showProof)}
            className="inline-flex items-center space-x-2 text-xs text-[#D1CBC1] hover:text-white transition-colors cursor-pointer"
          >
            {showProof ? <ChevronUp className="w-4 h-4 text-[#8D5B28]" /> : <ChevronDown className="w-4 h-4 text-[#8D5B28]" />}
            <span className="font-semibold">
              {showProof ? "ເຊື່ອງຫຼັກຖານຄຳຕອບທີ່ນຳໄປຄຳນວນ" : "🔍 ກວດເບິ່ງຫຼັກຖານຄຳຕອບທີ່ສົ່ງເຂົ້າຄຳນວນຕົວຈິງ (Calculation Proof & Raw Data)"}
            </span>
          </button>

          {showProof && (
            <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#13171C] text-xs text-[#C8C2B5] space-y-2 max-h-80 overflow-y-auto border border-[#262D36]">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-xs">
                {aiPromptText}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: Start New Reflection & Voluntary Feedback */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAE6DC]">
        <button
          onClick={handleStartNew}
          className="px-6 py-3 rounded-xl bg-[#2D4C3E] hover:bg-[#22392F] text-white font-medium text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ເລີ່ມຕົ້ນການສຳຫຼວດຮອບໃໝ່ (Start New)</span>
        </button>

        <button
          onClick={() => router.push("/feedback")}
          className="text-xs text-[#7A7365] hover:text-[#1D2229] underline transition-colors cursor-pointer"
        >
          ຕ້ອງການໃຫ້ຄຳເຫັນກ່ຽວກັບລະບົບ Next-path (Feedback)
        </button>
      </div>
    </div>
  );
}
