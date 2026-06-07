import { GoogleGenAI } from "@google/genai";
import { cloudinary } from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";
import { getPostPlanStatus } from "../utils/planLimits.js";
export const getPosts = async (req, res) => {
    try {
        const planType = req.user?.planType || "starter";
        const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
        const plan = await getPostPlanStatus(req.user._id.toString(), planType);
        res.json({ posts, plan });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const schedulePost = async (req, res) => {
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
        const mediaFile = req.file;
        const parsedPlatforms = JSON.parse(platforms);
        const requiresMedia = parsedPlatforms.includes("instagram");
        if (requiresMedia && !mediaFile) {
            res.status(400).json({ message: "Instagram requires an image or video file." });
            return;
        }
        let mediaUrl = "";
        let mediaType;
        if (mediaFile) {
            const uploadOptions = { resource_type: mediaFile.mimetype.startsWith("video") ? "video" : "image" };
            const payload = mediaFile.buffer ? `data:${mediaFile.mimetype};base64,${mediaFile.buffer.toString("base64")}` : mediaFile.path;
            const result = await cloudinary.uploader.upload(payload, uploadOptions);
            mediaUrl = result.secure_url;
            mediaType = mediaFile.mimetype.startsWith("video") ? "video" : "image";
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
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
        if (!post) {
            res.status(404).json({ message: "Scheduled post not found" });
            return;
        }
        const { title = "", content, scheduledFor, status, platforms } = req.body;
        const mediaFile = req.file;
        const parsedPlatforms = JSON.parse(platforms);
        const requiresMedia = parsedPlatforms.includes("instagram");
        if (requiresMedia && !mediaFile && !post.mediaUrl) {
            res.status(400).json({ message: "Instagram requires an image or video file." });
            return;
        }
        if (mediaFile) {
            const uploadOptions = { resource_type: mediaFile.mimetype.startsWith("video") ? "video" : "image" };
            const payload = mediaFile.buffer ? `data:${mediaFile.mimetype};base64,${mediaFile.buffer.toString("base64")}` : mediaFile.path;
            const result = await cloudinary.uploader.upload(payload, uploadOptions);
            post.mediaUrl = result.secure_url;
            post.mediaType = mediaFile.mimetype.startsWith("video") ? "video" : "image";
        }
        post.title = title;
        post.content = content;
        post.scheduledFor = scheduledFor;
        post.status = status;
        post.platforms = parsedPlatforms;
        await post.save();
        const planType = req.user?.planType || "starter";
        res.json({ post, plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!post) {
            res.status(404).json({ message: "Scheduled post not found" });
            return;
        }
        const planType = req.user?.planType || "starter";
        res.json({ message: "Scheduled post deleted successfully", plan: await getPostPlanStatus(req.user._id.toString(), planType) });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const getGenerations = async (req, res) => {
    try {
        const generations = await Generation.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(generations);
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const generatePost = async (req, res) => {
    try {
        const { prompt, tone } = req.body;
        if (!prompt || !String(prompt).trim()) {
            res.status(400).json({ message: "Please enter a prompt before generating content." });
            return;
        }
        if (!process.env.GEMINI_API_KEY) {
            res.status(500).json({ message: "AI generation is not configured on the server." });
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const fullPrompt = `Write a social media post in a ${tone || "professional"} tone. Prompt: ${String(prompt).trim()}`;
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: fullPrompt,
        });
        res.json({ content: result.text || "" });
    }
    catch (error) {
        const rawMessage = error?.message || "Server error";
        const statusCode = error?.status || error?.response?.status || error?.code;
        const normalizedMessage = String(rawMessage).toLowerCase();
        if (statusCode === 429 || normalizedMessage.includes("quota") || normalizedMessage.includes("rate limit") || normalizedMessage.includes("too many requests")) {
            res.status(429).json({ message: "AI quota exceeded right now. Please try again later or update your Gemini API billing/quota." });
            return;
        }
        res.status(500).json({ message: "Failed to generate content. Please try again." });
    }
};
