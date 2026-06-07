import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { HfInference } from "@huggingface/inference";
import { cloudinary } from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import { getPostPlanStatus } from "../utils/planLimits.js";

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const planType = req.user?.planType || "starter";
        const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
        const plan = await getPostPlanStatus(req.user._id.toString(), planType);
        res.json({ posts, plan });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const planType = req.user?.planType || "starter";
        const plan = await getPostPlanStatus(req.user._id.toString(), planType);

        if (!plan.canSchedulePost) {
            res.status(403).json({
                message: `Your ${planType} plan allows only ${plan.limit} scheduled posts at a time.`,
                plan,
            });
            return;
        }

        const { title = "", content, scheduledFor, status, platforms } = req.body;
        const mediaFile = req.file as Express.Multer.File | undefined;
        const parsedPlatforms = JSON.parse(platforms);

        const userAccounts = await Account.find({ user: req.user._id, status: "connected" });
        const connectedPlatformNames = userAccounts.map(acc => acc.platform.toLowerCase());
        
        const missingPlatforms = [];
        for (const p of parsedPlatforms) {
            const platformStr = String(p).toLowerCase();
            const hasAccount = connectedPlatformNames.some(cp => cp.includes(platformStr) || platformStr.includes(cp));
            if (!hasAccount) {
                missingPlatforms.push(p);
            }
        }

        if (missingPlatforms.length > 0) {
            const platformList = missingPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" and ");
            res.status(400).json({ message: `Please connect your ${platformList} account(s) first before scheduling.` });
            return;
        }
        const requiresMedia = parsedPlatforms.includes("instagram");

        if (requiresMedia && !mediaFile) {
            res.status(400).json({ message: "Instagram requires an image or video file." });
            return;
        }

        let mediaUrl = "";
        let mediaType: "image" | "video" | undefined;

        if (mediaFile) {
            const isVideo = mediaFile.mimetype.startsWith("video");
            const isInstagram = parsedPlatforms.includes("instagram");
            const uploadOptions: any = {
                resource_type: isVideo ? "video" : "image",
                ...(isVideo ? {} : { format: "jpg" }),
                ...(isInstagram && !isVideo ? { transformation: [{ aspect_ratio: "4:5", crop: "fill", gravity: "auto" }] } : {}),
            };
            const payload = mediaFile.buffer ? `data:${mediaFile.mimetype};base64,${mediaFile.buffer.toString("base64")}` : (mediaFile as any).path;
            const result = await cloudinary.uploader.upload(payload, uploadOptions);
            mediaUrl = result.secure_url;
            console.log("Cloudinary uploaded:", { format: result.format, width: result.width, height: result.height, url: mediaUrl });
            mediaType = isVideo ? "video" : "image";
        }

        const post = await Post.create({
            user: req.user._id,
            title,
            content,
            scheduledFor,
            status,
            platforms: parsedPlatforms,
            mediaUrl,
            mediaType,
        });

        res.status(201).json({ post, plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
        if (!post) {
            res.status(404).json({ message: "Scheduled post not found" });
            return;
        }

        const { title = "", content, scheduledFor, status, platforms } = req.body;
        const mediaFile = req.file as Express.Multer.File | undefined;
        const parsedPlatforms = JSON.parse(platforms);

        const userAccounts = await Account.find({ user: req.user._id, status: "connected" });
        const connectedPlatformNames = userAccounts.map(acc => acc.platform.toLowerCase());
        
        const missingPlatforms = [];
        for (const p of parsedPlatforms) {
            const platformStr = String(p).toLowerCase();
            const hasAccount = connectedPlatformNames.some(cp => cp.includes(platformStr) || platformStr.includes(cp));
            if (!hasAccount) {
                missingPlatforms.push(p);
            }
        }

        if (missingPlatforms.length > 0) {
            const platformList = missingPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" and ");
            res.status(400).json({ message: `Please connect your ${platformList} account(s) first before scheduling.` });
            return;
        }

        const requiresMedia = parsedPlatforms.includes("instagram");

        if (requiresMedia && !mediaFile && !post.mediaUrl) {
            res.status(400).json({ message: "Instagram requires an image or video file." });
            return;
        }

        if (mediaFile) {
            const isVideo = mediaFile.mimetype.startsWith("video");
            const isInstagram = parsedPlatforms.includes("instagram");
            const uploadOptions: any = {
                resource_type: isVideo ? "video" : "image",
                ...(isVideo ? {} : { format: "jpg" }),
                ...(isInstagram && !isVideo ? { transformation: [{ aspect_ratio: "4:5", crop: "fill", gravity: "auto" }] } : {}),
            };
            const payload = mediaFile.buffer ? `data:${mediaFile.mimetype};base64,${mediaFile.buffer.toString("base64")}` : (mediaFile as any).path;
            const result = await cloudinary.uploader.upload(payload, uploadOptions);
            post.mediaUrl = result.secure_url;
            post.mediaType = isVideo ? "video" : "image";
        }

        post.title = title;
        post.content = content;
        post.scheduledFor = scheduledFor;
        post.status = status;
        post.platforms = parsedPlatforms;
        await post.save();

        const planType = req.user?.planType || "starter";
        res.json({ post, plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!post) {
            res.status(404).json({ message: "Scheduled post not found" });
            return;
        }

        const planType = req.user?.planType || "starter";
        res.json({ message: "Scheduled post deleted successfully", plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const getGenerations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const generations = await Generation.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(generations);
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

export const generatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prompt, tone, generateImage } = req.body;

        if (!prompt || !String(prompt).trim()) {
            res.status(400).json({ message: "Please enter a prompt before generating content." });
            return;
        }

        if (!process.env.HF_API_KEY) {
            res.status(500).json({ message: "AI generation is not configured on the server." });
            return;
        }

        const planType = req.user?.planType || "starter";
        const plan = await getPostPlanStatus(req.user._id.toString(), planType);
        const isAgency = planType === "agency";

        if (!isAgency && plan.remainingCredits <= 0) {
            res.status(403).json({
                message: `Your ${planType} plan allows only ${plan.aiLimit} AI generations per month. Please upgrade your plan.`,
                plan,
            });
            return;
        }

        const fullPrompt = `Write a social media post in a ${tone || "professional"} tone. Prompt: ${String(prompt).trim()}`;
        let generatedText = "";
        let mediaUrl = "";

        try {
            const hf = new HfInference(process.env.HF_API_KEY);
            const response = await hf.chatCompletion({
                model: "Qwen/Qwen2.5-72B-Instruct",
                messages: [{ role: "user", content: fullPrompt }],
                max_tokens: 500,
            });
            generatedText = response.choices[0]?.message?.content || "";

            if (generateImage) {
                try {
                    const imageBlob: any = await hf.textToImage({
                        model: "stabilityai/stable-diffusion-xl-base-1.0",
                        inputs: String(prompt).trim(),
                    });

                    const arrayBuffer = await imageBlob.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64Image = `data:${imageBlob.type || 'image/jpeg'};base64,${buffer.toString("base64")}`;

                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: "social_scheduler/ai_generations",
                    });
                    
                    mediaUrl = uploadResult.secure_url;
                } catch (imgError) {
                    console.error("Image Generation Error:", imgError);
                }
            }

        } catch (apiError: any) {
            console.error("AI API Error:", apiError);
            throw apiError;
        }

        const newGeneration = await Generation.create({
            user: req.user._id,
            prompt: fullPrompt,
            content: generatedText,
            tone: tone || "professional",
            mediaUrl: mediaUrl || undefined
        });

        res.json({ ...newGeneration.toObject(), plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    } catch (error: any) {
        const rawMessage = error?.message || "Server error";
        const statusCode = error?.status || error?.response?.status || error?.code;
        const normalizedMessage = String(rawMessage).toLowerCase();

        if (statusCode === 429 || normalizedMessage.includes("quota") || normalizedMessage.includes("rate limit") || normalizedMessage.includes("too many requests")) {
            res.status(429).json({ message: "Daily Limit Reached" });
            return;
        }

        res.status(500).json({ message: "Failed to generate content. Please try again." });
    }
};
