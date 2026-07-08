import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { billing, verifyPayment } from "../Controllers/billing.controller.js";

const billingRouter = express.Router();

billingRouter.post("/create-order", isAuth, billing);
billingRouter.post("/verify-payment", isAuth, verifyPayment);

export default billingRouter;