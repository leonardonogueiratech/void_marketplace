interface LogoProps {
  variant?: "navy" | "white";
  className?: string;
  iconOnly?: boolean;
}

// Recriação em código do selo oval "Feito de Gente" do moodboard, enquanto o
// arquivo original da designer não chega — ver [[feedback_rebrand_scope]].
export function Logo({ variant = "navy", className = "", iconOnly = false }: LogoProps) {
  const ink = variant === "white" ? "#ffffff" : "#071a33";

  if (iconOnly) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img src="/logo-icon.svg" alt="Feito de Gente" className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.svg"
        alt=""
        aria-hidden
        className="w-6 h-6 md:w-7 md:h-7 -rotate-6 shrink-0"
      />
      <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: "5.6em", height: "2.6em" }}>
        <div
          className="absolute inset-0 rounded-[50%] border-2 -rotate-3"
          style={{ borderColor: ink }}
        />
        <span
          className="absolute -top-1 -right-1 text-[0.7em] text-brand-green rotate-12 select-none"
          aria-hidden
        >
          ✦
        </span>
        <div className="relative -rotate-3 text-center leading-[1.05]">
          <p className="font-hand font-bold text-[0.85em]" style={{ color: ink }}>Feito</p>
          <p className="font-hand font-bold text-[0.85em]" style={{ color: ink }}>de Gente</p>
        </div>
      </div>
    </div>
  );
}
