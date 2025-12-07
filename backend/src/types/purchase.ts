import z from "zod";
import { purchaseSchema } from "../validators/purchase";

export type PurchaseData = z.infer<typeof purchaseSchema>;
