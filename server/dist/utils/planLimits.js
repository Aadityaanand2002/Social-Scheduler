import { Account } from "../models/Account.js";
import { Post } from "../models/Post.js";
export const PLAN_LIMITS = {
    starter: { accounts: 2, scheduledPosts: 10, aiCredits: 5 },
    pro: { accounts: 999999, scheduledPosts: 999999, aiCredits: 200 },
    agency: { accounts: 999999, scheduledPosts: 999999, aiCredits: 999999 },
};
const getLimits = (planType) => PLAN_LIMITS[planType] || PLAN_LIMITS.starter;
export const getAccountPlanStatus = async (userId, planType = "starter") => {
    const limits = getLimits(planType);
    const [connectedAccounts, scheduledPosts] = await Promise.all([
        Account.countDocuments({ user: userId, status: "connected" }),
        Post.countDocuments({ user: userId, status: "scheduled" }),
    ]);
    return {
        connectedAccounts,
        scheduledPosts,
        canConnectAccount: connectedAccounts < limits.accounts,
        canSchedulePost: scheduledPosts < limits.scheduledPosts,
        limits: {
            accounts: limits.accounts,
            scheduledPosts: limits.scheduledPosts,
        },
    };
};
import { Generation } from "../models/Generation.js";
export const getPostPlanStatus = async (userId, planType = "starter") => {
    const limits = getLimits(planType);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [postsThisMonth, generationsThisMonth] = await Promise.all([
        Post.countDocuments({ user: userId, createdAt: { $gte: startOfMonth } }),
        Generation.countDocuments({ user: userId, createdAt: { $gte: startOfMonth } })
    ]);
    return {
        postsThisMonth,
        generationsThisMonth,
        remainingCredits: Math.max(0, limits.aiCredits - generationsThisMonth),
        canSchedulePost: postsThisMonth < limits.scheduledPosts,
        limit: limits.scheduledPosts,
        aiLimit: limits.aiCredits,
    };
};
