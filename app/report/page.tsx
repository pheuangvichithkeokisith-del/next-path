"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadExport, getReport } from "@/api/report";
import type { ReportResponse, ReportPattern, ReportPath } from "@/types/report";
import { isSessionIncomplete, isSessionNotFound } from "@/api/errors";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { clearDraft, restoreDraft } from "@/utils/draft";
import type { DraftAnswers } from "@/types/form";
import staticQuestions from "@/data/questions.json";
import v4Questions from "@/v4.0/questions_full.json";
import { AiPromptModal } from "@/components/AiPromptModal";
import {
  Compass,
  Layers,
  HelpCircle,
  Sparkles,
  Check,
  Download,
  RotateCcw,
  Printer,
  Share2,
  MessageSquare,
  HeartHandshake,
} from "lucide-react";

type ReportTab = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const CONTEXT_LABELS = {
  time_constraint: "ເວລາບໍ່ພໍ",
  location_constraint: "ຕ້ອງຢູ່ໃກ້ເຮືອນ/ຄອບຄົວ",
  health_constraint: "ຂໍ້ຈຳກັດດ້ານສຸຂະພາບ",
  transport_constraint: "ການເດີນທາງ/ລະຍະທາງ",
  high_mobility: "ພ້ອມຍ້າຍ",
  medium_mobility: "ອາດຍ້າຍໄດ້ຖ້າເງື່ອນໄຂເໝາະສົມ",
  low_mobility: "ຢາກຢູ່ພື້ນທີ່ປັດຈຸບັນ",
  no_mobility: "ຕອນນີ້ຍ້າຍບໍ່ໄດ້",
  family_high_education: "ຄອບຄົວຄາດຫວັງໃຫ້ຮຽນຕໍ່ສູງ",
  family_near_home: "ຄອບຄົວຢາກໃຫ້ເຮັດວຽກໃກ້ບ້ານ",
  family_stable_career: "ຄອບຄົວຢາກໃຫ້ເລືອກອາຊີບໝັ້ນຄົງ",
  family_self_choice: "ຄອບຄົວໃຫ້ເລືອກເອງ",
  family_other: "ບໍລິບົດຄອບຄົວອື່ນໆ",
} as const;

const SCORE_LABELS: Record<string, string> = {
  C1: "ວິເຄາະຂໍ້ມູນ ແລະ ວິໄຈ",
  C2: "ເທັກໂນໂລຊີ ແລະ ດິຈິຕອນ",
  C3: "ອອກແບບ ແລະ ສື່ສານສ້າງສັນ",
  C4: "ພັດທະນາຄົນ ແລະ ສັງຄົມ",
  C5: "ສຸຂະພາບ ແລະ ການເບິ່ງແຍງ",
  C6: "ທຸລະກິດ ແລະ ການຄຸ້ມຄອງ",
  C7: "ງານປະຕິບັດ, ທຳມະຊາດ ແລະ ສິ່ງແວດລ້ອມ",
};

function translateContextValues(values: string[] | undefined) {
  return (
    values
      ?.map((value) => CONTEXT_LABELS[value as keyof typeof CONTEXT_LABELS] ?? value)
      .join(", ") || "ບໍ່ໄດ້ລະບຸ"
  );
}

