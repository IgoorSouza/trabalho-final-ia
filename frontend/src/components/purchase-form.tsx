import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import type { Purchase } from "../types/purchase";
import type { Customer } from "../types/customer";
import { purchaseSchema } from "../validators/purchase";
import type { PurchaseFormData } from "../types/purchase-form-data";
import { SearchableSelect } from "./ui/searchable-select";

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (purchase: Purchase) => void;
  initialData?: Purchase | null;
  customers: Customer[];
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  customers,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      value: 0,
      date: new Date().toISOString().split("T")[0],
      customerId: "",
    },
  });

  const customerId = watch("customerId");

  useEffect(() => {
    if (open) {
      if (initialData) {
        const formattedDate = initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        reset({
          ...initialData,
          date: formattedDate,
        });
      } else {
        reset({
          title: "",
          description: "",
          value: 0,
          date: new Date().toISOString().split("T")[0],
          customerId: "",
        });
      }
    } else {
      reset({
        title: "",
        description: "",
        value: 0,
        date: new Date().toISOString().split("T")[0],
        customerId: "",
      });
    }
  }, [initialData, reset]);

  const submitHandler = (data: PurchaseFormData) => {
    const fullDate = data.date
      ? `${data.date}T12:00:00.000Z`
      : new Date().toISOString();

    const purchase: Purchase = {
      ...data,
      id: initialData?.id,
      date: fullDate,
    };

    onSubmit(purchase);
    reset({
      title: "",
      description: "",
      value: 0,
      date: new Date().toISOString().split("T")[0],
      customerId: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Compra" : "Adicionar Compra"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div>
            <Label className="mb-2" htmlFor="title">
              Título
            </Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-2" htmlFor="description">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              className="break-all max-h-[150px]"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="value">
              Valor (R$)
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              {...register("value", { valueAsNumber: true })}
            />
            {errors.value && (
              <p className="text-red-500 text-sm">{errors.value.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="date">
              Data
            </Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="customerId">
              Cliente
            </Label>
            <SearchableSelect
              customers={customers}
              value={customerId}
              onValueChange={(value) => setValue("customerId", value)}
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm">
                {errors.customerId.message}
              </p>
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
