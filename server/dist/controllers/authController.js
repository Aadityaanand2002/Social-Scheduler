import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
export const registerUser = async (req, res) => {
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
                createdAt: user.createdAt,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                planType: user.planType,
                createdAt: user.createdAt,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, phone } = req.body;
        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            planType: updatedUser.planType,
            createdAt: updatedUser.createdAt,
            token: generateToken(updatedUser._id.toString()),
        });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
};
export const getCurrentUser = async (req, res) => {
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
            createdAt: user.createdAt,
            token: generateToken(user._id.toString()),
        });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
};
export const changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Current password is incorrect' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error?.message || 'Server error' });
    }
};
