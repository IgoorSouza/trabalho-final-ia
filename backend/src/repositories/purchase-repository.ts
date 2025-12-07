import prisma from "../orm/prisma";
import { PurchaseData } from "../types/purchase";

export async function findPage(
  page: number,
  pageSize: number,
  title?: string,
  customerId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return await prisma.purchase.findMany({
    skip: page * pageSize,
    take: pageSize,
    where: {
      title: title
        ? {
            contains: title,
            mode: "insensitive",
          }
        : undefined,
      customerId: customerId || undefined,
      date:
        startDate || endDate
          ? {
              gte: startDate,
              lte: endDate,
            }
          : undefined,
    },
  });
}

export async function findTotalCount(
  title?: string,
  customerId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return await prisma.purchase.count({
    where: {
      title: title
        ? {
            contains: title,
            mode: "insensitive",
          }
        : undefined,
      customerId: customerId || undefined,
      date:
        startDate || endDate
          ? {
              gte: startDate,
              lte: endDate,
            }
          : undefined,
    },
  });
}

export async function findById(id: string) {
  return await prisma.purchase.findUnique({
    where: { id },
  });
}

export async function create(purchaseData: PurchaseData) {
  return await prisma.purchase.create({ data: purchaseData });
}

export async function update(id: string, purchaseData: PurchaseData) {
  return await prisma.purchase.update({
    where: { id },
    data: purchaseData,
  });
}

export async function remove(id: string) {
  await prisma.purchase.delete({
    where: { id },
  });
}
