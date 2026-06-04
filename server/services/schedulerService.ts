import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernio.js";
import { ActivityLog } from "../models/ActivityLog.js";

// Platforms that require media to be attached
const MEDIA_REQUIRED_PLATFORMS = ["instagram"];

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
                    // Validate: Instagram (and other media-required platforms) must have media
                    const needsMedia = post.platforms.some((p: string) =>
                        MEDIA_REQUIRED_PLATFORMS.includes(p)
                    );

                    if (needsMedia && !post.mediaUrl) {
                        console.error(
                            `Post ${post._id} targets ${post.platforms.join(", ")} but has no media. Instagram requires an image or video.`
                        );
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
                        console.log(
                            `No connected Zernio accounts found for post ${post._id}`
                        );
                        post.status = "failed";
                        await post.save();
                        continue;
                    }

                    const zernioPlatforms = accounts.map((acc) => ({
                        platform: acc.platform as any,
                        accountId: acc.zernioAccountId!,
                    }));

                    const payload: any = {
                        content: post.content,
                        publishNow: true,
                        platforms: zernioPlatforms,
                    };

                    // Attach media if present
                    if (post.mediaUrl) {
                        payload.mediaItems = [
                            {
                                type: post.mediaType || "image",
                                url: post.mediaUrl,
                            },
                        ];
                    }

                    console.log(
                        `Publishing post ${post._id} to Zernio:`,
                        JSON.stringify({
                            platforms: zernioPlatforms.map((p: any) => p.platform),
                            hasMedia: !!post.mediaUrl,
                            mediaType: post.mediaType || "none",
                        })
                    );

                    const response = await zernio.posts.createPost({
                        body: payload,
                    });

                    const publishedPost =
                        (response.data as any)?.post || response.data;

                    if (!publishedPost) {
                        throw new Error(
                            "Failed to get post object from Zernio response"
                        );
                    }

                    console.log(
                        `Zernio post created: ${publishedPost._id || publishedPost.id}`
                    );

                    post.status = "published";
                    await post.save();

                    await ActivityLog.create({
                        user: post.user,
                        actionType: "POST_PUBLISHED",
                        description: `Published post to ${accounts.map((a) => a.platform).join(", ")}`,
                        relatedPost: post._id,
                    });
                } catch (err: any) {
                    console.error(
                        `Failed to publish post ${post._id}:`,
                        JSON.stringify({
                            status: err?.response?.status,
                            data: err?.response?.data,
                            message: err?.message,
                        }, null, 2)
                    );
                    post.status = "failed";
                    await post.save();
                }
            }

            if (postsToPublish.length > 0) {
                console.log(
                    `Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`
                );
            }
        } catch (error) {
            console.error("Error in scheduler:", error);
        }
    });

    console.log("Scheduler service initialized.");
};