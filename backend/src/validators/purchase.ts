import { z } from "zod";

export const purchaseSchema = z.object({
  title: z.string().min(1, "Field 'title' is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  value: z.number().positive("Field 'value' must be greater than 0"),
  customerId: z.uuid("Field 'customerId' requires valid uuid."),
});

export const batchPurchaseSchema = z.array(purchaseSchema);
