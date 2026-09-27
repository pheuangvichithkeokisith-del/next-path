"use client";

import React from "react";
import OptionList from "./OptionList";
import type { DraftAnswer, FormItem } from "@/types/form";

export type QuestionProps = {
  item: FormItem;
  answer: DraftAnswer;
  onChange: (changes: Partial<DraftAnswer>) => void;
  validationMessage?: string;
};

export default function Question({ item, answer, onChange, validationMessage }: QuestionProps) {
  const isDemographic = item.id.startsWith("D");
  const headingId = `${item.id}-heading`;
  const validationId = `${item.id}-validation`;
  const hasValidation = Boolean(validationMessage);

  return (
    <div
      id={`question-${item.id}`}
      aria-labelledby={headingId}
      aria-describedby={hasValidation ? validationId : undefined}
      tabIndex={hasValidation ? -1 : undefined}
      className={hasValidation
        ? "scroll-mt-32 p-5 sm:p-7 rounded-2xl bg-white border-2 border-[#C7836F] shadow-[0_0_0_4px_rgba(199,131,111,0.12)]"
        : "scroll-mt-32 p-5 sm:p-7 rounded-2xl bg-white subtle-border transition-shadow duration-200 hover:shadow-2xs"}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-[#F3EFE7] text-[#695F4F] text-xs font-bold">
            {isDemographic ? item.id : `ຂໍ້ ${item.id.replace("Q", "")}`}
          </span>
          {item.section_lao && (
            <span className="text-xs text-[#8A8170] font-medium hidden sm:inline">
              · {item.section_lao}
            </span>
          )}
        </div>
      </div>

      {/* Main Question Stem */}
      <h3 id={headingId} className="text-base sm:text-lg font-bold leading-snug text-[#171A1F] mt-1">
        {item.stem}
      </h3>

      {hasValidation ? (
        <p
          id={validationId}
          className="mt-3 rounded-lg bg-[#FFF1ED] px-3 py-2 text-xs font-semibold leading-relaxed text-[#7A3E2D]"
        >
          {validationMessage}
        </p>
      ) : null}

      {/* Note / Context hint if available */}
      {item.note ? (
        <p className="mt-2 text-xs text-[#736A5B] italic bg-[#F8F6F1] p-2.5 rounded-lg border border-[#EAE6DC]">
          {item.note}
        </p>
      ) : null}

      {/* Province is intentionally a native select: it supports scrolling and keyboard type-ahead. */}
      {item.id === "D3" ? (
        <div className="mt-4 space-y-2">
          <label htmlFor="province-select" className="block text-sm font-semibold text-[#4D4537]">
            ເລືອກແຂວງ ຫຼື ນະຄອນຫຼວງ
          </label>
          <select
            id="province-select"
            name="province"
            aria-describedby={["province-help", hasValidation ? validationId : null].filter(Boolean).join(" ") || undefined}
            aria-invalid={hasValidation}
            className="province-select font-lao min-h-[50px] w-full rounded-xl subtle-border bg-[#FAF9F6] px-4 text-sm sm:text-base text-[#1A1E24] outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition cursor-pointer"
            onChange={(event) => onChange({ option_codes: event.target.value ? [event.target.value] : [] })}
            value={answer.option_codes[0] ?? ""}
          >
            <option value="" disabled>
              — ເລືອກແຂວງ —
            </option>
            {(item.options ?? []).map((option) => (
              <option key={option.code} value={option.code}>
                {option.text}
              </option>
            ))}
          </select>
          <p id="province-help" className="text-xs text-[#746C5F]">
            ເລື່ອນເບິ່ງລາຍຊື່ ຫຼື ພິມຕົວອັກສອນເພື່ອຄົ້ນຫາໄວຂຶ້ນ.
          </p>
        </div>
      ) : item.type === "text" ? (
        <div className="mt-4">
          <label htmlFor={`${item.id}-text`} className="block text-sm font-semibold text-[#4D4537] mb-2">
            ຄຳຕອບຂອງທ່ານ
          </label>
          <input
            id={`${item.id}-text`}
            name={item.id}
            aria-describedby={hasValidation ? validationId : undefined}
            aria-invalid={hasValidation}
            className="min-h-[48px] w-full rounded-xl subtle-border bg-[#FAF9F6] px-4 text-sm sm:text-base text-[#1A1E24] placeholder:text-[#746C5F] outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
            onChange={(event) => onChange({ text_value: event.target.value })}
            placeholder="ພິມຄຳຕອບຂອງທ່ານ..."
            type="text"
            value={answer.text_value ?? ""}
          />
        </div>
      ) : (
        <OptionList
          item={item}
          onCodesChange={(option_codes) => onChange({ option_codes })}
          onOtherTextChange={(other_text) => onChange({ other_text })}
          otherText={answer.other_text}
          selectedCodes={answer.option_codes}
          validationMessage={validationMessage}
        />
      )}

      {/* Optional extra text input (e.g. Q7) */}
      {item.extra_text ? (
        <div className="mt-4 pt-3 border-t border-[#F4F1EA]">
          <label htmlFor={`${item.id}-extra-text`} className="block text-xs font-semibold text-[#797061] mb-1.5">
            {item.extra_text.placeholder || "ເລົ່າສັ້ນໆ (ບໍ່ບັງຄັບ):"}
          </label>
          <input
            id={`${item.id}-extra-text`}
            aria-describedby={hasValidation ? validationId : undefined}
            aria-invalid={hasValidation}
            className="min-h-[46px] w-full rounded-xl subtle-border bg-[#FAF9F6] px-4 text-sm text-[#1A1E24] placeholder:text-[#746C5F] outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
            onChange={(event) => onChange({ extra_text: event.target.value })}
            placeholder={item.extra_text.placeholder}
            type="text"
            value={answer.extra_text ?? ""}
          />
        </div>
      ) : null}
    </div>
  );
}
