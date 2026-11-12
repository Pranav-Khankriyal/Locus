interface AuthShowcaseCardProps {
  title?: string;
  subtitle?: string;
  maxHeightClass?: string;
}

/** Right-column full-bleed showcase artwork panel for auth and onboarding pages. */
export function AuthShowcaseCard({
  maxHeightClass = 'max-h-[520px]',
}: AuthShowcaseCardProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] rounded-[1.75rem] overflow-hidden select-none shadow-sm ${maxHeightClass} bg-stone-900`}
    >
      <img
        src="/login.png"
        alt="Lokus Enterprise Authentication"
        className="w-full h-full object-cover object-center pointer-events-none"
        loading="eager"
      />
    </div>
  );
}
