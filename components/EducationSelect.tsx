"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

type EducationOption = {
  value: string;
  search: string;
};

const EDUCATION_OPTIONS: EducationOption[] = [
  { value: "ກຳລັງຮຽນ — ປະຖົມສຶກສາ", search: "primary primary school" },
  { value: "ກຳລັງຮຽນ — ມັດທະຍົມຕອນຕົ້ນ", search: "lower secondary junior high" },
  { value: "ກຳລັງຮຽນ — ມັດທະຍົມຕອນປາຍ (ສາຍສາມັນ)", search: "upper secondary high school general" },
  { value: "ກຳລັງຮຽນ — ສາຍອາຊີວະ ຫຼື ເຕັກນິກ", search: "vocational technical TVET" },
  { value: "ກຳລັງຮຽນ — ວິທະຍາໄລ ຫຼື ຊັ້ນສູງ", search: "college higher technical diploma" },
  { value: "ກຳລັງຮຽນ — ປະລິນຍາຕີ", search: "bachelor university undergraduate" },
  { value: "ກຳລັງຮຽນ — ປະລິນຍາໂທ", search: "master postgraduate" },
  { value: "ກຳລັງຮຽນ — ປະລິນຍາເອກ", search: "doctorate doctoral phd" },
  { value: "ຮຽນຈົບແລ້ວ — ມັດທະຍົມຕອນປາຍ ຫຼື ທຽບເທົ່າ", search: "finished upper secondary high school" },
  { value: "ຮຽນຈົບແລ້ວ — ສາຍອາຊີວະ ຫຼື ເຕັກນິກ", search: "finished vocational technical TVET" },
  { value: "ຮຽນຈົບແລ້ວ — ວິທະຍາໄລ ຫຼື ຊັ້ນສູງ", search: "finished college higher technical diploma" },
  { value: "ຮຽນຈົບແລ້ວ — ປະລິນຍາຕີ", search: "finished bachelor university undergraduate" },
  { value: "ຮຽນຈົບແລ້ວ — ປະລິນຍາໂທ", search: "finished master postgraduate" },
  { value: "ຮຽນຈົບແລ້ວ — ປະລິນຍາເອກ", search: "finished doctorate doctoral phd" },
  { value: "ການສຶກສານອກລະບົບ ຫຼື ຝຶກອາຊີບ", search: "non-formal education continuing education training" },
  { value: "ຕອນນີ້ບໍ່ໄດ້ຮຽນ", search: "not currently studying gap year" },
];

interface EducationSelectProps {
  value: string;
  onChange: (value: string) => void;
  hasValidation?: boolean;
  validationId?: string;
}

export default function EducationSelect({
  value,
  onChange,
  hasValidation,
  validationId,
}: EducationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = EDUCATION_OPTIONS.find((option) => option.value === value);

  useEffect(() => {
    setIsOther(Boolean(value) && !selectedOption);
  }, [selectedOption, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return EDUCATION_OPTIONS;
    return EDUCATION_OPTIONS.filter(
      (option) =>
        option.value.toLowerCase().includes(query) || option.search.includes(query),
    );
  }, [search]);

  return (
    <div className="mt-4 space-y-2" ref={dropdownRef}>
      <label htmlFor="education-select-button" className="block text-sm font-semibold text-[#2D4C3E]">
        ເລືອກລະດັບການຮຽນ ຫຼື ສະຖານະການຮຽນຂອງທ່ານ
      </label>

      <div className="relative">
        <button
          id="education-select-button"
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={hasValidation ? validationId : undefined}
          aria-invalid={hasValidation}
          className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-xl border bg-[#F9F8F5] text-sm sm:text-base flex items-center justify-between gap-3 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#8D5B28] ${
            hasValidation
              ? "border-[#7A3E2D] bg-[#FDF3F0]/30"
              : isOpen
                ? "border-[#2D4C3E] ring-2 ring-[#2D4C3E]/10 bg-white"
                : "border-[#E5E1D8] hover:border-[#CCC6B7]"
          }`}
        >
          <span className={value ? "text-[#2D4C3E] font-medium" : "text-[#2D4C3E]/50"}>
            {value || "ກະລຸນາເລືອກ ຫຼື ຄົ້ນຫາລະດັບການຮຽນ..."}
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 text-[#2D4C3E]/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E1D8] rounded-2xl shadow-xl z-30 overflow-hidden animate-fade-in-scale">
            <div className="p-3 border-b border-[#E5E1D8] bg-[#F9F8F5] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8D5B28] shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setIsOpen(false);
                }}
                placeholder="ພິມຄຳຄົ້ນຫາ (Lao / English)..."
                aria-label="ຄົ້ນຫາລະດັບການຮຽນ"
                aria-controls="education-options"
                aria-autocomplete="list"
                className="w-full bg-transparent text-base text-[#2D4C3E] focus:outline-none placeholder:text-[#2D4C3E]/40"
              />
            </div>

            <div id="education-options" className="max-h-72 overflow-y-auto p-1.5 divide-y divide-[#E5E1D8]/40" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-sm text-center text-[#2D4C3E]/60">
                  ບໍ່ພົບລະດັບການຮຽນທີ່ກົງກັບ &quot;{search}&quot;
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setIsOther(false);
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 text-sm sm:text-base flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#EBF2EE] font-semibold text-[#2D4C3E]"
                          : "hover:bg-[#F4EFEA] text-[#2D4C3E]"
                      }`}
                    >
                      <span>{option.value}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-[#2D4C3E] stroke-[2.5]" />}
                    </button>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOther(true);
                setIsOpen(false);
                onChange("");
              }}
              className="w-full p-3 border-t border-[#E5E1D8] text-left text-sm font-semibold text-[#8D5B28] hover:bg-[#F7EFE3]"
            >
              ອື່ນໆ — ພິມລະດັບການຮຽນຂອງທ່ານເອງ
            </button>
          </div>
        )}
      </div>

      {isOther && (
        <input
          id="education-other-text"
          name="D2"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ພິມລະດັບການຮຽນຂອງທ່ານ..."
          aria-describedby={hasValidation ? validationId : undefined}
          aria-invalid={hasValidation}
          className="min-h-[52px] w-full rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 text-base text-[#2D4C3E] placeholder:text-[#2D4C3E]/40 outline-none focus:border-[#2D4C3E] focus:ring-1 focus:ring-[#2D4C3E] transition"
        />
      )}

      <p className="text-xs text-[#2D4C3E]/70">
        ກົດເພື່ອເລືອກ ຫຼື ພິມຄຳຄົ້ນຫາເພື່ອຫາລາຍການໄດ້ໄວ.
      </p>
    </div>
  );
}
