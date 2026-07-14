interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <circle cx="24" cy="12" r="5" fill="currentColor" />
      <circle cx="11" cy="36" r="5" fill="currentColor" />
      <circle cx="37" cy="36" r="5" fill="currentColor" />
      <path
        d="M24 17v8m0 0-13 6m13-6 13 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
