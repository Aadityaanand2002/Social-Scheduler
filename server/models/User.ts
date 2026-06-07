import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Optional for Google Login users
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    planType: {
        type: String,
        enum: ["starter", "pro", "agency"],
        default: "starter"
    },
    planExpiryDate: {
        type: Date
    },
    zernioProfileId: {
        type: String
    },
    profilePicture: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
