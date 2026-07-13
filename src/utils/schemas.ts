import { z } from "zod";
import { INDIAN_CITIES } from "../data/cities";

// ── Login ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});
export type LoginForm = z.infer<typeof loginSchema>;

// ── Signup ─────────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});
export type SignupForm = z.infer<typeof signupSchema>;

// ── Enter Details (onboarding final step) ──────────────────────────────────
export const detailsSchema = z.object({
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z
    .string()
    .refine((v) => INDIAN_CITIES.includes(v), "Please select a valid city"),
});
export type DetailsForm = z.infer<typeof detailsSchema>;

// ── Post Job (hirer) ───────────────────────────────────────────────────────
export const jobPostSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    location: z
      .string()
      .refine((v) => INDIAN_CITIES.includes(v), "Please select a valid city"),
    budget: z
      .number()
      .positive("Budget must be greater than 0"),
    minWage: z
      .number()
      .positive("Min wage must be greater than 0"),
    positions: z.number().int().positive().default(1),
    experience: z.number().int().nonnegative("Experience cannot be negative"),
    category: z.string().min(1, "Select a category"),
    budgetType: z.enum(["HOURLY", "DAILY", "FIXED"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
  })
  .refine((d) => d.budget >= d.minWage * d.positions, {
    message: "Budget must cover minWage × positions",
    path: ["budget"],
  });
export type JobPostForm = z.infer<typeof jobPostSchema>;
