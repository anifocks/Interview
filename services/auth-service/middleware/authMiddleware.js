const authenticate = (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const { verifyToken } = require("../utils/jwt");
        const payload = verifyToken(header.slice(7));
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const requireInterviewer = (req, res, next) => {
    if (!req.user || req.user.role !== "INTERVIEWER") {
        return res.status(403).json({ success: false, message: "Forbidden: interviewer role required" });
    }
    return next();
};

module.exports = {
    authenticate,
    requireInterviewer
};