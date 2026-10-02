"use client";

import React from "react";
import { Check } from "lucide-react";
import type { FormItem } from "@/types/form";

export type OptionListProps = {
  item: FormItem;
  selectedCodes: string[];
  otherText: string | null;
  onCodesChange: (codes: string[]) => void;
  onOtherTextChange: (value: string | null) => void;
  validationMessage?: string;
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
  validationMessage,
}: OptionListProps) {
  const options = item.options ?? [];
  const describedBy = [
    item.type === "multi" ? `${item.id}-selection-help` : null,
    validationMessage ? `${item.id}-validation` : null,
  ].filter(Boolean).join(" ") || undefined;

  function toggle(code: string): void {
    onCodesChange(nextSelection(item, selectedCodes, code));
  }

  return (
    <fieldset
      aria-labelledby={`${item.id}-heading`}
      aria-describedby={describedBy}
      className="mt-4 space-y-2.5"
    >
      <legend className="sr-only">{item.stem}</legend>

      {/* Helper text for multi-select */}
      {item.type === "multi" ? (
        <p id={`${item.id}-selection-help`} className="text-xs text-[#746C5F] font-medium mb-2">
          {item.max_select
            ? `(ເລືອກໄດ້ສູງສຸດ ${item.max_select} ຂໍ້${
                item.min_select ? `, ຢ່າງໜ້ອຍ ${item.min_select} ຂໍ້` : ""
              } · ເລືອກແລ້ວ ${selectedCodes.length}/${item.max_select})`
            : item.min_select
            ? `(ເລືອກຢ່າງໜ້ອຍ ${item.min_select} ຂໍ້ · ເລືອກແລ້ວ ${selectedCodes.length})`
            : `(ເລືອກໄດ້ຫຼາຍຂໍ້ · ເລືອກແລ້ວ ${selectedCodes.length})`}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option) => {
          const isSelected = selectedCodes.includes(option.code);
          const disabled =
            item.type === "multi" &&
            !isSelected &&
            !option.exclusive &&
            item.max_select !== undefined &&
            selectedCodes.filter((c) => !options.find((o) => o.code === c)?.exclusive)
              .length >= item.max_select;

          const inputId = `${item.id}-${option.code}`;

          return (
            <label
              key={option.code}
              htmlFor={inputId}
              className={`relative w-full min-h-[54px] text-left p-4 sm:p-4.5 rounded-2xl transition-all duration-150 flex items-start justify-between cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? "bg-[#EBF2EE] border-2 border-[#2D4C3E] text-[#2D4C3E] shadow-2xs font-medium"
                  : "bg-[#F9F8F5]/80 border border-[#E5E1D8] text-[#2D4C3E]/90 hover:bg-[#F4EFEA] hover:border-[#CCC6B7]"
              } ${disabled ? "opacity-40 cursor-not-allowed hover:bg-white hover:border-[#E5E1D8] active:scale-100" : ""}`}
            >
              <input
                id={inputId}
                name={item.id}
                type={item.type === "multi" ? "checkbox" : "radio"}
                value={option.code}
                checked={isSelected}
                disabled={disabled}
                onChange={() => toggle(option.code)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D4C3E] disabled:cursor-not-allowed"
                aria-describedby={describedBy}
                aria-invalid={validationMessage ? true : undefined}
              />
              <div className="pr-3.5 flex-1">
                <span className="text-sm sm:text-base font-medium leading-relaxed block">
                  {option.text}
                </span>
              </div>

              <div
                className={`w-5 h-5 ${item.type === "multi" ? "rounded-md" : "rounded-full"} shrink-0 mt-0.5 flex items-center justify-center border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#2D4C3E] border-[#2D4C3E] text-white scale-105"
                    : "border-[#C8C2B3] bg-white"
                }`}
              >
                {isSelected && (
                  item.type === "multi" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] animate-in fade-in zoom-in duration-150" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white animate-in fade-in zoom-in duration-150" />
                  )
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* 'Other' text input if selected */}
      {options
        .filter((option) => option.has_other && selectedCodes.includes(option.code))
        .map((option) => (
          <div key={`${option.code}-other`} className="pt-2">
            <label htmlFor={`${item.id}-${option.code}-other`} className="block text-xs font-semibold text-[#8D5B28] mb-1.5">
              ກະລຸນາລະບຸເພີ່ມເຕີມ:
            </label>
            <input
              id={`${item.id}-${option.code}-other`}
              aria-describedby={validationMessage ? `${item.id}-validation` : undefined}
              aria-invalid={validationMessage ? true : undefined}
              className="min-h-[46px] w-full rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 text-sm text-[#2D4C3E] placeholder:text-[#2D4C3E]/40 outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
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
