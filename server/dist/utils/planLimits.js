import { Account } from "../models/Account.js";
import { Post } from "../models/Post.js";
export const PLAN_LIMITS = {
    starter: { accounts: 2, scheduledPosts: 10, postCredits: 10 },
    pro: { accounts: 10, scheduledPosts: 200, postCredits: 200 },
    agency: { accounts: 999, scheduledPosts: 9999, postCredits: 9999 },
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
export const getPostPlanStatus = async (userId, planType = "starter") => {
    const limits = getLimits(planType);
    const [scheduledPosts, publishedPosts] = await Promise.all([
        Post.countDocuments({ user: userId, status: "scheduled" }),
        Post.countDocuments({ user: userId, status: "published" }),
    ]);
    return {
        scheduledPosts,
        publishedPosts,
        remainingCredits: Math.max(0, limits.postCredits - publishedPosts),
        canSchedulePost: scheduledPosts < limits.scheduledPosts,
        limit: limits.scheduledPosts,
    };
};
