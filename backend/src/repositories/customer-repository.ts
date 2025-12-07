import prisma from "../orm/prisma";
import { CustomerData } from "../types/customer";

export async function findPage(
  page: number,
  pageSize: number,
  name?: string,
  email?: string,
  cpf?: string,
  phone?: string
) {
  return await prisma.customer.findMany({
    skip: page * pageSize,
    take: pageSize,
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
      email: {
        contains: email,
        mode: "insensitive",
      },
      cpf: {
        contains: cpf,
        mode: "insensitive",
      },
      phone: {
        contains: phone,
        mode: "insensitive",
      },
    },
    include: {
      purchases: {
        select: {
          value: true,
        },
      },
    },
  });
}

export async function findTotalCount(
  name?: string,
  email?: string,
  cpf?: string,
  phone?: string
) {
  return await prisma.customer.count({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
      email: {
        contains: email,
        mode: "insensitive",
      },
      cpf: {
        contains: cpf,
        mode: "insensitive",
      },
      phone: {
        contains: phone,
        mode: "insensitive",
      },
    },
  });
}

export async function findById(id: string) {
  return await prisma.customer.findUnique({
    where: {
      id,
    },
  });
}

export async function findByEmailOrCpfOrPhone(
  email: string,
  cpf: string,
  phone: string,
  id?: string
) {
  return await prisma.customer.findFirst({
    where: {
      OR: [{ email }, { cpf }, { phone }],
      ...(id ? { NOT: { id } } : {}),
    },
  });
}

export async function create(customerData: CustomerData) {
  return await prisma.customer.create({ data: customerData });
}

export async function update(id: string, customerData: CustomerData) {
  return await prisma.customer.update({
    where: {
      id,
    },
    data: customerData,
  });
}

export async function remove(id: string) {
  await prisma.customer.delete({
    where: { id },
  });
}
