interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

export const Logo = ({ showWordmark = true, className }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 md:h-9 md:w-9 shrink-0"
        aria-hidden="true"
      >
        <line x1="16" y1="7" x2="7" y2="24" stroke="currentColor" className="text-brand-primary" strokeWidth="2" />
        <line x1="16" y1="7" x2="25" y2="24" stroke="currentColor" className="text-brand-primary" strokeWidth="2" />
        <line x1="7" y1="24" x2="25" y2="24" stroke="currentColor" className="text-brand-primary" strokeWidth="2" />
        <circle cx="16" cy="7" r="4" className="fill-brand-primary" />
        <circle cx="7" cy="24" r="4" className="fill-brand-secondary" />
        <circle cx="25" cy="24" r="4" className="fill-brand-secondary" />
      </svg>
      {showWordmark && (
        <span className="text-xl font-bold tracking-tight text-brand-slate">
          <span className="text-brand-primary">Poli</span>gon
        </span>
      )}
    </div>
  );
};
