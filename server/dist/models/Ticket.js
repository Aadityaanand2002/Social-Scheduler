import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ["standard", "high"],
        default: "standard",
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved"],
        default: "open",
    },
    replies: [
        {
            sender: { type: String, enum: ["user", "admin"], required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });
export const Ticket = mongoose.model("Ticket", ticketSchema);
