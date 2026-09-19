type MarkProps = {
  size?: number;
  className?: string;
};

// Line-art mark: whisk, cupcake, phone with play triangle — left to right.
// Stroke inherits currentColor so it can sit gold on brown or caramel on cream.
export function Mark({ size = 40, className }: MarkProps) {
  const height = (size * 110) / 300;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 300 110"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Whisk */}
      <g>
        <line x1="20" y1="90" x2="38" y2="60" />
        <path d="M38 60 C 20 45, 20 25, 38 15 C 44 12, 50 16, 48 22 C 44 32, 30 34, 24 26" />
        <path d="M38 60 C 28 40, 32 22, 48 15 C 54 13, 58 18, 55 24 C 50 34, 36 33, 32 24" />
        <path d="M38 60 C 44 38, 56 24, 70 22 C 76 21, 79 27, 75 32 C 68 40, 54 36, 50 27" />
      </g>

      {/* Cupcake */}
      <g>
        <path d="M118 55 L 128 90 a 4 4 0 0 0 4 3 h 16 a 4 4 0 0 0 4 -3 l 10 -35 Z" />
        <path d="M112 55 C 112 42, 122 34, 138 34 C 154 34, 164 42, 164 55" />
        <circle cx="138" cy="26" r="3" fill="currentColor" stroke="none" />
        <line x1="138" y1="34" x2="138" y2="30" />
      </g>

      {/* Phone with play triangle */}
      <g>
        <rect x="228" y="15" width="44" height="80" rx="8" />
        <line x1="242" y1="24" x2="258" y2="24" />
        <path d="M242 46 L 260 55 L 242 64 Z" />
      </g>
    </svg>
  );
}
