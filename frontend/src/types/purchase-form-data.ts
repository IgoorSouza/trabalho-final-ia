import type z from "zod";
import type { purchaseSchema } from "../validators/purchase";

export type PurchaseFormData = z.infer<typeof purchaseSchema>;
