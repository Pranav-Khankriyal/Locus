interface AuthShowcaseCardProps {
  title?: string;
  subtitle?: string;
  maxHeightClass?: string;
  className?: string;
}

/** Right-column full-bleed showcase artwork panel for auth and onboarding pages. */
export function AuthShowcaseCard({
  maxHeightClass = '',
  className = '',
}: AuthShowcaseCardProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[440px] overflow-hidden select-none ${maxHeightClass} ${className}`}
    >
      <img
        src="/login.png"
        alt="Locus Enterprise Authentication"
        className="w-full h-full object-cover object-center pointer-events-none"
        loading="eager"
      />
    </div>
  );
}
