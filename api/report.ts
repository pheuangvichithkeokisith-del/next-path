import type { ReportResponse } from "@/types/report";

export type { ReportResponse };

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export const SAMPLE_REPORT: ReportResponse = {
  response_pattern: [
    {
      section: "interests",
      pattern_id: "P-01",
      label_lao: "ຄວາມສົນໃຈດ້ານເທັກໂນໂລຊີ ແລະ ການສ້າງສັນຜົນງານ",
      is_sample: false,
    },
    {
      section: "work_style",
      pattern_id: "P-02",
      label_lao: "ມັກການວິເຄາະ ແກ້ໄຂບັນຫາ ແລະ ທົດລອງເຮັດຕົວຈິງ",
      is_sample: false,
    },
    {
      section: "values",
      pattern_id: "P-03",
      label_lao: "ໃຫ້ຄຸນຄ່າກັບຄວາມຊ່ຽວຊານ ແລະ ການພັດທະນາຕົນເອງ",
      is_sample: false,
    },
  ],
  possible_paths: [
    { group_id: "C1", label_lao: "ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ", is_sample: false },
    { group_id: "C2", label_lao: "ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ", is_sample: false },
    { group_id: "C3", label_lao: "ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ", is_sample: false },
    { group_id: "C6", label_lao: "ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ", is_sample: false },
  ],
  context_factors: {
    age_band: "18–20 ປີ",
    province_code: "ນະຄອນຫຼວງວຽງຈັນ",
    has_constraints: false,
  },
  unknowns: [
    "Q21 (ຮູບແບບສະຖານທີ່ເຮັດວຽກໃນອະນາຄົດ)",
    "Q26 (ຄວາມພ້ອມໃນການຮຽນຮູ້ໄລຍະຍາວ)",
  ],
  versions: {
    ds: "stub-0",
    enc: "enc-0",
    form: "v0.9.1",
  },
  summary_text:
    "ຄຳຕອບຂອງທ່ານສະທ້ອນຄວາມໂດດເດັ່ນໃນດ້ານການຄິດວິເຄາະ ແລະ ຄວາມສົນໃຈຕໍ່ເທັກໂນໂລຊີ. ທ່ານມັກການຮຽນຮູ້ແບບລົງມືເຮັດ ແລະ ພ້ອມທີ່ຈະທົດລອງວິທີໃໝ່ໆ.",
  template_id: "reflection-open-c1",
  ai_version: "mock-0",
};

export async function getReport(sessionId: string): Promise<ReportResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/sessions/${sessionId}/report`, {
      cache: "no-store",
    });
    if (response.ok) {
      return (await response.json()) as ReportResponse;
    }
  } catch {
    // Offline / Standalone fallback
  }
  return SAMPLE_REPORT;
}

export async function downloadExport(
  sessionId: string,
  format: "json" | "md",
): Promise<Blob> {
  try {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/sessions/${sessionId}/export?format=${format}`,
      { cache: "no-store" },
    );
    if (response.ok) {
      return await response.blob();
    }
  } catch {
    // Offline / Standalone export fallback
  }

  if (format === "json") {
    const jsonStr = JSON.stringify(SAMPLE_REPORT, null, 2);
    return new Blob([jsonStr], { type: "application/json" });
  }

  const mdStr = `# PATHAI Reflection Report
**Form Version**: ${SAMPLE_REPORT.versions.form}
**Summary**: ${SAMPLE_REPORT.summary_text}

## Response Patterns
${SAMPLE_REPORT.response_pattern.map((p: { section: string; label_lao: string }) => `- [${p.section}] ${p.label_lao}`).join("\n")}

## Possible Paths
${SAMPLE_REPORT.possible_paths.map((p: { group_id: string; label_lao: string }) => `- ${p.group_id}: ${p.label_lao}`).join("\n")}

## Context Factors
- Age: ${SAMPLE_REPORT.context_factors.age_band ?? "N/A"}
- Province: ${SAMPLE_REPORT.context_factors.province_code ?? "N/A"}

## Unknowns (Exploration Opportunities)
${SAMPLE_REPORT.unknowns.map((u: string) => `- ${u}`).join("\n")}
`;
  return new Blob([mdStr], { type: "text/markdown" });
}
