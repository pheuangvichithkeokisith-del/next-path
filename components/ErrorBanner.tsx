import { UI_COPY } from "@/content/copy";
import { TriangleAlert } from "lucide-react";

export type ErrorBannerProps = {
  onRetry?: () => void;
};

export default function ErrorBanner({ onRetry }: ErrorBannerProps) {
  return (
    <div role="alert" aria-live="assertive" className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm sm:text-base leading-relaxed text-stone-800 shadow-xs">
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
        <div className="flex-1">
          <p>{UI_COPY.error}</p>
          {onRetry ? (
            <button
              className="mt-3 btn-secondary text-xs sm:text-sm py-2 px-4 min-h-[40px]"
              onClick={onRetry}
              type="button"
            >
              {UI_COPY.retry}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
