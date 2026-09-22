"use client";

import OptionList from "./OptionList";
import type { DraftAnswer, FormItem } from "@/types/form";

export type QuestionProps = {
  item: FormItem;
  answer: DraftAnswer;
  onChange: (changes: Partial<DraftAnswer>) => void;
};

export default function Question({ item, answer, onChange }: QuestionProps) {
  return (
    <section aria-labelledby={`${item.id}-stem`} className="space-y-4">
      {/* Category / Section badge */}
      {item.section_lao ? (
        <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold tracking-wide">
          {item.section_lao}
        </span>
      ) : null}

      {/* Main Question Stem */}
      <h2
        className="break-words text-xl sm:text-2xl font-semibold leading-snug text-stone-900"
        id={`${item.id}-stem`}
      >
        {item.stem}
      </h2>

      {/* Note / Context if available */}
      {item.note ? (
        <p className="text-sm leading-relaxed text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
          {item.note}
        </p>
      ) : null}

      {/* Interaction input (Text input or Option list) */}
      {item.type === "text" ? (
        <div className="mt-6">
          <input
            className="min-h-[52px] w-full rounded-2xl border border-stone-300 bg-white px-4 text-base text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 transition shadow-xs"
            onChange={(event) => onChange({ text_value: event.target.value })}
            placeholder="ພິມຄຳຕອບຂອງທ່ານ (ເຊັ່ນ: ມ.6, ປວສ., ມະຫາວິທະຍາໄລ)..."
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
        />
      )}

      {/* Optional extra text input (e.g. Q7) */}
      {item.extra_text ? (
        <div className="mt-4 pt-2">
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            {item.extra_text.placeholder || "ເລົ່າສັ້ນໆ (ບໍ່ບັງຄັນ)"}
          </label>
          <input
            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 transition"
            onChange={(event) => onChange({ extra_text: event.target.value })}
            placeholder={item.extra_text.placeholder}
            type="text"
            value={answer.extra_text ?? ""}
          />
        </div>
      ) : null}
    </section>
  );
}
