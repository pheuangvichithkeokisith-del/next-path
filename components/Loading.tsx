export type LoadingProps = {
  className?: string;
};

export default function Loading({ className = "h-48" }: LoadingProps) {
  return (
    <div aria-busy="true" aria-label="ກຳລັງໂຫລດ" role="status" className={`${className} loading-skeleton rounded-2xl`}>
      <span className="sr-only">ກຳລັງໂຫລດ...</span>
    </div>
  );
}
