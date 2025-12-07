import { Router, type Express } from "express";
import * as customerService from "../services/customer-service";
import { CustomerData } from "../types/customer";
import { validateRequestBody } from "../middlewares/request-body-validator";
import { customerSchema } from "../validators/customer";

export default function customerController(app: Express) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const { page, pageSize, name, email, cpf, phone } = req.query as {
        page?: string;
        pageSize?: string;
        name?: string;
        email?: string;
        cpf?: string;
        phone?: string;
      };

      const { customers, totalCount } = await customerService.getCustomers(
        page,
        pageSize,
        name,
        email,
        cpf,
        phone
      );

      res.status(200).json({ customers, totalCount });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    validateRequestBody(customerSchema),
    async (req, res, next) => {
      try {
        const customerData: CustomerData = req.body;
        const customer = await customerService.createCustomer(customerData);

        res.status(200).json(customer);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/:id",
    validateRequestBody(customerSchema),
    async (req, res, next) => {
      try {
        const customerId = req.params.id;
        const customerData: CustomerData = req.body;
        const customer = await customerService.updateCustomer(
          customerId,
          customerData
        );

        res.status(200).json(customer);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      const customerId = req.params.id;
      await customerService.removeCustomer(customerId);

      res.status(200).json({ message: "Customer successfully deleted." });
    } catch (error) {
      next(error);
    }
  });

  app.use("/customer", router);
}
