import { UI_COPY } from "@/content/copy";

export type ProgressTrackerProps = {
  current: number;
  total: number;
  sectionTitle?: string;
  isDemographics?: boolean;
};

export default function ProgressTracker({
  current,
  total,
  sectionTitle,
  isDemographics = false,
}: ProgressTrackerProps) {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 font-medium">
        <div className="flex items-center gap-2">
          {isDemographics ? (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-xs font-semibold">
              {UI_COPY.demographics.heading}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-xs font-semibold">
              {UI_COPY.assessment.progress(current, total)}
            </span>
          )}
          {sectionTitle ? (
            <span className="text-stone-500 hidden sm:inline">· {sectionTitle}</span>
          ) : null}
        </div>
        <span className="text-xs text-stone-500 font-normal">
          {UI_COPY.assessment.autosave}
        </span>
      </div>

      {/* Progress bar line */}
      <div
        aria-label={UI_COPY.assessment.progress(current, total)}
        aria-valuemax={total}
        aria-valuemin={0}
        aria-valuenow={current}
        className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden"
        role="progressbar"
      >
        <div
          className="h-full bg-stone-900 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
