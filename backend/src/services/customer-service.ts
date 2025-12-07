import * as customerRepository from "../repositories/customer-repository";
import { ConflictException } from "../exceptions/conflict-exception";
import { NotFoundException } from "../exceptions/not-found-exception";
import { CustomerData } from "../types/customer";

export async function getCustomers(
  page?: string,
  pageSize?: string,
  name?: string,
  email?: string,
  cpf?: string,
  phone?: string
) {
  const pageNumber = Math.max(parseInt(page || "1") - 1, 0);
  const pageSizeNumber = Math.max(parseInt(pageSize || "10"), 1);

  const [customers, totalCount] = await Promise.all([
    customerRepository.findPage(
      pageNumber,
      pageSizeNumber,
      name,
      email,
      cpf,
      phone
    ),
    customerRepository.findTotalCount(name, email, cpf, phone),
  ]);

  return {
    customers: customers.map((customer) => ({
      ...customer,
      purchases: undefined,
      payments: undefined,
      totalPurchasesValue: customer.purchases.reduce(
        (acc, purchase) => acc + purchase.value,
        0
      ),
    })),
    totalCount,
  };
}

export async function getCustomerById(id: string) {
  const customer = await customerRepository.findById(id);
  if (!customer) throw new NotFoundException("Customer not found.");
  return customer;
}

export async function createCustomer(customerData: CustomerData) {
  await throwErrorIfCustomerWithEmailOrCpfOrPhoneExists(
    customerData.email,
    customerData.cpf,
    customerData.phone
  );

  return await customerRepository.create(customerData);
}

export async function updateCustomer(id: string, customerData: CustomerData) {
  await throwErrorIfCustomerNotExists(id);
  await throwErrorIfCustomerWithEmailOrCpfOrPhoneExists(
    customerData.email,
    customerData.cpf,
    customerData.phone,
    id
  );

  return await customerRepository.update(id, customerData);
}

export async function removeCustomer(id: string) {
  await throwErrorIfCustomerNotExists(id);
  await customerRepository.remove(id);
}

async function throwErrorIfCustomerNotExists(id: string) {
  const customer = await customerRepository.findById(id);

  if (!customer) {
    throw new NotFoundException("Customer not found.");
  }
}

export async function throwErrorIfCustomerWithEmailOrCpfOrPhoneExists(
  email: string,
  cpf: string,
  phone: string,
  id?: string
) {
  const customerWithSameEmailOrPhone =
    await customerRepository.findByEmailOrCpfOrPhone(email, cpf, phone, id);

  if (customerWithSameEmailOrPhone) {
    throw new ConflictException("Phone or email already in use.");
  }
}
