import { Response } from "express";
import Stripe from "stripe";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { User } from "../models/User.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const priceIds: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    agency: process.env.STRIPE_AGENCY_PRICE_ID,
    "pro yearly": process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    "agency yearly": process.env.STRIPE_AGENCY_YEARLY_PRICE_ID,
};

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const rawPlan = req.body.plan as string;
        const plan = rawPlan?.toLowerCase();

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

        const basePlan = plan.replace(" yearly", "");
        const interval = plan.includes("yearly") ? "yearly" : "monthly";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${clientUrl}/checkout/success?plan=${basePlan}&interval=${interval}&session_id={CHECKOUT_SESSION_ID}`,
            metadata: { plan: basePlan, userId: req.user._id.toString() },
            cancel_url: `${clientUrl}/#pricing`,
            allow_promotion_codes: true,
            billing_address_collection: "auto",
        });

        res.json({ url: session.url });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const confirmSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.body as { sessionId?: string };

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

        let planExpiryDate: Date | undefined;
        if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
            if (subscription && subscription.current_period_end) {
                planExpiryDate = new Date(subscription.current_period_end * 1000);
            }
        }
        if (!planExpiryDate) {
            planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        // Use the authenticated user's ID instead of trusting the request body
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { planType: plan, planExpiryDate },
            { returnDocument: 'after' }
        );

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
                planExpiryDate: user.planExpiryDate,
                createdAt: user.createdAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
