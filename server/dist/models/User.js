import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    planType: {
        type: String,
        enum: ["starter", "pro", "agency"],
        default: "starter"
    },
    zernioProfileId: {
        type: String
    }
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
