export type LoadingProps = {
  className?: string;
};

export default function Loading({ className = "h-48" }: LoadingProps) {
  return <div aria-busy="true" className={`${className} animate-pulse rounded-2xl bg-slate-200`} />;
}
