import z from "zod";
import { customerSchema } from "../validators/customer";

export type CustomerData = z.infer<typeof customerSchema>;
