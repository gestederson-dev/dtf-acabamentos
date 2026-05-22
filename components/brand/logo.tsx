interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="32" height="32" rx="6" fill="#232021" />
        {/* Perfil da pingadeira em L */}
        <path
          d="M 8 8 L 8 24 L 24 24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        {/* Borda/saliência da pingadeira */}
        <line x1="24" y1="24" x2="24" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-[#232021] dark:text-white">DTF</span>
          <span className="text-[10px] text-[#71717A]">Acabamentos</span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="32" height="32" rx="6" fill="#232021" />
      <path
        d="M 8 8 L 8 24 L 24 24"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
      <line x1="24" y1="24" x2="24" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  );
}
