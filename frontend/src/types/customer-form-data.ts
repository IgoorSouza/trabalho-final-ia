import type z from "zod";
import type { customerSchema } from "../validators/customer";

export type CustomerFormData = z.infer<typeof customerSchema>;
