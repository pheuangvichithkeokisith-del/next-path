"use client";

import React from "react";
import OptionList from "./OptionList";
import ProvinceSelect from "./ProvinceSelect";
import EducationSelect from "./EducationSelect";
import type { DraftAnswer, FormItem } from "@/types/form";

export type QuestionProps = {
  item: FormItem;
  answer: DraftAnswer;
  onChange: (changes: Partial<DraftAnswer>) => void;
  validationMessage?: string;
  displayNumber?: number;
};

export default function Question({
  item,
  answer,
  onChange,
  validationMessage,
  displayNumber,
}: QuestionProps) {
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
      className={`scroll-mt-32 p-5 sm:p-7 rounded-2xl bg-[#FFFFFF] transition-all shadow-xs ${
        hasValidation
          ? "border-2 border-[#7A3E2D] ring-2 ring-[#7A3E2D]/20 bg-[#FDF3F0]/20"
          : "border border-[#E5E1D8] hover:border-[#CCC6B7]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-[#F4EFEA] text-[#8D5B28] text-xs font-bold">
            {isDemographic ? item.id : `ຂໍ້ ${displayNumber ?? item.id.replace("Q", "")}`}
          </span>
          <span className="text-xs text-[#7A3E2D] font-medium">* ຈຳເປັນ</span>
          {item.section_lao && (
            <span className="text-xs text-[#8D5B28] font-medium hidden sm:inline">
              · {item.section_lao}
            </span>
          )}
        </div>
      </div>

      {/* Main Question Stem */}
      <h3 id={headingId} className="text-base sm:text-lg font-bold leading-snug text-[#2D4C3E] mt-1">
        {item.stem}
      </h3>

      {hasValidation ? (
        <p
          id={validationId}
          className="mt-3 rounded-xl bg-[#FDF3F0] border border-[#7A3E2D]/30 px-3.5 py-2 text-xs font-semibold leading-relaxed text-[#7A3E2D]"
        >
          {validationMessage}
        </p>
      ) : null}

      {/* Note / Context hint if available */}
      {item.note ? (
        <p className="mt-2.5 text-xs text-[#2D4C3E]/75 bg-[#F9F8F5] p-3 rounded-xl border border-[#E5E1D8] leading-relaxed">
          {item.note}
        </p>
      ) : null}

      {/* Custom searchable demographic selectors */}
      {item.id === "D2" ? (
        <EducationSelect
          value={answer.text_value ?? ""}
          onChange={(text_value) => onChange({ text_value })}
          hasValidation={hasValidation}
          validationId={validationId}
        />
      ) : item.id === "D3" ? (
        <ProvinceSelect
          options={item.options ?? []}
          selectedCode={answer.option_codes[0]}
          onChange={(code) => onChange({ option_codes: code ? [code] : [] })}
          hasValidation={hasValidation}
          validationId={validationId}
        />
      ) : item.type === "text" ? (
        <div className="mt-4">
          <label htmlFor={`${item.id}-text`} className="block text-sm font-semibold text-[#2D4C3E] mb-2">
            ຄຳຕອບຂອງທ່ານ
          </label>
          <input
            id={`${item.id}-text`}
            name={item.id}
            aria-describedby={hasValidation ? validationId : undefined}
            aria-invalid={hasValidation}
            className="min-h-[48px] w-full rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 text-sm sm:text-base text-[#2D4C3E] placeholder:text-[#2D4C3E]/40 outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
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
        <div className="mt-4 pt-3 border-t border-[#E5E1D8]">
          <label htmlFor={`${item.id}-extra-text`} className="block text-xs font-semibold text-[#8D5B28] mb-1.5">
            {item.extra_text.placeholder || "ເລົ່າສັ້ນໆ (ບໍ່ບັງຄັບ):"}
          </label>
          <input
            id={`${item.id}-extra-text`}
            aria-describedby={hasValidation ? validationId : undefined}
            aria-invalid={hasValidation}
            className="min-h-[46px] w-full rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 text-sm text-[#2D4C3E] placeholder:text-[#2D4C3E]/40 outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
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
