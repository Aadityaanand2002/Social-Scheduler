import { Request, Response } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { cloudinary } from '../config/cloudinary.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "placeholder");

const generateToken = (id: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone: phone || "",
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                planType: user.planType,
                role: user.role,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && !user.password) {
            res.status(401).json({ message: "Please sign in with Google." });
            return;
        }

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                planType: user.planType,
                role: user.role,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
}

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
             res.status(400).json({ message: "Google credential is required" });
             return;
        }

        let email = "";
        let name = "";
        let googleId = "";
        let picture = "";

        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload) {
                email = payload.email || "";
                name = payload.name || "";
                googleId = payload.sub;
                picture = payload.picture || "";
            }
        } catch (error) {
             console.error("Google Auth verify error:", error);
             res.status(401).json({ message: "Invalid Google token or Client ID not configured properly." });
             return;
        }

        if (!email) {
            res.status(400).json({ message: "Could not retrieve email from Google" });
            return;
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Register new user via Google
            user = await User.create({
                email,
                name,
                googleId,
                profilePicture: picture,
            });
        } else {
            let updated = false;
            // User exists, update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            // Sync profile picture from Google if user doesn't have one
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            planType: user.planType,
            role: user.role,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            token: generateToken(user._id.toString()),
        });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { name, email, phone, removeAvatar } = req.body;

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;

        if (removeAvatar === 'true' || removeAvatar === true) {
            user.profilePicture = "";
        }

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "social-scheduler-avatars",
            });
            user.profilePicture = result.secure_url;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            planType: updatedUser.planType,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            createdAt: updatedUser.createdAt,
            token: generateToken(updatedUser._id.toString()),
        });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
}


export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            planType: user.planType,
            role: user.role,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            token: generateToken(user._id.toString()),
        });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!user.password) {
            res.status(400).json({ message: 'Users registered via Google cannot change passwords' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Current password is incorrect' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
}
