import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createCheckoutSession, confirmSession } from "../controllers/billingController.js";
const billingRouter = express.Router();
billingRouter.post("/create-checkout-session", protect, createCheckoutSession);
billingRouter.post("/confirm-session", protect, confirmSession);
export default billingRouter;
