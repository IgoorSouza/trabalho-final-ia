import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email("Email inválido"),
  cpf: z
    .string()
    .min(11, "CPF obrigatório")
    .max(14, "CPF deve ter no máximo 14 dígitos"),
  phone: z
    .string()
    .min(10, "Telefone obrigatório")
    .max(15, "Telefone deve ter no máximo 15 dígitos"),
});
