// controllers/userController.js
import User from '../Models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY; // move this to .env

export const registerController = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ email, username, password });
        await newUser.save();

        // Generate token
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const verifyTokenController = async (req, res) => {
    const auth = req.headers['authorization'];
    console.log("AUTH HEADER:", auth);

    const token = auth?.split(" ")[1];
    console.log("TOKEN:", token);

    if (!token)
        return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        console.log("VERIFY ERROR:", err);
        console.log("DECODED TOKEN:", decoded);

        if (err)
            return res.status(401).json({ message: "Invalid token" });

        const user = await User.findById(decoded.id);
        console.log("FOUND USER:", user);

        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Token is valid",
            userId: decoded.id,
            username: user.username
        });
    });
};

