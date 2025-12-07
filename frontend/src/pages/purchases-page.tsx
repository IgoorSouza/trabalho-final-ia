import React, { useState, useEffect } from "react";
import { type Purchase } from "../types/purchase";
import type { Customer } from "../types/customer";
import { PurchaseList } from "../components/purchase-list";
import { PurchaseForm } from "../components/purchase-form";
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
import { SearchableSelect } from "../components/ui/searchable-select";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import PurchaseScanner from "../components/purchase-scanner";

const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCustomerId, setFilterCustomerId] = useState("all-customers");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const fetchPurchases = async () => {
    const params = new URLSearchParams();
    if (filterTitle) params.append("title", filterTitle);
    if (filterCustomerId !== "all-customers")
      params.append("customerId", filterCustomerId);
    if (filterStartDate) params.append("startDate", filterStartDate);
    if (filterEndDate) params.append("endDate", filterEndDate);
    params.append("page", String(currentPage));
    params.append("pageSize", String(pageSize));

    const { data } = await axios.get<{
      purchases: Purchase[];
      totalCount: number;
    }>("/purchase", { params });
    setPurchases(data.purchases);
    setTotalItems(data.totalCount);
  };

  const fetchCustomers = async () => {
    const { data } = await axios.get<{
      customers: Customer[];
      totalCount: number;
    }>("/customer?pageSize=999");
    setCustomers(data.customers);
  };

  useEffect(() => {
    fetchPurchases();
  }, [
    filterTitle,
    filterCustomerId,
    filterStartDate,
    filterEndDate,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    setSelectedPurchase(null);
    setIsFormOpen(true);
  };

  const handleSave = async (purchase: Purchase) => {
    try {
      if (purchase.id) {
        const response = await axios.put(`/purchase/${purchase.id}`, purchase);
        setPurchases((prev) =>
          prev.map((p) => (p.id === purchase.id ? response.data : p))
        );
      } else {
        const response = await axios.post("/purchase", purchase);
        setPurchases((prev) => [...prev, response.data]);
      }

      setIsFormOpen(false);
      toast.success(
        `Compra ${purchase.id ? "atualizada" : "cadastrada"} com sucesso.`
      );
    } catch {
      toast.error(`Erro ao ${purchase.id ? "atualizar" : "adicionar"} compra.`);
    }
  };

  const handleSaveBatch = async (purchases: Purchase[]) => {
    try {
      const response = await axios.post("/purchase/batch", purchases);
      setPurchases((prev) => [...prev, ...response.data]);
      toast.success("Compras cadastradas com sucesso.");
    } catch {
      toast.error(`Erro ao cadastrar compras.`);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/purchase/${id}`);
      setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
      toast.success("Compra excluída com sucesso.");
    } catch {
      toast.error("Erro ao excluir compra.");
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const customersWithAllOption = [
    { id: "all-customers", name: "Todos" } as Customer,
    ...customers,
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Compras</h1>

        <div className="flex items-center gap-x-4">
          <PurchaseScanner
            customers={customers}
            handleSaveBatch={handleSaveBatch}
          />
          <Button onClick={handleAdd}>Adicionar Compra</Button>
        </div>
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
              <Label htmlFor="title" className="mb-2">
                Título
              </Label>
              <Input
                id="title"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="customerId" className="mb-2">
                Cliente
              </Label>
              <SearchableSelect
                customers={customersWithAllOption}
                value={filterCustomerId}
                onValueChange={(value) => setFilterCustomerId(value)}
                placeholder="Selecione um cliente"
              />
            </div>

            <div>
              <Label htmlFor="startDate" className="mb-2">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="mb-2">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <PurchaseList
        purchases={purchases}
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

      <PurchaseForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        initialData={selectedPurchase}
        customers={customers}
      />
    </div>
  );
};

export default PurchasesPage;
