"use client";

import { useEffect, useRef, useState } from "react";

const CORNER_RADIUS = 14;
const BUMP_DIAMETER = 16;

function buildScallopPath(w: number, h: number): string {
  const r = Math.min(CORNER_RADIUS, w / 2, h / 2);
  const topLen = w - 2 * r;
  const rightLen = h - 2 * r;
  const bottomLen = w - 2 * r;
  const leftLen = h - 2 * r;

  const nTop = Math.max(1, Math.round(topLen / BUMP_DIAMETER));
  const nRight = Math.max(1, Math.round(rightLen / BUMP_DIAMETER));
  const nBottom = Math.max(1, Math.round(bottomLen / BUMP_DIAMETER));
  const nLeft = Math.max(1, Math.round(leftLen / BUMP_DIAMETER));

  const sTop = topLen / nTop;
  const sRight = rightLen / nRight;
  const sBottom = bottomLen / nBottom;
  const sLeft = leftLen / nLeft;

  let d = `M ${r} 0`;

  // Top edge, left -> right, bumps arc outward (up).
  for (let i = 0; i < nTop; i++) {
    d += ` a ${sTop / 2} ${sTop / 2} 0 0 1 ${sTop} 0`;
  }
  // Top-right corner.
  d += ` a ${r} ${r} 0 0 1 ${r} ${r}`;

  // Right edge, top -> bottom, bumps arc outward (right).
  for (let i = 0; i < nRight; i++) {
    d += ` a ${sRight / 2} ${sRight / 2} 0 0 1 0 ${sRight}`;
  }
  // Bottom-right corner.
  d += ` a ${r} ${r} 0 0 1 ${-r} ${r}`;

  // Bottom edge, right -> left, bumps arc outward (down).
  for (let i = 0; i < nBottom; i++) {
    d += ` a ${sBottom / 2} ${sBottom / 2} 0 0 1 ${-sBottom} 0`;
  }
  // Bottom-left corner.
  d += ` a ${r} ${r} 0 0 1 ${-r} ${-r}`;

  // Left edge, bottom -> top, bumps arc outward (left).
  for (let i = 0; i < nLeft; i++) {
    d += ` a ${sLeft / 2} ${sLeft / 2} 0 0 1 0 ${-sLeft}`;
  }
  // Top-left corner.
  d += ` a ${r} ${r} 0 0 1 ${r} ${-r}`;

  d += " Z";
  return d;
}

type CrustButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  variant?: "caramel" | "cream";
};

export function CrustButton({
  children,
  onClick,
  href,
  type = "button",
  disabled,
  className = "",
  variant = "caramel",
}: CrustButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fill = variant === "caramel" ? "var(--color-caramel)" : "var(--color-cream)";
  const textColor = variant === "caramel" ? "text-cream" : "text-ink";

  const inner = (
    <div
      ref={wrapRef}
      className={`crust-btn relative inline-flex select-none items-center justify-center px-8 py-4 transition-transform duration-150 active:scale-[0.98] ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
      style={{ filter: "drop-shadow(0 8px 18px rgba(92,52,24,0.28))" }}
    >
      {size && (
        <svg
          className="absolute inset-0 h-full w-full transition-[filter] duration-150"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          <path d={buildScallopPath(size.w, size.h)} fill={fill} />
        </svg>
      )}
      {!size && (
        <div className="absolute inset-0 rounded-xl" style={{ background: fill }} aria-hidden="true" />
      )}
      <span className={`relative z-10 font-display text-[17px] font-semibold ${textColor}`}>
        {children}
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {inner}
    </button>
  );
}
