export const CATEGORIES = [
  "CARPENTER", "ELECTRICIAN", "PLUMBER", "PAINTER", "CLEANER",
  "GARDENER", "MASON", "DRIVER", "COOK", "SECURITY", "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_MIN_WAGE: Record<Category, number> = {
  CARPENTER: 500,
  ELECTRICIAN: 600,
  PLUMBER: 550,
  PAINTER: 450,
  CLEANER: 400,
  GARDENER: 400,
  MASON: 500,
  DRIVER: 500,
  COOK: 450,
  SECURITY: 400,
  OTHER: 450,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  CARPENTER: "Carpenter",
  ELECTRICIAN: "Electrician",
  PLUMBER: "Plumber",
  PAINTER: "Painter",
  CLEANER: "Cleaner",
  GARDENER: "Gardener",
  MASON: "Mason",
  DRIVER: "Driver",
  COOK: "Cook",
  SECURITY: "Security",
  OTHER: "Other",
};
