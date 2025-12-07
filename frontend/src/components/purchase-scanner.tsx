import React, { useState } from "react";
import { Upload, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Customer } from "../types/customer";
import api from "../lib/axios";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SearchableSelect } from "./ui/searchable-select";
import toast from "react-hot-toast";
import type { Purchase } from "../types/purchase";
import { Textarea } from "./ui/textarea";
import { AxiosError } from "axios";

interface Props {
  customers: Customer[];
  handleSaveBatch: (purchases: Purchase[]) => Promise<void>;
}

export default function PurchaseScanner({ customers, handleSaveBatch }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPurchases, setScannedPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [resize, setResize] = useState(true);
  const [resizeWidth, setResizeWidth] = useState(1200);
  const [grayscale, setGrayscale] = useState(true);
  const [normalize, setNormalize] = useState(true);
  const [threshold, setThreshold] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(128);
  const [errors, setErrors] = useState({
    title: false,
    value: false,
    date: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile || !selectedCustomer) {
      alert("Por favor, selecione um cliente e uma imagem");
      return;
    }

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post<Purchase[]>(`/purchase/scan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          resize,
          resizeWidth,
          grayscale,
          normalize,
          threshold,
          thresholdValue,
        },
      });

      setScannedPurchases(
        response.data.map((purchase) => ({
          ...purchase,
          date: (() => {
            if (purchase.date) {
              const [day, month, year] = purchase.date.split("/");
              return `${year}-${month}-${day}`;
            }

            return "";
          })(),
        }))
      );
      setIsReviewing(true);
      setCurrentPage(0);
      setResize(true);
      setGrayscale(true);
      setNormalize(true);
      setResizeWidth(1200);
      setThreshold(false);
      setThresholdValue(128);
    } catch (error) {
      if (error instanceof AxiosError && error.status === 400) {
        toast.error(
          "Não foi possível identificar o texto da imagem. Por favor, tente novamente ou utilize outra imagem."
        );
        return;
      }

      console.error("Erro:", error);
      toast.error("Erro ao escanear a imagem. Por favor, tente novamente.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer("");
    setSelectedFile(null);
    setPreview(null);
    setScannedPurchases([]);
    setIsReviewing(false);
    setCurrentPage(0);
    setResize(true);
    setResizeWidth(1200);
    setGrayscale(true);
    setNormalize(true);
    setThreshold(false);
    setThresholdValue(128);
    setErrors({
      title: false,
      value: false,
      date: false,
    });
  };

  const handlePurchaseChange = (field: keyof Purchase, value: string) => {
    const updatedPurchases = [...scannedPurchases];

    if (field === "value") {
      updatedPurchases[currentPage][field] = parseFloat(value) || 0;
    } else {
      updatedPurchases[currentPage][field] = value;
    }

    if (field !== "description") {
      setErrors((prev) => {
        if (value && value.trim() !== "") {
          prev[field as "title" | "value" | "date"] = false;
        }

        return prev;
      });
    }

    setScannedPurchases(updatedPurchases);
  };

  const handleFinish = async () => {
    const currentPurchase = scannedPurchases[currentPage];

    if (
      !currentPurchase.title ||
      currentPurchase.title.trim() === "" ||
      !currentPurchase.value ||
      !currentPurchase.date
    ) {
      setErrors({
        title: !currentPurchase.title || currentPurchase.title.trim() === "",
        value: !currentPurchase.value,
        date: !currentPurchase.date,
      });
      return;
    }

    const purchases = scannedPurchases.map((purchase) => {
      const [year, month, day] = purchase.date.split("-");

      return {
        ...purchase,
        description: purchase.description ?? "",
        date: `${year}-${month}-${day}T12:00:00.000Z`,
        customerId: selectedCustomer,
      };
    });

    handleSaveBatch(purchases);
    handleClose();
  };

  const handleGoToNextPage = () => {
    const currentPurchase = scannedPurchases[currentPage];

    if (
      !currentPurchase.title ||
      currentPurchase.title.trim() === "" ||
      !currentPurchase.value ||
      !currentPurchase.date
    ) {
      setErrors({
        title: !currentPurchase.title || currentPurchase.title.trim() === "",
        value: !currentPurchase.value,
        date: !currentPurchase.date,
      });
      return;
    }

    if (currentPage < scannedPurchases.length - 1) {
      setCurrentPage(currentPage + 1);
      setErrors({
        title: false,
        value: false,
        date: false,
      });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setErrors({
        title: false,
        value: false,
        date: false,
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Escanear Página de Compras
      </Button>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isReviewing
                ? "Revisar Compras Escaneadas"
                : "Escanear Página de Compras"}
            </DialogTitle>

            <p className="text-sm text-slate-800">
              {isReviewing
                ? "Revise os dados abaixo e, se houver erros, corrija-os antes de salvar as compras."
                : "Tire uma foto da página que deseja escanear e anexe-a abaixo. Certifique-se de que a foto tenha uma boa iluminação e que o texto esteja bem encaixado na foto."}
            </p>
          </DialogHeader>

          {!isReviewing ? (
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="customer">
                  Cliente <span className="text-destructive ml-[-6px]">*</span>
                </Label>
                <SearchableSelect
                  customers={customers}
                  value={selectedCustomer}
                  onValueChange={(value) => setSelectedCustomer(value)}
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="file-upload">
                  Imagem da Página de Compras{" "}
                  <span className="text-destructive ml-[-6px]">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {preview ? (
                      <div className="space-y-1">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Clique para selecionar uma imagem
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">
                  Configurações de Pré-processamento
                </p>

                <div className="flex gap-x-2 items-center">
                  <Input
                    type="checkbox"
                    id="resize"
                    className="size-4"
                    checked={resize}
                    onChange={() => setResize((prev) => !prev)}
                  />
                  <Label htmlFor="resize" className="font-normal">
                    Redimensionar
                  </Label>
                </div>

                {resize && (
                  <div className="flex gap-x-2 ml-8">
                    <Label htmlFor="resize-width" className="font-normal">
                      Largura (px):
                    </Label>

                    <span className="text-destructive ml-[-6px]">*</span>

                    <Input
                      id="resize-width"
                      type="number"
                      min="1"
                      placeholder="Ex: 1200"
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                )}

                <div className="flex gap-x-2">
                  <Input
                    type="checkbox"
                    id="grayscale"
                    className="size-4"
                    checked={grayscale}
                    onChange={() => setGrayscale((prev) => !prev)}
                  />
                  <Label htmlFor="grayscale" className="font-normal">
                    Aplicar Escala de Cinza
                  </Label>
                </div>

                <div className="flex gap-x-2">
                  <Input
                    type="checkbox"
                    id="normalize"
                    className="size-4"
                    checked={normalize}
                    onChange={() => setNormalize((prev) => !prev)}
                  />
                  <Label htmlFor="normalize" className="font-normal">
                    Normalizar
                  </Label>
                </div>

                <div className="flex gap-x-2 items-center">
                  <Input
                    type="checkbox"
                    id="threshold"
                    className="size-4"
                    checked={threshold}
                    onChange={() => setThreshold((prev) => !prev)}
                  />
                  <Label htmlFor="threshold" className="font-normal">
                    Threshold
                  </Label>
                </div>

                {threshold && (
                  <div className="flex gap-x-2 ml-8">
                    <Label htmlFor="resize-width" className="font-normal">
                      Valor (0 - 255):
                    </Label>

                    <span className="text-destructive ml-[-6px]">*</span>

                    <Input
                      id="resize-width"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Ex: 128"
                      value={thresholdValue}
                      onChange={(e) =>
                        setThresholdValue(Number(e.target.value))
                      }
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleScan}
                  disabled={
                    isScanning ||
                    !selectedCustomer ||
                    !selectedFile ||
                    (resize && resizeWidth === 0)
                  }
                >
                  {isScanning ? "Escaneando..." : "Escanear"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {scannedPurchases.length > 0 && (
                <>
                  <div>
                    <Label className="mb-2" htmlFor="title">
                      Título{" "}
                      <span className="text-destructive ml-[-6px]">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={scannedPurchases[currentPage].title || ""}
                      onChange={(e) =>
                        handlePurchaseChange("title", e.target.value)
                      }
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">Valor obrigatório</p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="title">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      value={scannedPurchases[currentPage].description || ""}
                      onChange={(e) =>
                        handlePurchaseChange("description", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="value">
                      Valor (R$)
                      <span className="text-destructive ml-[-6px]">*</span>
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={scannedPurchases[currentPage].value || ""}
                      onChange={(e) =>
                        handlePurchaseChange("value", e.target.value)
                      }
                    />
                    {errors.value && (
                      <p className="text-red-500 text-sm">Valor obrigatório</p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="date">
                      Data
                      <span className="text-destructive ml-[-6px]">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={scannedPurchases[currentPage].date || ""}
                      onChange={(e) =>
                        handlePurchaseChange("date", e.target.value)
                      }
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm">Valor obrigatório</p>
                    )}
                  </div>

                  <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-700">
                        Compra {currentPage + 1} de {scannedPurchases.length}
                      </p>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <Button
                        type="button"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        className="gap-1"
                      >
                        <ChevronLeft />
                        Anterior
                      </Button>

                      {currentPage === scannedPurchases.length - 1 ? (
                        <Button
                          type="button"
                          onClick={handleFinish}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check />
                          Finalizar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleGoToNextPage}
                          className="gap-1"
                        >
                          Próxima
                          <ChevronRight />
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
