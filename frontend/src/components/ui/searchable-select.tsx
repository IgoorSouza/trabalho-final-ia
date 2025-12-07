import * as React from "react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import type { Customer } from "../../types/customer";
import { cn } from "../../lib/utils";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  customers: Customer[];
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onValueChange,
  customers,
  placeholder = "Selecione um cliente",
  className,
}) => {
  const [filter, setFilter] = useState("");

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        customer.name.toLowerCase().includes(filter.toLowerCase())
      ),
    [customers, filter]
  );

  const stopKeyboardPropagation = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
  };

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        onValueChange(newValue);
        setFilter("");
      }}
      onOpenChange={(open) => {
        if (!open) {
          setFilter("");
        }
      }}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <Input
          placeholder="Pesquisar cliente..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2"
          onKeyDown={stopKeyboardPropagation}
          onKeyUp={stopKeyboardPropagation}
        />
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id!}>
              {customer.name}
            </SelectItem>
          ))
        ) : (
          <p className="p-2 text-center text-muted-foreground">
            Nenhum cliente encontrado.
          </p>
        )}
      </SelectContent>
    </Select>
  );
};