export default function ReportPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportTab>(0);
  const [retryToken, setRetryToken] = useState(0);

  const userDraft = useMemo<DraftAnswers>(() => {
    if (typeof window === "undefined") return {};
    return restoreDraft(window.localStorage, sessionId);
  }, [sessionId]);

  // The completed session is the source of truth. Keep the local draft only as
  // a compatibility fallback for older reports or a transient API response.
  const reportAnswers = useMemo<DraftAnswers>(() => {
    if (report?.answers?.length) {
      return Object.fromEntries(
        report.answers.map((answer) => [
          answer.question_id,
          {
            option_codes: answer.option_codes || [],
            other_text: answer.other_text,
            extra_text: answer.extra_text,
            text_value: answer.text_value,
          },
        ]),
      );
    }
    return userDraft;
  }, [report, userDraft]);

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
        } else if (isSessionIncomplete(error)) {
          router.replace("/processing");
        } else {
          setHasError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [retryToken, resolved, sessionId, router]);

  // Master AI Prompt Text (tailored to Next-path)
  const aiPromptText = useMemo(() => {
    if (!report) return "";

    type PromptItem = {
      id: string;
      stem: string;
      section?: string;
      options?: Array<{ code: string; text: string }>;
    };

    const source = (report.versions.form === "v4.0.0" ? v4Questions : staticQuestions) as {
      demographics: PromptItem[];
      questions: PromptItem[];
    };
    const sourceItems = [...(source.demographics || []), ...(source.questions || [])];
    const itemMap = Object.fromEntries(sourceItems.map((item) => [item.id, item]));

    const optionsMap: Record<string, string> = {};
    for (const item of sourceItems) {
      for (const option of item.options || []) {
        optionsMap[option.code] = option.text;
      }
    }

    const sectionLabels: Record<string, string> = {
      interests: "ໝວດ 1 — ຄວາມສົນໃຈ (Interests)",
      skills: "ໝວດ 2 — ທັກສະ ແລະ ຄວາມຖະໜັດ (Skills)",
      values: "ໝວດ 3 — ຄ່ານິຍົມ (Values)",
      work_style: "ໝວດ 4 — ຮູບແບບການເຮັດວຽກ (Work Style)",
      academic: "ໝວດ 5 — ການຮຽນ ແລະ ວິຊາການ (Academic)",
      learning: "ໝວດ 5 — ການຮຽນ ແລະ ການຮຽນຮູ້ (Learning)",
      goals: "ໝວດ 6 — ເປົ້າໝາຍ (Goals)",
      constraints: "ໝວດ 7 — ຂໍ້ຈຳກັດ ແລະ ບໍລິບົດ (Constraints)",
      feasibility: "ໝວດ 7 — ຄວາມເປັນໄປໄດ້ຕົວຈິງ (Feasibility)",
      flexibility: "ໝວດ 8 — ຄວາມຍືດຢຸ່ນ ແລະ ຄວາມພ້ອມ (Flexibility)",
      journey: "ໝວດ 8 — ເສັ້ນທາງການເດີນຕໍ່ (Journey)",
    };

    const answersBySection: Record<string, string[]> = {};

    for (const [qid, ans] of Object.entries(reportAnswers)) {
      const item = itemMap[qid];
      const sec = item?.section ? (sectionLabels[item.section] || item.section) : "ຂໍ້ມູນເບື້ອງຕົ້ນ (Demographics)";
      if (!answersBySection[sec]) answersBySection[sec] = [];
      const optTexts = (ans.option_codes || []).map((code) => optionsMap[code] || code);
      let desc = `ຄຳຖາມ: ${item?.stem || qid}\n  ຄຳຕອບ: ${optTexts.join(", ") || "ບໍ່ໄດ້ເລືອກ"}`;
      if (ans.extra_text) desc += ` (ລາຍລະອຽດເພີ່ມເຕີມ: "${ans.extra_text}")`;
      if (ans.other_text) desc += ` (ອື່ນໆ: "${ans.other_text}")`;
      if (ans.text_value) desc += ` ("${ans.text_value}")`;
      if (desc.trim()) {
        answersBySection[sec].push(`• [${qid}] ${desc}`);
      }
    }

    const answersSummary = Object.entries(answersBySection)
      .filter(([, lines]) => lines.length > 0)
      .map(([sec, lines]) => `### ${sec}\n${lines.join("\n")}`)
      .join("\n\n");

    const patternLines = (report.response_pattern || [])
      .map((p: ReportPattern) => `- [${p.section}] ${p.label_lao}`)
      .join("\n");

    const pathLines = (report.possible_paths || [])
      .map((p: ReportPath, idx: number) => {
        const scores = p.compatibility_score == null
          ? ""
          : ` — ຄວາມເໝາະສົມລວມ ${p.compatibility_score}%, ສັນຍານ ${p.fit_score ?? "-"}%, ຄວາມເປັນໄປໄດ້ ${p.feasibility_score ?? "-"}%`;
        const reasons = p.reasons_lao?.join("; ") || "";
        const conditions = p.conditions_lao?.join("; ") || "";
        return `- ທາງເລືອກທີ ${idx + 1}: ${p.label_lao} (${p.group_id})${scores}\n  ເຫດຜົນ: ${reasons || "ບໍ່ມີ"}\n  ເງື່ອນໄຂ: ${conditions || "ບໍ່ມີ"}`;
      })
      .join("\n");

    const unknownLines = (report.unknowns || [])
      .map((u: string) => `- ${u}`)
      .join("\n");

    const ageText = reportAnswers["D1"]?.text_value?.trim()
      ? `${reportAnswers["D1"].text_value.trim()} ປີ`
      : reportAnswers["D1"]?.option_codes?.[0]
      ? optionsMap[reportAnswers["D1"].option_codes[0]] || reportAnswers["D1"].option_codes[0]
      : (report.context_factors.age_years != null
          ? `${report.context_factors.age_years} ປີ`
          : report.context_factors.age_band || "ບໍ່ໄດ້ລະບຸ");
    const eduText = reportAnswers["D2"]?.text_value || "ບໍ່ໄດ້ລະບຸ";
    const provText = reportAnswers["D3"]?.option_codes?.[0]
      ? optionsMap[reportAnswers["D3"].option_codes[0]] || reportAnswers["D3"].option_codes[0]
      : (report.context_factors.province_code || "ບໍ່ໄດ້ລະບຸ");
    const contextLines = [
      `- ຂໍ້ຈຳກັດ: ${translateContextValues(report.context_factors.constraints)}`,
      `- ຄວາມພ້ອມຍ້າຍ: ${translateContextValues(report.context_factors.mobility)}`,
      `- ບໍລິບົດຄອບຄົວ: ${translateContextValues(report.context_factors.family_context)}`,
      `- ຄວາມພ້ອມຮັບຄວາມສ່ຽງ: ${report.context_factors.risk_willingness == null ? "ບໍ່ໄດ້ລະບຸ" : `${report.context_factors.risk_willingness} / 4`}`,
      `- ຄວາມພ້ອມດ້ານຄວາມປອດໄພ: ${report.context_factors.safety_readiness == null ? "ບໍ່ໄດ້ລະບຸ" : `${report.context_factors.safety_readiness} / 5`}`,
    ].join("\n");

    return `# 🧭 ພາບລວມຄວາມສາມາດ ແລະ ທິດທາງຈາກ Next-path
(ສຳລັບໄວໜຸ່ມລາວ)

## 👤 1. ຂໍ້ມູນບໍລິບົດຂອງຜູ້ຕອບ (Context Profile)
- ອາຍຸ: ${ageText}
- ລະດັບການສຶກສາ: ${eduText}
- ແຂວງ / ທີ່ຢູ່: ${provText}
${contextLines}

## 📊 2. ຄຳຕອບ ແລະ ບໍລິບົດຂອງຂ້ອຍ
${answersSummary || "- ບໍ່ມີຂໍ້ມູນຄຳຕອບລະອຽດ"}

## 🧠 3. ຜົນການສະທ້ອນຈາກລະບົບ Next-path
**ບົດສະຫຼຸບພາບລວມ (Summary):**
${report.summary_text}

**ຮູບແບບຄວາມຄິດ ແລະ ທັກສະທີ່ພົບ (Observed Patterns):**
${patternLines || "- ບໍ່ພົບຮູບແບບສະເພາະ"}

**ທິດທາງເສັ້ນທາງທີ່ແນະນຳໃຫ້ສຳຫຼວດໃນລາວ (Suggested Exploration Paths in Laos):**
${pathLines || "- ບໍ່ພົບເສັ້ນທາງສະເພາະ"}

**ສິ່ງທີ່ຍັງເປີດກວ້າງສຳລັບການຮຽນຮູ້ຕໍ່ (Unknowns / Open Reflections):**
${unknownLines || "- ບໍ່ມີ"}

---
## 🤖 4. ຄຳຖາມເຈາະເລິກສຳລັບ AI ພາຍນອກ (Prompt for ChatGPT / Claude / Gemini)
ເຈົ້າຄື "ເພື່ອນຮ່ວມຄິດສຳລັບການສຳຫຼວດການຮຽນ, ວຽກ ແລະ ຊີວິດຂອງໄວໜຸ່ມລາວ".
ຈາກຂໍ້ມູນຄຳຕອບຕົວຈິງ ແລະ ພາບລວມຂອງ Next-path ຂ້າງເທິງນີ້, ຂໍໃຫ້ຊ່ວຍ:
1. ສະທ້ອນຈຸດແຂງ ແລະ ຄວາມສົນໃຈໂດຍອ້າງອີງຈາກຄຳຕອບຈິງ; ບອກໃຫ້ເຫັນວ່າຄຳຕອບໃດເຊື່ອມກັບຂໍ້ສະທ້ອນໃດ.
2. ຊ່ວຍສຳຫຼວດ 2-3 ທາງເລືອກຈາກທິດທາງຂ້າງເທິງ ໂດຍຄຳນຶງເຖິງອາຍຸ, ການສຶກສາ, ຂໍ້ຈຳກັດ ແລະ ບໍລິບົດຄອບຄົວ.
3. ແນະນຳກິດຈະກຳທົດລອງ 2-3 ຢ່າງ ທີ່ເຮັດໄດ້ໃນ 1-2 ອາທິດ ຕົ້ນທຶນຕ່ຳ ແລະ ປອດໄພ; ໃຫ້ບອກວ່າຄວນສັງເກດຫຍັງຈາກການລອງ.
4. ຊ່ວຍຮ່າງບົດສົນທະນາກັບຄອບຄົວ ໂດຍອະທິບາຍທາງເລືອກຢ່າງສະຫງົບ, ບໍ່ອ້າງວ່າເປັນຄຳຕັດສິນອາຊີບ.
5. ຕັ້ງຄຳຖາມປາຍເປີດ 3 ຂໍ້ ໃຫ້ຂ້ອຍກັບໄປທົບທວນຕໍ່.

ຫຼັກການສຳຄັນ:
- ຢ່າວິນິດໄສ, ຈັດອັນດັບ ຫຼື ບອກວ່າຂ້ອຍຕ້ອງເລືອກອາຊີບໃດ.
- ຢ່າແຕ່ງຂໍ້ມູນທີ່ບໍ່ມີ. ຖ້າຂາດຂໍ້ມູນ ໃຫ້ບອກວ່າຂາດ ແລະ ຖາມຄຳຖາມຕໍ່.
- ຖ້າກ່າວເຖິງຕະຫຼາດວຽກ ຫຼື ໂອກາດປັດຈຸບັນໃນລາວ ໃຫ້ແຍກຂໍ້ເທັດຈິງອອກຈາກການຄາດຄະເນ ແລະ ແນະນຳໃຫ້ກວດແຫຼ່ງຂໍ້ມູນ.
- ຕອບເປັນພາສາລາວທີ່ອ່ານງ່າຍ, ອົບອຸ່ນ ແລະ ບໍ່ຕັດສິນ.
`;
  }, [report, reportAnswers]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Next-path: ພາບລວມຄວາມສາມາດ",
          text: "ພາບລວມຄວາມສົນໃຈ, ຄວາມສາມາດ ແລະ ທິດທາງຈາກ Next-path ສຳລັບໄວໜຸ່ມລາວ",
          url: window.location.href,
        });
      } catch {
        // Cancelled
      }
    } else if (typeof navigator !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
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
    } catch {
      setHasError(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleStartNew = () => {
    if (window.confirm("ເລີ່ມຕົ້ນການສຳຫຼວດຮອບໃໝ່? ຂໍ້ມູນເກົ່າຈະຖືກລຶບ ແລະ ສ້າງການສຳຫຼວດໃໝ່.")) {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      router.push("/introduction");
    }
  };

  if (hasError) {
    return (
      <main className="flex-1 px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <ErrorBanner
            onRetry={() => {
              setHasError(false);
              setRetryToken((token) => token + 1);
            }}
          />
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl text-center space-y-4">
          <Loading className="h-48" />
          <p className="text-sm text-[#746C5F]">ກຳລັງສ້າງພາບລວມຄວາມສາມາດ...</p>
        </div>
      </main>
    );
  }

  const isIncompleteV4Report =
    report.versions.form === "v4.0.0" &&
    report.unknowns.some((unknown) => unknown.startsWith("v4.0 validation:"));

  if (isIncompleteV4Report) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-[#D7B97A] bg-[#FFF8E8] p-6 sm:p-8 text-center space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#5B4525]">
            ຍັງສ້າງພາບລວມບໍ່ໄດ້
          </h1>
          <p className="text-sm leading-relaxed text-[#6A5535]">
            ຄຳຕອບບາງຂໍ້ຍັງບໍ່ຄົບຕາມເກນ. ກະລຸນາເລີ່ມການສຳຫຼວດຮອບໃໝ່ ແລະ ກວດຄຳຕອບກ່ອນສົ່ງ.
          </p>
          <ul className="text-left text-sm leading-relaxed text-[#5B4525] list-disc list-inside">
            {report.unknowns.map((unknown) => (
              <li key={unknown}>{unknown.replace("v4.0 validation: ", "")}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleStartNew}
            className="btn-primary justify-center"
          >
            ເລີ່ມການສຳຫຼວດຮອບໃໝ່
          </button>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 0 as ReportTab, label: "1. ພາບລວມຕົນເອງ" },
    { id: 1 as ReportTab, label: "2. ຮູບແບບທີ່ພົບ" },
    { id: 2 as ReportTab, label: "3. ທິດທາງສຳຫຼວດ" },
    { id: 3 as ReportTab, label: "4. ສິ່ງທີ່ຍັງເປີດກວ້າງ" },
    { id: 4 as ReportTab, label: "5. ການທົດລອງນ້ອຍໆ" },
    { id: 5 as ReportTab, label: "6. ວິທີລົມກັບພໍ່ແມ່" },
    { id: 6 as ReportTab, label: "7. ກວດຄືນຄຳຕອບ" },
  ];

  const topPath = report.possible_paths?.[0];
  const provinceOption = v4Questions.demographics
    .find((item) => item.id === "D3")
    ?.options?.find((option) => option.code === report.context_factors.province_code);
  const provinceLabel =
    provinceOption?.text ?? report.context_factors.province_code ?? "ປະເທດລາວ";
  const contextRows = [
    {
      label: "ອາຍຸ",
      value:
        report.context_factors.age_years != null
          ? `${report.context_factors.age_years} ປີ`
          : report.context_factors.age_band || "ບໍ່ໄດ້ລະບຸ",
    },
    {
      label: "ການສຶກສາ",
      value: reportAnswers.D2?.text_value?.trim() || "ບໍ່ໄດ້ລະບຸ",
    },
    { label: "ພື້ນທີ່", value: provinceLabel },
    { label: "ຂໍ້ຈຳກັດ", value: translateContextValues(report.context_factors.constraints) },
    { label: "ຄວາມພ້ອມຍ້າຍ", value: translateContextValues(report.context_factors.mobility) },
    {
      label: "ບໍລິບົດຄອບຄົວ",
      value: translateContextValues(report.context_factors.family_context),
    },
    {
      label: "ຄວາມພ້ອມຮັບຄວາມສ່ຽງ",
      value:
        report.context_factors.risk_willingness == null
          ? "ບໍ່ໄດ້ລະບຸ"
          : `${report.context_factors.risk_willingness} / 4`,
    },
    {
      label: "ຄວາມພ້ອມດ້ານຄວາມປອດໄພ",
      value:
        report.context_factors.safety_readiness == null
          ? "ບໍ່ໄດ້ລະບຸ"
          : `${report.context_factors.safety_readiness} / 5`,
    },
  ];
  const reportSource = (report.versions.form === "v4.0.0" ? v4Questions : staticQuestions) as {
    demographics: Array<{
      id: string;
      stem: string;
      options?: Array<{ code: string; text: string }>;
    }>;
    questions: Array<{
      id: string;
      stem: string;
      options?: Array<{ code: string; text: string }>;
    }>;
  };
  const reportItems = [...reportSource.demographics, ...reportSource.questions];
  const answerRows = Object.entries(reportAnswers).map(([qid, answer]) => {
    const item = reportItems.find((candidate) => candidate.id === qid);
    const selectedOptions = (answer.option_codes || []).map(
      (code) => item?.options?.find((option) => option.code === code)?.text || code,
    );
    const values = [
      selectedOptions.join(", "),
      answer.text_value,
      answer.other_text,
      answer.extra_text,
    ].filter(Boolean);
    return {
      qid,
      question: item?.stem || qid,
      answer: values.join(" — ") || "ບໍ່ໄດ້ລະບຸ",
    };
  });
  const scoreRows = Object.entries(report.score_details?.scores ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([cluster, score]) => ({
      cluster,
      label: SCORE_LABELS[cluster] ?? cluster,
      percent: Math.round(Math.max(0, Math.min(1, score)) * 100),
    }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Context */}
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 animate-fade-in-scale">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8]/60 text-xs sm:text-sm text-[#2D4C3E]/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#2D4C3E]">Next-path</span>
            <span>•</span>
            <span>ພາບລວມຄວາມສາມາດ (Report)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{report.context_factors.age_years != null ? `${report.context_factors.age_years} ປີ` : report.context_factors.age_band || "ອາຍຸ 15+"}</span>
            <span>•</span>
            <span>{provinceLabel}</span>
          </div>
        </div>

        {topPath && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2EE] border border-[#2D4C3E]/20 text-[#2D4C3E] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
            <span>ຈຸດເລີ່ມຕົ້ນທີ່ພົບ: {topPath.label_lao}</span>
          </div>
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E] tracking-tight">
            ຄວາມສາມາດ ແລະ ທິດທາງທີ່ເລືອກສຳຫຼວດໄດ້
          </h1>
          <p className="text-sm sm:text-base text-[#2D4C3E]/80 mt-2 leading-relaxed">
            {report.summary_text}
          </p>
        </div>

        {/* Action Buttons: AI Prompt Modal, Print, Share, Download, Reset */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] text-xs sm:text-sm font-semibold hover:bg-[#233c31] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.985]"
          >
            <MessageSquare className="w-4 h-4 text-[#E5E1D8]" />
            <span>ນຳພາບລວມໄປຄຸຍກັບ AI</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#8D5B28]" />
            <span>ພິມລາຍງານ (Print)</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#2D4C3E]" /> : <Share2 className="w-4 h-4 text-[#8D5B28]" />}
            <span>{copiedLink ? "ຄັດລອກລິ້ງແລ້ວ" : "ແບ່ງປັນ"}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs sm:text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8D5B28]" />
            <span>{downloading ? "ກຳລັງດາວໂຫລດ..." : "ບັນທຶກພາບລວມ"}</span>
          </button>

          <button
            onClick={handleStartNew}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#7A3E2D] hover:bg-[#FDF3F0] transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ເລີ່ມຕົ້ນໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none border-b border-[#E5E1D8]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#2D4C3E] text-[#F9F8F5] shadow-xs"
                    : "bg-[#FFFFFF] border border-[#E5E1D8] text-[#2D4C3E]/80 hover:bg-[#F4EFEA]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 0: Overview & Signals */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E] mb-2">
                  ຮູບແບບຄວາມສົນໃຈ ແລະ ທ່າແຮງ (Interest Patterns)
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 leading-relaxed">
                  ສັນຍານເຫຼົ່ານີ້ມາຈາກກິດຈະກຳທີ່ເຈົ້າເລືອກວ່າເຮັດແລ້ວມີຄວາມສຸກ ແລະ ຮູ້ສຶກເປັນຕົວຂອງຕົວເອງ:
                </p>
              </div>

              <div className="bg-[#F9F8F5] border border-[#E5E1D8] rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="max-w-2xl mb-4">
                  <h3 className="font-bold text-sm sm:text-base text-[#2D4C3E]">
                    🧭 ບໍລິບົດຈາກຄຳຕອບທີ່ນຳມາອ່ານຮ່ວມກັບຜົນ
                  </h3>
                  <p className="text-xs text-[#2D4C3E]/70 mt-1 leading-relaxed">
                    ສ່ວນນີ້ສະແດງຄຳຕອບ ແລະ ບໍລິບົດຈິງຂອງເຈົ້າ. ພາບລວມນີ້ເປັນຈຸດເລີ່ມຕົ້ນໃຫ້ຄິດຕໍ່ ບໍ່ແມ່ນຄະແນນ ຫຼື ຄຳຕັດສິນ.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contextRows.map((row) => (
                    <div key={row.label} className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8]">
                      <span className="block text-[11px] font-semibold text-[#695F4F]">{row.label}</span>
                      <strong className="block mt-1 text-xs sm:text-sm text-[#2D4C3E] leading-relaxed">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {scoreRows.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#2D4C3E]">
                      ສັນຍານຈາກຄຳຕອບຂອງເຈົ້າ
                    </h3>
                    <p className="text-xs text-[#2D4C3E]/70 mt-1 leading-relaxed">
                      ຕົວເລກນີ້ແມ່ນຄ່າສັນຍານ 0–100 ຈາກຄຳຕອບ ບໍ່ແມ່ນຄະແນນສອບ ຫຼື ການຕັດສິນອາຊີບ.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scoreRows.map((row) => (
                      <div key={row.cluster} className="space-y-2">
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <span className="font-semibold text-[#2D4C3E] leading-relaxed">
                            {row.label}
                          </span>
                          <span className="font-bold text-[#8D5B28] tabular-nums shrink-0">
                            {row.percent}%
                          </span>
                        </div>
                        <div
                          role="meter"
                          aria-label={`${row.label}: ${row.percent}%`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={row.percent}
                          className="h-2.5 rounded-full bg-[#E5E1D8] overflow-hidden"
                        >
                          <div
                            className="h-full rounded-full bg-[#8D5B28] transition-[width] duration-500 motion-reduce:transition-none"
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Patterns */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
                  <Layers className="w-3.5 h-3.5 text-[#2D4C3E]" />
                  <span>ຮູບແບບຄວາມຄິດ ແລະ ທັກສະ (Identified Patterns)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ຈຸດເຊື່ອມໂຍງລະຫວ່າງສິ່ງທີ່ເຈົ້າສົນໃຈ, ວິທີຄິດ ແລະ ສະພາບແວດລ້ອມ
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.response_pattern && report.response_pattern.length > 0 ? (
                  report.response_pattern.map((pattern: ReportPattern, idx: number) => (
                    <div
                      key={pattern.pattern_id || idx}
                      className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] hover:border-[#2D4C3E] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="inline-block text-[11px] font-bold text-[#695F4F] px-2.5 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5E1D8] mb-2.5">
                          {pattern.section}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#2D4C3E] leading-snug">
                          {pattern.label_lao}
                        </h3>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] col-span-2 text-xs text-[#2D4C3E]/70">
                    ບໍ່ພົບຮູບແບບສະເພາະ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Possible Paths */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7EFE3] text-[#8D5B28] text-xs font-semibold mb-2">
                  <Compass className="w-3.5 h-3.5 text-[#8D5B28]" />
                  <span>ທິດທາງ ແລະ ໂອກາດສຳຫຼວດໃນລາວ</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ທາງເລືອກທີ່ສອດຄ່ອງກັບຈຸດພິເສດຂອງເຈົ້າ
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                  ແຕ່ລະສາຍມີສັນຍານ, ຄວາມເປັນໄປໄດ້ ແລະ ເງື່ອນໄຂປະກອບໃຫ້ສຳຫຼວດ. ບໍ່ແມ່ນຄຳຕັດສິນອາຊີບ ຫຼື ຄວາມນ່າຈະເປັນ:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.possible_paths && report.possible_paths.length > 0 ? (
                  report.possible_paths.map((path: ReportPath, idx: number) => (
                    <div
                      key={path.group_id || idx}
                      className="p-5 sm:p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] hover:border-[#2D4C3E] hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#EBF2EE] text-[#2D4C3E] mb-2.5">
                          ທາງເລືອກທີ {idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-[#2D4C3E] leading-snug">
                          {path.label_lao}
                        </h3>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[#2D4C3E]/75">
                          <div className="rounded-lg bg-white border border-[#E5E1D8] p-2">
                            <span className="block">ຄວາມເໝາະສົມ</span>
                            <strong className="text-[#8D5B28]">{path.compatibility_score ?? "—"}%</strong>
                          </div>
                          <div className="rounded-lg bg-white border border-[#E5E1D8] p-2">
                            <span className="block">ສັນຍານ</span>
                            <strong className="text-[#8D5B28]">{path.fit_score ?? "—"}%</strong>
                          </div>
                          <div className="rounded-lg bg-white border border-[#E5E1D8] p-2">
                            <span className="block">ໄປຕໍ່ໄດ້</span>
                            <strong className="text-[#8D5B28]">{path.feasibility_score ?? "—"}%</strong>
                          </div>
                        </div>
                        {path.reasons_lao?.length ? (
                          <p className="mt-3 text-xs text-[#2D4C3E]/80 leading-relaxed">
                            {path.reasons_lao.join(" ")}
                          </p>
                        ) : null}
                        {path.conditions_lao?.length ? (
                          <p className="mt-2 text-xs text-[#7A3E2D]/80 leading-relaxed">
                            <span className="font-semibold">ເງື່ອນໄຂ: </span>
                            {path.conditions_lao.join(" ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] col-span-3 text-xs text-[#2D4C3E]/70">
                    ບໍ່ພົບເສັ້ນທາງສະເພາະ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Unknowns & Tensions */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF3F0] text-[#7A3E2D] text-xs font-semibold mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#7A3E2D]" />
                  <span>ສິ່ງທີ່ຍັງເປີດກວ້າງ ແລະ ຄຳຖາມປາຍເປີດ</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ສິ່ງທີ່ຍັງບໍ່ຈຳເປັນຕ້ອງມີຄຳຕອບໃນຕອນນີ້
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                  ຄວາມບໍ່ແນ່ໃຈຄືໂອກາດໃນການຄົ້ນຫາ ບໍ່ແມ່ນຄວາມອ່ອນແອ ຫຼື ຂໍ້ຜິດພາດ.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-3">
                <h3 className="text-sm font-bold text-[#2D4C3E] flex items-center gap-2">
                  <span>✦</span>
                  <span>ພື້ນທີ່ທີ່ເຈົ້າສາມາດຄົ້ນຫາຕໍ່ໄດ້:</span>
                </h3>
                {report.unknowns && report.unknowns.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-[#2D4C3E]/85 list-disc list-inside leading-relaxed pl-1">
                    {report.unknowns.map((u: string, idx: number) => (
                      <li key={idx} className="font-medium">{u}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#2D4C3E]/70">
                    ບໍ່ມີສິ່ງທີ່ຍັງບໍ່ແນ່ໃຈສະເພາະ
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Micro-experiments */}
        {activeTab === 4 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[#8D5B28] text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
                  <span>ການທົດລອງນ້ອຍໆສຳລັບອາທິດນີ້ (Micro-experiments)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ລອງເຮັດສິ່ງເຫຼົ່ານີ້ ໂດຍບໍ່ມີຄວາມກົດດັນ
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                  ການລົງມືເຮັດຕົວຈິງ 20-30 ນາທີ ຈະຊ່ວຍຕອບຄຳຖາມໃນໃຈໄດ້ດີກວ່າການນັ່ງຄິດຄົນດຽວ:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#2D4C3E] block mb-1">
                      1. ສົນທະນາສັ້ນໆ (15 ນາທີ)
                    </span>
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                      ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ເຈົ້າສົນໃຈ ຖາມກ່ຽວກັບວຽກປະຈຳວັນຕົວຈິງ.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#8D5B28] block mb-1">
                      2. ທົດລອງເຮັດຈິງ (1 ອາທິດ)
                    </span>
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                      ລອງເຮັດໂປຣເຈັກນ້ອຍໆ 1 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍສັ້ນໆ ເພື່ອສຳຜັດເນື້ອຫາແທ້.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#7A3E2D] block mb-1">
                      3. ສັງເກດຕົວຈິງ (Field Observation)
                    </span>
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                      ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ, ງານວາງສະແດງ ຫຼື ງານອາສາສະໝັກໃນຊຸມຊົນ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Family Bridge */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-semibold mb-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#2D4C3E]" />
                  <span>ຂົວເຊື່ອມຕໍ່ຄວາມເຂົ້າໃຈກັບຄອບຄົວ (Family Bridge)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ວິທີເລົ່າໃຫ້ພໍ່ແມ່ ແລະ ຄອບຄົວເຂົ້າໃຈຢ່າງສະບາຍໃຈ
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                  ພໍ່ແມ່ສ່ວນໃຫຍ່ເປັນຫ່ວງເລື່ອງ &quot;ຄວາມໝັ້ນຄົງ ແລະ ອະນາຄົດ&quot;. ນີ້ແມ່ນຄຳແນະນຳໃນການສື່ສານ:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <h3 className="font-bold text-sm text-[#2D4C3E]">
                    1. ເລີ່ມຕົ້ນດ້ວຍຄວາມຂອບໃຈ ແລະ ຮັບຟັງຄວາມເປັນຫ່ວງ
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                    ບອກພໍ່ແມ່ວ່າ: &quot;ລູກເຂົ້າໃຈວ່າພໍ່ແມ່ເປັນຫ່ວງ ແລະ ຢາກໃຫ້ລູກມີອະນາຄົດທີ່ໝັ້ນຄົງ ລູກເລີຍໄດ້ລອງມາສຳຫຼວດທ່າແຮງຕົນເອງໃນ Next-path ເພື່ອຫາທາງເລືອກທີ່ດີທີ່ສຸດ&quot;.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <h3 className="font-bold text-sm text-[#8D5B28]">
                    2. ອະທິບາຍທິດທາງອາຊີບດ້ວຍມຸມມອງຄວາມໝັ້ນຄົງ
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                    ແທນທີ່ຈະບອກວ່າ &apos;ມັກສາຍນີ້ຍ້ອນມ່ວນ&apos;, ໃຫ້ບອກວ່າ: &apos;ສາຍນີ້ມີໂອກາດສ້າງລາຍຮັບ, ຕະຫຼາດແຮງງານໃນລາວກຳລັງຕ້ອງການ ແລະ ລູກມີທັກສະດ້ານນີ້ທີ່ເຮັດໄດ້ດີ&apos;.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <h3 className="font-bold text-sm text-[#7A3E2D]">
                    3. ສະເໜີແຜນການທົດລອງນ້ອຍໆ ກ່ອນໃຫ້ພໍ່ແມ່ຕັດສິນໃຈ
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
                    ຂໍໂອກາດລອງຮຽນຄອສສັ້ນໆ ຫຼື ທົດລອງເຮັດໂປຣເຈັກນ້ອຍໆ 1-2 ເດືອນ ເພື່ອພິສູດຄວາມຕັ້ງໃຈໃຫ້ຄອບຄົວເຫັນກ່ອນລົງທຶນຮຽນຕໍ່.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Review answers */}
        {activeTab === 6 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2D4C3E]">
                  ກວດຄືນຄຳຕອບຂອງເຈົ້າ
                </h2>
                <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1">
                  ລອງອ່ານຄຳຕອບຂອງເຈົ້າຄືນ. ມັນຊ່ວຍໃຫ້ເຫັນວ່າ ພາບລວມນີ້ເກີດຈາກສິ່ງໃດ ແລະ ຈຸດໃດທີ່ຢາກຄົ້ນຫາຕໍ່.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#F9F8F5] border border-[#E5E1D8] space-y-2">
                  <span className="font-bold text-[#2D4C3E] block">ຄຳຕອບຂອງເຈົ້າ:</span>
                  {answerRows.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2 text-xs text-[#2D4C3E]/80">
                      {answerRows.map((row) => (
                        <div key={row.qid} className="leading-relaxed">
                          <span className="font-semibold">{row.question}</span>: {row.answer}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#2D4C3E]/70">
                      ບໍ່ພົບຄຳຕອບທີ່ຍັງຢູ່ໃນອຸປະກອນ. ພາບລວມດ້ານເທິງຍັງສາມາດອ່ານເພື່ອຄິດຕໍ່ໄດ້.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUPERCHARGED AI PROMPT MASTER BOX */}
      <div className="mt-12 p-6 sm:p-9 rounded-3xl bg-[#2D4C3E] text-[#F9F8F5] space-y-6 shadow-md border border-[#233c31]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E5E1D8]">
            <Sparkles className="w-4 h-4 text-[#8D5B28]" />
            <span>ນຳພາບລວມໄປປຶກສາ AI ຕໍ່</span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            ນຳພາບລວມໄປປຶກສາ AI ຕໍ່
          </h3>
          <p className="text-xs sm:text-sm text-[#F9F8F5]/85 max-w-2xl leading-relaxed">
            ລະບົບ Next-path ໄດ້ຮວບຮວມຄຳຕອບຕົວຈິງ ແລະ ພາບລວມຂອງທ່ານ ເປັນຂໍ້ຄວາມທີ່ພ້ອມນຳໄປປຶກສາ ChatGPT, Claude ຫຼື Gemini ຕໍ່ໄດ້ທັນທີ.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-[#F9F8F5] text-[#2D4C3E] font-bold text-sm sm:text-base hover:bg-[#FFFFFF] transition-all flex items-center gap-3 cursor-pointer shadow-md active:scale-[0.985]"
          >
            <MessageSquare className="w-5 h-5 text-[#8D5B28]" />
            <span>ຄັດລອກພາບລວມໄປຖາມ AI ຕໍ່</span>
          </button>
        </div>
      </div>

      {/* AI Prompt Modal */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        markdownContent={aiPromptText}
      />
    </div>
  );
}
