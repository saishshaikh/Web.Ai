


import express from "express";
import isAuth from "../middlewares/isAuth.js"; // { } hata diya
import { billing, verifyPayment } from "../controllers/billing.controller.js"; // verifyPayment function export karein

const billingRouter = express.Router();

billingRouter.post("/create-order", isAuth, billing);
billingRouter.post("/verify-payment", isAuth, verifyPayment); // Naya route

export default billingRouter;