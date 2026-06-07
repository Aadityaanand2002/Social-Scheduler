import mongoose from "mongoose";

const publishedTargetSchema = new mongoose.Schema({
    platform: {
        type: String,
        enum: ["twitter", "linkedin", "facebook", "instagram", "facebook_page", "linkedin_page", "instagram_business"],
        required: true,
    },
    platformPostId: { type: String },
    url: { type: String },
}, { _id: false })

const postSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String, default: "" },
    content: {type: String, required: true},
    mediaUrl: {type: String},
    mediaType: {type: String, enum: ["image", "video"]},
    platforms: [{type: String, enum: ["twitter", "linkedin", "facebook", "instagram", "facebook_page", "linkedin_page", "instagram_business"]}],
    scheduledFor: {type: Date, required: true},
    status: {type:String, enum: ["draft", "scheduled", "published", "failed"], default: "scheduled"},
    publishedTargets: { type: [publishedTargetSchema], default: [] },
}, {timestamps: true})

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ user: 1, status: 1 });
postSchema.index({ user: 1, scheduledFor: -1 });

export const Post = mongoose.model("Post", postSchema)

