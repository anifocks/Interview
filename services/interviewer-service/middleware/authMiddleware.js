const { verifyToken } = require("../utils/jwt");

function authenticate(req, res, next) {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        req.user = verifyToken(header.slice(7));
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

function requireInterviewer(req, res, next) {
    if (!req.user || req.user.role !== "INTERVIEWER") {
        return res.status(403).json({ success: false, message: "Forbidden: interviewer role required" });
    }
    return next();
}

function requireCandidate(req, res, next) {
    if (!req.user || req.user.role !== "CANDIDATE") {
        return res.status(403).json({ success: false, message: "Forbidden: candidate role required" });
    }
    return next();
}

function optionalAuth(req, res, next) {
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
        try {
            req.user = verifyToken(header.slice(7));
        } catch (err) {
            req.user = null;
        }
    }
    return next();
}

module.exports = {
    authenticate,
    requireInterviewer,
    requireCandidate,
    optionalAuth
};