import { UI_COPY } from "@/content/copy";

export type ConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ConsentCheckbox({ checked, onChange }: ConsentCheckboxProps) {
  return (
    <label className="mt-8 flex items-start gap-3.5 p-4 rounded-2xl bg-[#F2EFE8] border border-[#E5E1D8] cursor-pointer hover:bg-[#EEEAE0] focus-within:border-[#2D4C3E] focus-within:ring-2 focus-within:ring-[#2D4C3E]/15 transition">
      <input
        checked={checked}
        className="mt-1 h-5 w-5 rounded-md text-[#2D4C3E] accent-[#2D4C3E] border-stone-300 focus:ring-[#2D4C3E] cursor-pointer shrink-0"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="text-sm sm:text-base leading-relaxed text-[#332E26] select-none">
        {UI_COPY.introduction.consent}
      </span>
    </label>
  );
}

export default ConsentCheckbox;
