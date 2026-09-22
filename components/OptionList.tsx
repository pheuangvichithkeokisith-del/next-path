"use client";

import type { FormItem } from "@/types/form";

export type OptionListProps = {
  item: FormItem;
  selectedCodes: string[];
  otherText: string | null;
  onCodesChange: (codes: string[]) => void;
  onOtherTextChange: (value: string | null) => void;
};

export function nextSelection(
  item: FormItem,
  selectedCodes: string[],
  code: string,
): string[] {
  const options = item.options ?? [];
  const targetOption = options.find((opt) => opt.code === code);
  const exclusiveCodes = new Set(
    options.filter((option) => option.exclusive).map((option) => option.code),
  );

  if (item.type === "single") {
    return [code];
  }

  // If clicking on already selected option, toggle it off
  if (selectedCodes.includes(code)) {
    return selectedCodes.filter((selected) => selected !== code);
  }

  // If clicking an exclusive option, it clears all other options
  if (targetOption?.exclusive || exclusiveCodes.has(code)) {
    return [code];
  }

  // If clicking normal option, remove any currently selected exclusive option
  const withoutExclusive = selectedCodes.filter(
    (selected) => !exclusiveCodes.has(selected),
  );

  // Check max_select constraint
  if (item.max_select !== undefined && withoutExclusive.length >= item.max_select) {
    return selectedCodes;
  }

  return [...withoutExclusive, code];
}

export default function OptionList({
  item,
  selectedCodes,
  otherText,
  onCodesChange,
  onOtherTextChange,
}: OptionListProps) {
  const options = item.options ?? [];

  function toggle(code: string): void {
    onCodesChange(nextSelection(item, selectedCodes, code));
  }

  return (
    <fieldset className="mt-6 space-y-2.5">
      <legend className="sr-only">{item.stem}</legend>

      {/* Helper text for multi-select */}
      {item.type === "multi" ? (
        <p className="text-xs text-stone-500 mb-2">
          {item.max_select
            ? `(ເລືອກແລ້ວ ${selectedCodes.length}/${item.max_select} ຂໍ້${
                item.min_select ? `, ຢ່າງໜ້ອຍ ${item.min_select} ຂໍ້` : ""
              })`
            : item.min_select
            ? `(ເລືອກຢ່າງໜ້ອຍ ${item.min_select} ຂໍ້)`
            : "(ເລືອກໄດ້ຫຼາຍຂໍ້)"}
        </p>
      ) : null}

      {options.map((option) => {
        const selected = selectedCodes.includes(option.code);
        const disabled =
          item.type === "multi" &&
          !selected &&
          !option.exclusive &&
          item.max_select !== undefined &&
          selectedCodes.filter((c) => !options.find((o) => o.code === c)?.exclusive)
            .length >= item.max_select;

        return (
          <label
            className={`flex min-h-[52px] cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 ${
              selected
                ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                : "border-stone-200/90 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50/50"
            } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
            key={option.code}
          >
            <div className="pt-0.5 shrink-0">
              <input
                checked={selected}
                className={`h-5 w-5 shrink-0 rounded-full border cursor-pointer ${
                  selected
                    ? "accent-white text-stone-900 border-white"
                    : "accent-stone-900 border-stone-300"
                }`}
                disabled={disabled}
                name={item.id}
                onChange={() => toggle(option.code)}
                type={item.type === "single" ? "radio" : "checkbox"}
                value={option.code}
              />
            </div>
            <span
              className={`break-words text-base leading-relaxed ${
                selected ? "text-white font-medium" : "text-stone-800"
              }`}
            >
              {option.text}
            </span>
          </label>
        );
      })}

      {/* 'Other' text input if selected */}
      {options
        .filter((option) => option.has_other && selectedCodes.includes(option.code))
        .map((option) => (
          <div key={`${option.code}-other`} className="pt-2">
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              ກະລຸນາລະບຸເພີ່ມເຕີມ:
            </label>
            <input
              className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 transition"
              onChange={(event) => onOtherTextChange(event.target.value)}
              placeholder="ພິມຄຳຕອບຂອງທ່ານທີ່ນີ້..."
              type="text"
              value={otherText ?? ""}
            />
          </div>
        ))}
    </fieldset>
  );
}
