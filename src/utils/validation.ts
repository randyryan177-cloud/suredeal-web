import { z } from "zod";

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    // Note: We don't check min-length 8 here so users with old 
    // passwords aren't locked out, but you can if you prefer.
});

/**
 * Registration Validation Schema
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name is too long"),
    phoneNumber: z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Invalid phone number (e.g., +254700000000)"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This ensures the error appears on the confirm field
  });

// --- Types ---
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;