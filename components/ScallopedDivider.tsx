type ScallopedDividerProps = {
  color?: string;
  className?: string;
};

// Thin repeating scallop, echoing the CrustButton edge. Tiles via CSS
// background so it stays crisp at any section width.
export function ScallopedDivider({ color = "%23C47A2C", className = "" }: ScallopedDividerProps) {
  const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10' viewBox='0 0 20 10'%3E%3Cpath d='M0 0 A5 5 0 0 0 10 0 A5 5 0 0 0 20 0' fill='none' stroke='${color}' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E`;

  return (
    <div
      role="presentation"
      className={`h-[10px] w-full ${className}`}
      style={{
        backgroundImage: `url("${svg}")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "20px 10px",
      }}
    />
  );
}
