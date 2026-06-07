import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Ticket } from "../models/Ticket.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { subject, message, priority } = req.body;

        if (!subject || !message) {
            res.status(400).json({ message: "Subject and message are required" });
            return;
        }

        const planType = req.user?.planType || "starter";
        if (planType === "starter") {
            res.status(403).json({ message: "Priority support requires a Pro or Agency plan." });
            return;
        }

        const ticket = await Ticket.create({
            user: req.user._id,
            subject,
            message,
            priority: priority || (planType === "agency" ? "high" : "standard"),
        });

        // Send email notification to admin
        const adminEmail = process.env.ADMIN_EMAIL || "admin@socialscheduler.com";
        await sendEmail({
            to: adminEmail,
            fromName: req.user.name,
            fromEmail: req.user.email,
            replyTo: req.user.email,
            subject: `[${ticket.priority.toUpperCase()} Priority] New Ticket: ${subject}`,
            text: `User: ${req.user.email} (${req.user.name})\nPlan: ${planType}\n\nMessage:\n${message}\n\nTicket ID: ${ticket._id}`,
        }).catch(err => console.error("Failed to send email", err));

        res.status(201).json({ message: "Ticket created successfully", ticket });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const replyToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ message: "Message is required" });
            return;
        }

        const ticket = await Ticket.findById(req.params.id).populate("user", "name email");
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }

        const isAdmin = req.user.role === "admin";
        
        // Ensure regular users can only reply to their own tickets
        if (!isAdmin && ticket.user._id.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        ticket.replies.push({
            sender: isAdmin ? "admin" : "user",
            message
        });

        // If admin replies, update status to in-progress if it was open
        if (isAdmin && ticket.status === "open") {
            ticket.status = "in-progress";
        }

        await ticket.save();

        // If admin replies, notify the user
        if (isAdmin) {
            const user = ticket.user as any;
            await sendEmail({
                to: user.email,
                subject: `Re: [Ticket ${ticket._id}] ${ticket.subject}`,
                text: `Hello ${user.name},\n\nAn admin has replied to your support ticket:\n\n${message}\n\nYou can reply to this message directly from your Social Scheduler Dashboard.`,
            }).catch(err => console.error("Failed to notify user", err));
        } else {
            // If user replies, notify the admin
            const adminEmail = process.env.ADMIN_EMAIL || "admin@socialscheduler.com";
            const user = ticket.user as any;
            await sendEmail({
                to: adminEmail,
                fromName: user.name,
                fromEmail: user.email,
                replyTo: user.email,
                subject: `Re: [Ticket ${ticket._id}] ${ticket.subject}`,
                text: `User ${user.email} (${user.name}) has replied to the ticket:\n\n${message}\n\nYou can reply to this message directly from the Admin Dashboard.`,
            }).catch(err => console.error("Failed to notify admin", err));
        }

        res.json({ message: "Reply added successfully", ticket });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

// --- ADMIN ROUTES --- //

export const getAdminTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ message: "Access denied. Admins only." });
            return;
        }
        const tickets = await Ticket.find().populate("user", "name email planType").sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ message: "Access denied. Admins only." });
            return;
        }

        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
        
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }

        res.json({ message: "Status updated successfully", ticket });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
