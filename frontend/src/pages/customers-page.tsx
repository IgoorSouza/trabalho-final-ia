import React, { useState, useEffect } from "react";
import { type Customer } from "../types/customer";
import { CustomerList } from "../components/customer-list";
import { CustomerForm } from "../components/customer-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { IMaskInput } from "react-imask";

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterCpf, setFilterCpf] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const fetchCustomers = async () => {
    const params = new URLSearchParams();

    params.append("page", String(currentPage));
    params.append("pageSize", String(pageSize));
    if (filterName) params.append("name", filterName);
    if (filterEmail) params.append("email", filterEmail);
    if (filterCpf)
      params.append("cpf", filterCpf.replaceAll(".", "").replaceAll("-", ""));
    if (filterPhone)
      params.append(
        "phone",
        filterPhone
          .replaceAll("(", "")
          .replaceAll(")", "")
          .replaceAll("-", "")
          .replaceAll(" ", "")
      );

    const { data } = await axios.get<{
      customers: Customer[];
      totalCount: number;
    }>("/customer", { params });

    setCustomers(data.customers);
    setTotalItems(data.totalCount);
  };

  useEffect(() => {
    fetchCustomers();
  }, [filterName, filterEmail, filterCpf, filterPhone, currentPage, pageSize]);

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleSave = async (customer: Customer) => {
    try {
      if (customer.id) {
        const response = await axios.put(`/customer/${customer.id}`, customer);
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? response.data : c))
        );
      } else {
        const response = await axios.post("/customer", customer);
        setCustomers((prev) => [...prev, response.data]);
      }

      setIsFormOpen(false);
      toast.success(
        `Cliente ${customer.id ? "atualizado" : "cadastrado"} com sucesso.`
      );
    } catch (error) {
      if (error instanceof AxiosError && error.status === 409) {
        toast.error("Email, CPF ou telefone já pertencem a outro usuário.");
        return;
      }

      toast.error(
        `Erro ao ${customer.id ? "atualizar" : "adicionar"} cliente.`
      );
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/customer/${id}`);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("Cliente excluído com sucesso.");
    } catch {
      toast.error("Erro ao excluir cliente.");
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={handleAdd}>Adicionar Cliente</Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-md space-y-4">
        <button
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className="flex justify-between items-center w-full"
        >
          <h2 className="text-xl font-bold max-md:text-lg">Filtros</h2>
          {isFilterOpen ? (
            <ChevronUp className="size-5 cursor-pointer" />
          ) : (
            <ChevronDown className="size-5 cursor-pointer" />
          )}
        </button>

        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name" className="mb-2">
                Nome
              </Label>
              <Input
                id="name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2">
                Email
              </Label>
              <Input
                id="email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cpf" className="mb-2">
                CPF
              </Label>

              <IMaskInput
                mask="000.000.000-00"
                id="cpf"
                type="tel"
                onAccept={(value) => setFilterCpf(value)}
                value={filterCpf}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2">
                Telefone
              </Label>
              <IMaskInput
                id="phone"
                mask="(00) 00000-0000"
                type="tel"
                onAccept={(value) => setFilterPhone(value)}
                value={filterPhone}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <CustomerList
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>

          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight />
          </Button>

          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CustomerForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        initialData={selectedCustomer}
      />
    </div>
  );
};

export default CustomersPage;
