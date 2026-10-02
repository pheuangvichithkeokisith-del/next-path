"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { FormOption } from "@/types/form";

interface ProvinceSelectProps {
  options: FormOption[];
  selectedCode?: string;
  onChange: (code: string) => void;
  hasValidation?: boolean;
  validationId?: string;
}

const PROVINCE_EN_MAP: Record<string, string> = {
  "D3-O01": "Vientiane Capital",
  "D3-O02": "Vientiane Province",
  "D3-O03": "Phongsaly",
  "D3-O04": "Luang Namtha",
  "D3-O05": "Oudomxay",
  "D3-O06": "Bokeo",
  "D3-O07": "Luang Prabang",
  "D3-O08": "Huaphanh",
  "D3-O09": "Xieng Khouang",
  "D3-O10": "Xayabury",
  "D3-O11": "Bolikhamxay",
  "D3-O12": "Khammouane",
  "D3-O13": "Savannakhet",
  "D3-O14": "Salavan",
  "D3-O15": "Sekong",
  "D3-O16": "Champasak",
  "D3-O17": "Attapeu",
  "D3-O18": "Xaisomboun",
};

export default function ProvinceSelect({
  options,
  selectedCode,
  onChange,
  hasValidation,
  validationId,
}: ProvinceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.code === selectedCode);
  const selectedEnName = selectedCode ? PROVINCE_EN_MAP[selectedCode] : null;

  const filteredOptions = options.filter((opt) => {
    const enName = PROVINCE_EN_MAP[opt.code] || "";
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      opt.text.toLowerCase().includes(query) ||
      enName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mt-4 space-y-2 font-lao-looped" ref={dropdownRef}>
      <label
        htmlFor="province-select-button"
        className="block text-sm font-semibold text-[#2D4C3E]"
      >
        ເລືອກແຂວງ ຫຼື ນະຄອນຫຼວງ
      </label>

      <div className="relative">
        <button
          id="province-select-button"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={hasValidation ? validationId : undefined}
          aria-invalid={hasValidation}
          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border bg-[#F9F8F5] text-sm sm:text-base flex items-center justify-between cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#8D5B28] ${
            hasValidation
              ? "border-[#7A3E2D] bg-[#FDF3F0]/30"
              : isOpen
              ? "border-[#2D4C3E] ring-2 ring-[#2D4C3E]/10 bg-white"
              : "border-[#E5E1D8] hover:border-[#CCC6B7]"
          }`}
        >
          <span className={selectedOption ? "text-[#2D4C3E] font-medium" : "text-[#2D4C3E]/50"}>
            {selectedOption ? (
              <span>
                {selectedOption.text}
                {selectedEnName && (
                  <span className="text-xs text-[#8D5B28] ml-2 font-normal">
                    ({selectedEnName})
                  </span>
                )}
              </span>
            ) : (
              "ກະລຸນາເລືອກແຂວງ ຫຼື ນະຄອນຫຼວງ..."
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#2D4C3E]/60 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#2D4C3E]" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E1D8] rounded-2xl shadow-xl z-30 overflow-hidden animate-fade-in-scale">
            {/* Search Input */}
            <div className="p-3 border-b border-[#E5E1D8] bg-[#F9F8F5] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8D5B28] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ພິມຊື່ແຂວງເພື່ອຄົ້ນຫາ (Lao / English)..."
                className="w-full bg-transparent text-sm text-[#2D4C3E] focus:outline-none placeholder:text-[#2D4C3E]/40 font-lao"
              />
            </div>

            {/* Provinces List */}
            <div
              className="max-h-64 overflow-y-auto p-1.5 divide-y divide-[#E5E1D8]/40 scrollbar-thin"
              role="listbox"
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-xs text-center text-[#2D4C3E]/60 font-lao">
                  ບໍ່ພົບຊື່ແຂວງທີ່ກົງກັບຄຳຄົ້ນຫາ &quot;{search}&quot;
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedCode === opt.code;
                  const enName = PROVINCE_EN_MAP[opt.code];
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        onChange(opt.code);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-sm sm:text-base flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#EBF2EE] font-semibold text-[#2D4C3E]"
                          : "hover:bg-[#F4EFEA] text-[#2D4C3E]"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.text}</span>
                        {enName && (
                          <span className="text-xs text-[#8D5B28] font-normal">
                            ({enName})
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#2D4C3E] stroke-[2.5]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-[#2D4C3E]/70">
        ກົດເພື່ອເລືອກແຂວງ ຫຼື ພິມຊື່ແຂວງໃນຊ່ອງຄົ້ນຫາເພື່ອຄວາມວ່ອງໄວ.
      </p>
    </div>
  );
}
