import express from "express";
import cors from "cors";
import customerController from "./controllers/customer-controller";
import { handleException } from "./middlewares/exception-handler";
import purchaseController from "./controllers/purchase-controller";
import { createCustomers } from "./seed/customers";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

customerController(app);
purchaseController(app);

createCustomers();

app.use(handleException);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));
