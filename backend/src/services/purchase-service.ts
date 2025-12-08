import * as purchaseRepository from "../repositories/purchase-repository";
import * as imageTextRecognitionService from "./image-text-recognition-service";
import { NotFoundException } from "../exceptions/not-found-exception";
import { PurchaseData } from "../types/purchase";

export async function getPurchases(
  page?: string,
  pageSize?: string,
  title?: string,
  customerId?: string,
  startDate?: string,
  endDate?: string
) {
  const pageNumber = Math.max(parseInt(page || "1") - 1, 0);
  const pageSizeNumber = Math.max(parseInt(pageSize || "10"), 1);
  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;

  const [purchases, totalCount] = await Promise.all([
    purchaseRepository.findPage(
      pageNumber,
      pageSizeNumber,
      title,
      customerId,
      parsedStartDate,
      parsedEndDate
    ),
    purchaseRepository.findTotalCount(
      title,
      customerId,
      parsedStartDate,
      parsedEndDate
    ),
  ]);

  return { purchases, totalCount };
}

export async function createPurchase(purchaseData: PurchaseData) {
  return await purchaseRepository.create(purchaseData);
}

export async function createPurchaseBatch(purchasesData: PurchaseData[]) {
  return await Promise.all(
    purchasesData.map(
      async (purchase) => await purchaseRepository.create(purchase)
    )
  );
}

export async function scanPurchases(
  image: Express.Multer.File,
  resize: boolean,
  resizeWidth: number,
  grayscale: boolean,
  normalize: boolean,
  threshold: boolean,
  thresholdValue: number
) {
  const extractedText = await imageTextRecognitionService.extractTextFromImage(
    image,
    resize,
    resizeWidth,
    grayscale,
    normalize,
    threshold,
    thresholdValue
  );
  const textParts = extractedText.split("\n");
  const purchases: { title?: string; value?: number; date?: string }[] = [];

  textParts.forEach((part) => {
    const datePart = normalizeStringIfIsDate(part);
    const numberPart = Number(
      part.replaceAll(",", ".").replaceAll(":", ".").replaceAll(";", ".")
    );

    if (
      datePart.includes("/") &&
      datePart
        .split("/")
        .every((numberString) => Number.isInteger(Number(numberString)))
    ) {
      if (purchases.length > 0) {
        purchases[purchases.length - 1].date = datePart;
      }
    } else if (Number.isFinite(numberPart)) {
      if (purchases.length > 0) {
        purchases[purchases.length - 1].value = numberPart;
      }
    } else {
      purchases.push({
        title: part,
      });
    }
  });

  return purchases;
}

export async function updatePurchase(id: string, purchaseData: PurchaseData) {
  await throwErrorIfPurchaseNotExists(id);
  return await purchaseRepository.update(id, purchaseData);
}

export async function removePurchase(id: string) {
  await throwErrorIfPurchaseNotExists(id);
  await purchaseRepository.remove(id);
}

async function throwErrorIfPurchaseNotExists(id: string) {
  const purchase = await purchaseRepository.findById(id);

  if (!purchase) {
    throw new NotFoundException("Purchase not found.");
  }
}

function normalizeStringIfIsDate(string: string) {
  if (
    string.length < 9 ||
    (!string.includes("/") && !Number.isFinite(Number(string)))
  ) {
    return string;
  }

  const year = string.slice(-4);
  const day = string.slice(0, 2);
  const month = day.length === 1 ? string.slice(2, 4) : string.slice(3, 5);

  return `${day}/${month}/${year}`;
}
