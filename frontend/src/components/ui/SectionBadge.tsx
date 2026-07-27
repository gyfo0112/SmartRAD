type SectionBadgeProps = {
  children: React.ReactNode;
  variant?: "light" | "inverse";
  className?: string;
};

export default function SectionBadge({
  children,
  variant = "light",
  className = "",
}: SectionBadgeProps) {
  const variantClasses =
    variant === "inverse"
      ? "border-white/20 bg-white/95 text-brand-blue-text"
      : "border-brand-border-light bg-brand-soft text-brand-blue-text";

  return (
    <div
      className={`inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold leading-5 sm:px-[14px] sm:text-[13px] ${variantClasses} ${className}`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-mint-soft">
        <span className="h-2 w-2 rounded-full bg-brand-mint" />
      </span>
      <span className="min-w-0 break-keep">{children}</span>
    </div>
  );
}
