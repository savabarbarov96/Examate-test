import jwt from "jsonwebtoken";
/**
 * Protect middleware for dashboard-service
 * Verifies JWT token from cookies
 * Does not validate user in database (assumed valid if token is valid)
 */
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        // Attach user info to request
        // @ts-ignore
        req.user = {
            _id: decoded.id,
            client: decoded.client || "",
            email: decoded.email || "",
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
