import { type Customer } from "../types/customer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { useState } from "react";
import DeletionConfirmationModal from "./deletion-confirmation-modal";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
}) => {
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>();

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  };

  const handleDelete = () => {
    onDelete(customerToDelete!.id!);
    setCustomerToDelete(null);
  };

  if (customers.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md">
        Nenhum cliente cadastrado.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Valor Pendente</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-100">
                <TableCell>{customer.name}</TableCell>
                <TableCell className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap">
                  {customer.email}
                </TableCell>
                <TableCell>{formatCpf(customer.cpf)}</TableCell>
                <TableCell>{formatPhone(customer.phone)}</TableCell>
                <TableCell
                  className={
                    customer.totalPurchasesValue! > 0 ? "text-red-600" : ""
                  }
                >
                  {customer.totalPurchasesValue?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }) || "R$ 0,00"}
                </TableCell>
                <TableCell
                  className="text-center space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCustomerToDelete(customer)}
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
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white border rounded-lg shadow-sm p-4 space-y-2 flex flex-col"
          >
            <h3 className="text-lg font-bold truncate">{customer.name}</h3>

            <div className="space-y-1 text-sm border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <span>{customer.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">CPF:</span>
                <span>{formatCpf(customer.cpf)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Telefone:</span>
                <span>{formatPhone(customer.phone)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Pendente:</span>
                <span
                  className={
                    customer.totalPurchasesValue! > 0
                      ? "font-semibold text-red-600"
                      : ""
                  }
                >
                  {customer.totalPurchasesValue?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }) || "R$ 0,00"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(customer)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCustomerToDelete(customer)}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeletionConfirmationModal
        title="Excluir Cliente"
        confirmationText={`Tem certeza que deseja excluir o cliente ${customerToDelete?.name}?`}
        open={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirmation={handleDelete}
      />
    </>
  );
};
