import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Field 'name' is required."),
  email: z
    .email("Valid email is required")
    .min(1, "Field 'email' is required."),
  cpf: z
    .string()
    .min(11, "Field 'cpf' must have exactly 11 digits.")
    .max(11, "Field 'cpf' must have exactly 11 digits."),
  phone: z
    .string()
    .min(10, "Field 'phone' must have at least 10 digits")
    .max(11, "Field 'phone' must have at most 11 digits"),
});
