import Stripe from "stripe";
import { User } from "../models/User.js";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const priceIds = {
    Pro: process.env.STRIPE_PRO_PRICE_ID,
    Agency: process.env.STRIPE_AGENCY_PRICE_ID,
};
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
export const createCheckoutSession = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!plan || !(plan in priceIds)) {
            res.status(400).json({ message: "Please choose a valid paid plan." });
            return;
        }
        if (!stripe) {
            res.status(500).json({ message: "Stripe is not configured on the server." });
            return;
        }
        const priceId = priceIds[plan];
        if (!priceId) {
            res.status(500).json({ message: `${plan} price is missing from the server configuration.` });
            return;
        }
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${clientUrl}/checkout/success?plan=${plan.toLowerCase()}&session_id={CHECKOUT_SESSION_ID}`,
            metadata: { plan: plan.toLowerCase(), userId: req.user._id.toString() },
            cancel_url: `${clientUrl}/#pricing`,
            allow_promotion_codes: true,
            billing_address_collection: "auto",
        });
        res.json({ url: session.url });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const confirmSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            res.status(400).json({ message: "sessionId is required." });
            return;
        }
        if (!stripe) {
            res.status(500).json({ message: "Stripe is not configured on the server." });
            return;
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid" && session.status !== "complete") {
            res.status(400).json({ message: "Stripe checkout is not completed yet." });
            return;
        }
        const plan = String(session.metadata?.plan || "").toLowerCase();
        if (!["pro", "agency"].includes(plan)) {
            res.status(400).json({ message: "Purchased plan could not be determined." });
            return;
        }
        // Use the authenticated user's ID instead of trusting the request body
        const user = await User.findByIdAndUpdate(req.user._id, { planType: plan }, { new: true });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.json({
            message: "Plan updated successfully.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                planType: user.planType,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
