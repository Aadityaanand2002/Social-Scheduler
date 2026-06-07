import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernio.js";
import { ActivityLog } from "../models/ActivityLog.js";
const MEDIA_REQUIRED_PLATFORMS = ["instagram"];
const buildFallbackUrl = (platform, platformPostId) => {
    const map = {
        instagram: `https://www.instagram.com/p/${platformPostId}`,
        linkedin: `https://www.linkedin.com/feed/update/${platformPostId}`,
        facebook: `https://www.facebook.com/${platformPostId}`,
        twitter: `https://x.com/i/web/status/${platformPostId}`,
        facebook_page: `https://www.facebook.com/${platformPostId}`,
        linkedin_page: `https://www.linkedin.com/feed/update/${platformPostId}`,
        instagram_business: `https://www.instagram.com/p/${platformPostId}`,
    };
    return map[platform] || "";
};
const extractPublishedTargets = (publishedPost, platforms) => {
    const candidates = publishedPost?.results || publishedPost?.platforms || publishedPost?.publishedTargets || [];
    if (Array.isArray(candidates) && candidates.length > 0) {
        return candidates.map((item, index) => {
            const platform = item.platform || item.network || platforms[index] || platforms[0];
            const platformPostId = String(item.postId || item.id || item.platformPostId || publishedPost._id || publishedPost.id || '');
            const url = item.url || item.permalink || item.postUrl || buildFallbackUrl(platform, platformPostId);
            return { platform, platformPostId, url };
        });
    }
    const sharedPostId = String(publishedPost._id || publishedPost.id || '');
    return platforms.map((platform) => ({
        platform,
        platformPostId: sharedPostId,
        url: buildFallbackUrl(platform, sharedPostId),
    }));
};
export const initScheduler = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const postsToPublish = await Post.find({
                status: "scheduled",
                scheduledFor: { $lte: now },
            });
            for (const post of postsToPublish) {
                try {
                    const needsMedia = post.platforms.some((p) => MEDIA_REQUIRED_PLATFORMS.includes(p));
                    if (needsMedia && !post.mediaUrl) {
                        console.error(`Post ${post._id} targets ${post.platforms.join(", ")} but has no media. Instagram requires an image or video.`);
                        post.status = "failed";
                        await post.save();
                        continue;
                    }
                    const accounts = await Account.find({
                        user: post.user,
                        platform: { $in: post.platforms },
                        status: "connected",
                        zernioAccountId: { $exists: true },
                    });
                    if (accounts.length === 0) {
                        console.log(`No connected Zernio accounts found for post ${post._id}`);
                        post.status = "failed";
                        await post.save();
                        continue;
                    }
                    const zernioPlatforms = accounts.map((acc) => ({
                        platform: acc.platform,
                        accountId: acc.zernioAccountId,
                    }));
                    const payload = {
                        content: post.content,
                        publishNow: true,
                        platforms: zernioPlatforms,
                    };
                    if (post.mediaUrl) {
                        payload.mediaItems = [{
                                type: post.mediaType || "image",
                                url: post.mediaUrl,
                            }];
                    }
                    console.log(`Publishing post ${post._id} to Zernio:`, JSON.stringify({
                        platforms: zernioPlatforms.map((p) => p.platform),
                        hasMedia: !!post.mediaUrl,
                        mediaType: post.mediaType || "none",
                    }));
                    const response = await zernio.posts.createPost({ body: payload });
                    const publishedPost = response.data?.post || response.data;
                    if (!publishedPost) {
                        throw new Error("Failed to get post object from Zernio response");
                    }
                    post.status = "published";
                    post.set("publishedTargets", extractPublishedTargets(publishedPost, post.platforms));
                    await post.save();
                    await ActivityLog.create({
                        user: post.user,
                        actionType: "POST_PUBLISHED",
                        description: `Published post to ${accounts.map((a) => a.platform).join(", ")}`,
                        relatedPost: post._id,
                    });
                }
                catch (err) {
                    console.error(`Failed to publish post ${post._id}:`, JSON.stringify({
                        status: err?.response?.status,
                        data: err?.response?.data,
                        message: err?.message,
                    }, null, 2));
                    post.status = "failed";
                    await post.save();
                }
            }
            if (postsToPublish.length > 0) {
                console.log(`Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`);
            }
        }
        catch (error) {
            console.error("Error in scheduler:", error);
        }
    });
    console.log("Scheduler service initialized");
};
