import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) {
            return res.status(400).json({ error: "Invalid token payload: user ID missing" });
        }

        req.user = { id: decoded.id };
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

export default authMiddleware;
