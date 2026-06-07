import express from "express";
import { createTicket, getTickets, getAdminTickets, updateTicketStatus, replyToTicket } from "../controllers/supportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/", getTickets);
router.post("/:id/reply", replyToTicket);

// Admin Routes
router.get("/admin/tickets", getAdminTickets);
router.put("/admin/tickets/:id", updateTicketStatus);

export default router;
