import { verifyToken } from "../utils/jwt.js";

export const isAuthenticated = (req, res, next) => {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        const decoded = verifyToken(token);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};