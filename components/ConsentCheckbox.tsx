import { UI_COPY } from "@/content/copy";

export type ConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ConsentCheckbox({ checked, onChange }: ConsentCheckboxProps) {
  return (
    <label className="mt-8 flex items-start gap-3.5 p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80 cursor-pointer hover:bg-stone-100 transition">
      <input
        checked={checked}
        className="mt-1 h-5 w-5 rounded-md text-stone-900 accent-stone-900 border-stone-300 focus:ring-stone-800 cursor-pointer shrink-0"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="text-sm sm:text-base leading-relaxed text-stone-800 select-none">
        {UI_COPY.introduction.consent}
      </span>
    </label>
  );
}

export default ConsentCheckbox;
