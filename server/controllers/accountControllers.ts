import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Account } from "../models/Account.js";
import { getAccountPlanStatus } from "../utils/planLimits.js";
import zernio from "../config/zernio.js";

export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const planType = req.user?.planType || "starter";
        const [accounts, plan] = await Promise.all([
            Account.find({ user: req.user._id }),
            getAccountPlanStatus(req.user._id.toString(), planType),
        ]);

        res.json({ accounts, plan });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const addAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const planType = req.user?.planType || "starter";
        const plan = await getAccountPlanStatus(req.user._id.toString(), planType);

        if (!plan.canConnectAccount) {
            res.status(403).json({
                message: `Your ${planType} plan allows only ${plan.limits.accounts} connected accounts.`,
                plan,
            });
            return;
        }

        const { platform, handle, avatarUrl } = req.body;

        const existingAccount = await Account.findOne({
            user: req.user._id,
            platform,
            status: "connected",
        });

        if (existingAccount) {
            res.status(400).json({ message: "Account already connected for this platform" });
            return;
        }

        const account = await Account.create({
            user: req.user._id,
            platform,
            handle,
            avatarUrl,
        });

        res.status(201).json({ account, plan: await getAccountPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const disconnectAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!account) {
            res.status(404).json({ message: "Account not found" });
            return;
        }

        if (account.zernioAccountId) {
            try {
                await zernio.accounts.deleteAccount({
                    path: {
                        accountId: account.zernioAccountId,
                    },
                });
            } catch (error: any) {
                res.status(500).json({
                    message:
                        error?.response?.data?.message ||
                        error?.message,
                });
                return;
            }
        }

        await account.deleteOne();
        const planType = req.user?.planType || "starter";
        res.json({ message: "Account disconnected successfully", plan: await getAccountPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        res.status(500).json({
            message: error?.message || "Server error",
        });
    }
}
