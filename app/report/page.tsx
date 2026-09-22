"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadExport, getReport } from "@/api/report";
import type { ReportResponse, ReportPattern, ReportPath } from "@/types/report";
import { isSessionNotFound } from "@/api/errors";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { UI_COPY } from "@/content/copy";
import { clearSessionId, useSessionId } from "@/hooks/useSession";

export default function ReportPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!resolved) return;
    if (!sessionId) {
      router.replace("/introduction");
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
          router.replace("/introduction");
        } else {
          setHasError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [resolved, sessionId, router]);

  async function handleCopyMarkdown(): Promise<void> {
    if (!report) return;
    const text = `# PATHAI Reflection Report
**Form Version**: ${report.versions.form}
**Summary**: ${report.summary_text}

## 1. Response Patterns (ຮູບແບບທີ່ພົບ)
${report.response_pattern.map((p: ReportPattern) => `- [${p.section}] ${p.label_lao}`).join("\n")}

## 2. Possible Paths (ເສັ້ນທາງສຳຫຼວດ)
${report.possible_paths.map((p: ReportPath) => `- ${p.group_id}: ${p.label_lao}`).join("\n")}

## 3. Context Factors (ປັດໃຈບໍລິບົດ)
- Age: ${report.context_factors.age_band ?? "N/A"}
- Province: ${report.context_factors.province_code ?? "N/A"}
- Has Constraints: ${report.context_factors.has_constraints ? "Yes" : "No"}

## 4. Unknowns (ສິ່ງທີ່ຍັງເປີດໄວ້ສຳຫຼວດ)
${report.unknowns.length > 0 ? report.unknowns.map((u: string) => `- ${u}`).join("\n") : "- None"}

## 5. Try Before Decide (ລອງກ່ອນຕັດສິນໃຈ)
- ລົມກັບຄົນທີ່ເຮັດວຽກໃນສາຍທີ່ສົນໃຈ (Informational Interview)
- ລອງໂປຣເຈັກນ້ອຍໆ ຫຼື ຄອສສັ້ນໆ 1–2 ອາທິດ
- ຝຶກງານໄລຍະສັ້ນ ຫຼື ເຂົ້າຮ່ວມກິດຈະກຳຊຸມຊົນ

---
*Disclaimer: ${UI_COPY.report.disclaimer}*
`;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Fallback
    }
  }

  async function handleDownloadJson(): Promise<void> {
    if (!sessionId) return;
    setDownloading(true);
    try {
      const blob = await downloadExport(sessionId, "json");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pathai-report-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (hasError) {
    return (
      <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <ErrorBanner onRetry={() => router.refresh()} />
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Loading className="h-40" />
          <Loading className="h-64" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#FAF9F5] px-4 py-8 sm:py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header and Summary */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-medium">
            <span>ພື້ນທີ່ສະທ້ອນຄວາມຄິດ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 leading-snug">
            {UI_COPY.report.header}
          </h1>

          <div className="card-calm bg-white border-stone-200 p-5 sm:p-6 text-stone-800">
            <p className="text-base sm:text-lg leading-relaxed font-medium text-stone-900">
              {report.summary_text}
            </p>
          </div>
        </div>

        {/* Section 1: Response Patterns */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
            {UI_COPY.report.s1}
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {report.response_pattern.length > 0 ? (
              report.response_pattern.map((pattern: ReportPattern) => (
                <div
                  key={pattern.pattern_id}
                  className="card-calm p-4 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                      {pattern.section}
                    </span>
                    <p className="text-base font-medium text-stone-900 mt-0.5">
                      {pattern.label_lao}
                    </p>
                  </div>
                  {pattern.is_sample ? (
                    <span className="text-xs text-stone-400">({UI_COPY.report.sample})</span>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">{UI_COPY.report.noPatterns}</p>
            )}
          </div>
        </section>

        {/* Section 2: Possible Paths (No ranking, No scores) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
            {UI_COPY.report.s2}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            ທິດທາງເຫຼົ່ານີ້ເປັນທາງເລືອກໃຫ້ທ່ານສຳຫຼວດຕໍ່ ບໍ່ມີການຈັດອັນດັບ ຫຼື ຄະແນນ
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.possible_paths.length > 0 ? (
              report.possible_paths.map((path: ReportPath) => (
                <div
                  key={path.group_id}
                  className="card-calm p-4 hover:border-stone-400 transition"
                >
                  <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-bold mb-2">
                    {path.group_id}
                  </span>
                  <p className="text-base font-medium text-stone-900">
                    {path.label_lao}
                  </p>
                  {path.is_sample ? (
                    <span className="text-xs text-stone-400 mt-1 block">({UI_COPY.report.sample})</span>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">{UI_COPY.report.noPaths}</p>
            )}
          </div>
        </section>

        {/* Section 3: Context Factors */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
            {UI_COPY.report.s3}
          </h2>

          <div className="card-calm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-stone-500 block">{UI_COPY.report.ageBand}</span>
              <span className="font-medium text-stone-900">
                {report.context_factors.age_band ?? "ບໍ່ໄດ້ລະບຸ"}
              </span>
            </div>
            <div>
              <span className="text-xs text-stone-500 block">{UI_COPY.report.province}</span>
              <span className="font-medium text-stone-900">
                {report.context_factors.province_code ?? "ບໍ່ໄດ້ລະບຸ"}
              </span>
            </div>
          </div>
        </section>

        {/* Section 4: Unknowns (Value not weakness) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
            {UI_COPY.report.s4}
          </h2>
          <div className="rounded-2xl bg-stone-100/80 border border-stone-200 p-4 text-sm text-stone-700 leading-relaxed">
            <p className="font-medium text-stone-900 mb-1">
              ✦ {UI_COPY.report.s4Desc}
            </p>
            {report.unknowns.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs sm:text-sm text-stone-600 list-disc list-inside">
                {report.unknowns.map((u: string, i: number) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 mt-1">{UI_COPY.report.noUnknowns}</p>
            )}
          </div>
        </section>

        {/* Section 5: Try Before Decide */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span>
            {UI_COPY.report.s5}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">{UI_COPY.report.s5Desc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-calm p-4">
              <span className="text-xs font-semibold text-stone-500 block mb-1">1. ສົນທະນາ</span>
              <p className="text-sm text-stone-800">
                ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ທ່ານສົນໃຈ
              </p>
            </div>
            <div className="card-calm p-4">
              <span className="text-xs font-semibold text-stone-500 block mb-1">2. ທົດລອງນ້ອຍໆ</span>
              <p className="text-sm text-stone-800">
                ລົງມືເຮັດໂປຣເຈັກສັ້ນໆ 1–2 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍ
              </p>
            </div>
            <div className="card-calm p-4">
              <span className="text-xs font-semibold text-stone-500 block mb-1">3. ສັງເກດຕົວຈິງ</span>
              <p className="text-sm text-stone-800">
                ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ ຫຼື ງານອາສາສະໝັກ
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="border-t border-stone-200/80 pt-6">
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed text-center sm:text-left">
            {UI_COPY.report.disclaimer}
          </p>
        </div>

        {/* Section 7: Handoff & Export Area */}
        <div className="card-calm bg-stone-900 text-white p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">
            {UI_COPY.report.export}
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            ທ່ານສາມາດຄັດລອກບົດສະຫຼຸບນີ້ໄປສົນທະນາຕໍ່ກັບ AI ອື່ນ (ເຊັ່ນ ChatGPT, Claude, Gemini) ຫຼື ໃຊ້ປຶກສາກັບອາຈານ ແລະ ຄອບຄົວໄດ້ຢ່າງອິດສະຫຼະ
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="btn-primary bg-white text-stone-900 hover:bg-stone-100 text-sm py-2.5 px-4"
              onClick={handleCopyMarkdown}
              type="button"
            >
              {copySuccess ? `✓ ${UI_COPY.report.copyMarkdownSuccess}` : UI_COPY.report.copyMarkdown}
            </button>

            <button
              className="btn-secondary bg-stone-800 text-white border-stone-700 hover:bg-stone-700 text-sm py-2.5 px-4"
              disabled={downloading}
              onClick={handleDownloadJson}
              type="button"
            >
              {downloading ? "ກຳລັງດາວໂຫຼດ..." : UI_COPY.report.downloadJson}
            </button>
          </div>
        </div>

        {/* Next step to feedback */}
        <div className="pt-4 flex justify-center">
          <button
            className="btn-primary text-base shadow-sm"
            onClick={() => router.push("/feedback")}
            type="button"
          >
            {UI_COPY.report.goToFeedback} →
          </button>
        </div>
      </div>
    </main>
  );
}
