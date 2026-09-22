import { UI_COPY } from "@/content/copy";

export type ErrorBannerProps = {
  onRetry?: () => void;
};

export default function ErrorBanner({ onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm sm:text-base leading-relaxed text-stone-800 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="text-amber-800 text-lg leading-none mt-0.5 font-bold">!</span>
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
