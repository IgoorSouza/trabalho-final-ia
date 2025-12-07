import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { type Customer } from "../types/customer";
import { customerSchema } from "../validators/customer";
import type { CustomerFormData } from "../types/customer-form-data";
import { IMaskInput } from "react-imask";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  initialData?: Customer | null;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    control,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      cpf: "",
      phone: "",
    },
  });

  useEffect(() => {
    reset(
      initialData || {
        name: "",
        email: "",
        cpf: "",
        phone: "",
      }
    );
  }, [initialData, reset]);

  const submitHandler = (data: CustomerFormData) => {
    const customer: Customer = {
      ...data,
      id: initialData?.id,
      cpf: data.cpf.replaceAll(".", "").replaceAll("-", ""),
      phone: data.phone
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll(" ", "")
        .replaceAll("-", ""),
    };
    onSubmit(customer);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cliente" : "Adicionar Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div>
            <Label className="mb-2" htmlFor="name">
              Nome
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-2" htmlFor="email">
              Email
            </Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-2" htmlFor="cpf">
              CPF
            </Label>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <IMaskInput
                  mask="000.000.000-00"
                  id="cpf"
                  type="tel"
                  onAccept={(value) => field.onChange(value)}
                  value={field.value}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              )}
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm">{errors.cpf.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-2" htmlFor="phone">
              Telefone
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <IMaskInput
                  mask="(00) 00000-0000"
                  id="phone"
                  type="tel"
                  onAccept={(value) => field.onChange(value)}
                  value={field.value}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
