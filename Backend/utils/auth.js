// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../Models/user.js';

const JWT_SECRET = process.env.SECRET_KEY;

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
