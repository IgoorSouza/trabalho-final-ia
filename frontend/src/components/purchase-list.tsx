import React, { useState } from "react";
import { type Customer } from "../types/customer.ts";
import type { Purchase } from "../types/purchase.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import DeletionConfirmationModal from "./deletion-confirmation-modal.tsx";

interface PurchaseListProps {
  purchases: Purchase[];
  customers: Customer[];
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  customers,
  onEdit,
  onDelete,
}) => {
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(
    null
  );

  const getCustomerName = (customerId: string) =>
    customers.find((u) => u.id === customerId)?.name ||
    "Cliente não encontrado";

  const formatValue = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const handleDelete = () => {
    onDelete(purchaseToDelete!.id!);
    setPurchaseToDelete(null);
  };

  if (purchases.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md">
        Nenhuma compra registrada.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.title}</TableCell>
                <TableCell className="max-w-[200px] truncate overflow-hidden text-ellipsis whitespace-nowrap">
                  {purchase.description}
                </TableCell>
                <TableCell>{getCustomerName(purchase.customerId)}</TableCell>
                <TableCell>{formatValue(purchase.value)}</TableCell>
                <TableCell>{formatDate(purchase.date)}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(purchase)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPurchaseToDelete(purchase)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-white border rounded-lg shadow-sm p-4 space-y-3 flex flex-col"
          >
            <h3 className="text-lg font-bold truncate">{purchase.title}</h3>

            <div className="space-y-1 text-sm border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Cliente:</span>
                <span className="truncate max-w-[50%]">
                  {getCustomerName(purchase.customerId)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Data:</span>
                <span>{formatDate(purchase.date)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="font-medium text-base">Valor:</span>
                <span className="text-base">{formatValue(purchase.value)}</span>
              </div>
              {purchase.description && (
                <div className="flex flex-col pt-2 border-t mt-2">
                  <span className="font-medium">Descrição:</span>
                  <p className="text-gray-600 break-words">
                    {purchase.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(purchase)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setPurchaseToDelete(purchase)}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeletionConfirmationModal
        title="Excluir Compra"
        confirmationText={`Tem certeza que deseja excluir a compra ${purchaseToDelete?.title}?`}
        open={!!purchaseToDelete}
        onClose={() => setPurchaseToDelete(null)}
        onConfirmation={handleDelete}
      />
    </>
  );
};
