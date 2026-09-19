// Brand system for "From Oven to Online" — matches the published book,
// Facebook page and post graphics. See claude.md §7 before changing anything here.
export const brand = {
  brown: "#5C3418", // primary surface — hero, footer, dark sections
  brownD: "#4A2A13", // deeper brown for gradient ends and pressed states
  caramel: "#C47A2C", // primary action — CTAs, price box, active tier, links
  gold: "#E2B87C", // accents on dark — kickers, hairlines, icon strokes
  cream: "#FBF5EC", // light surface — alternating sections, text on brown
  sand: "#F2E6D4", // cards, table headers, subtle fills on cream
  ink: "#2B2118", // body text on light surfaces
  muted: "#8A7A6A", // captions, footnotes, disabled
  green: "#3F6B3A", // success only (payment approved)
  red: "#A8402F", // errors only (payment rejected)
} as const;

export type BrandColor = keyof typeof brand;
