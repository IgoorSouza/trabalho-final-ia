import { ConflictException } from "../exceptions/conflict-exception";
import * as customerService from "../services/customer-service";
import { CustomerData } from "../types/customer";

export async function createCustomers() {
  const customers: CustomerData[] = [
    {
      name: "Igor Souza de Castro",
      email: "igor.castro@estudante.iftm.edu.br",
      cpf: "12345678910",
      phone: "12934567891",
    },
    {
      name: "Tiago Souza de Castro",
      email: "tiago.castro@estudante.iftm.edu.br",
      cpf: "12345678911",
      phone: "12934567892",
    },
  ];

  await Promise.all(
    customers.map(async (customer) => {
      try {
        await customerService.throwErrorIfCustomerWithEmailOrCpfOrPhoneExists(
          customer.email,
          customer.cpf,
          customer.phone
        );
        await customerService.createCustomer(customer);
      } catch (error) {
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    })
  );

  console.info("Customers successfully seeded.");
}
