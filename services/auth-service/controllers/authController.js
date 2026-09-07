const userModel = require("../models/userModel");
const { comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await userModel.findByUsername(username);

        if (!user || !comparePassword(password, user.PasswordHash)) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        if (!user.IsActive) {
            return res.status(403).json({
                success: false,
                message: "This account is deactivated"
            });
        }

        const token = signToken(user);

        return res.json({
            success: true,
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                fullName: user.FullName,
                role: user.Role,
                email: user.Email
            }
        });
    } catch (error) {
        console.error("[auth-service] Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, password, fullName, role, email } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "username, password and role are required"
            });
        }

        const validRoles = ["INTERVIEWER", "CANDIDATE"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be INTERVIEWER or CANDIDATE"
            });
        }

        const existing = await userModel.findByUsername(username);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const inserted = await userModel.create({
            username,
            password,
            fullName: fullName || username,
            role,
            email
        });

        return res.status(201).json({
            success: true,
            userId: inserted.UserId,
            message: "User registered"
        });
    } catch (error) {
        console.error("[auth-service] Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};

const me = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("[auth-service] Me error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load user"
        });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await userModel.getAll();
        return res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("[auth-service] List users error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to list users"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, fullName, role, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "username and password are required"
            });
        }

        const validRoles = ["INTERVIEWER", "CANDIDATE"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be INTERVIEWER or CANDIDATE"
            });
        }

        const existing = await userModel.findByUsername(username);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const inserted = await userModel.create({
            username,
            password,
            fullName: fullName || username,
            role,
            email
        });

        const userId = inserted.UserId;

        if (role === "CANDIDATE") {
            const profile = await userModel.getCandidateByUserId(userId);
            if (!profile) {
                await userModel.createCandidateProfile({
                    userId,
                    fullName: fullName || username,
                    email
                });
            }
        }

        const user = await userModel.findById(userId);
        return res.status(201).json({
            success: true,
            user,
            message: "User created"
        });
    } catch (error) {
        console.error("[auth-service] Create user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { fullName, email, role, password } = req.body;

        const existing = await userModel.findById(userId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const validRoles = ["INTERVIEWER", "CANDIDATE"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be INTERVIEWER or CANDIDATE"
            });
        }

        const user = await userModel.update(userId, {
            fullName: fullName || existing.FullName,
            email: email !== undefined ? email : existing.Email,
            role,
            password
        });

        if (role === "CANDIDATE") {
            const profile = await userModel.getCandidateByUserId(userId);
            if (!profile) {
                await userModel.createCandidateProfile({
                    userId,
                    fullName: fullName || existing.FullName,
                    email
                });
            }
        }

        return res.json({
            success: true,
            user,
            message: "User updated"
        });
    } catch (error) {
        console.error("[auth-service] Update user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const existing = await userModel.findById(userId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await userModel.setActive(userId, false);
        await userModel.setCandidateStatusByUserId(userId, "INACTIVE");

        return res.json({
            success: true,
            user,
            message: "User deactivated"
        });
    } catch (error) {
        console.error("[auth-service] Deactivate user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to deactivate user"
        });
    }
};

const activateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        const existing = await userModel.findById(userId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await userModel.setActive(userId, true);
        await userModel.setCandidateStatusByUserId(userId, "ACTIVE");

        return res.json({
            success: true,
            user,
            message: "User activated"
        });
    } catch (error) {
        console.error("[auth-service] Activate user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to activate user"
        });
    }
};

module.exports = {
    login,
    register,
    me,
    listUsers,
    createUser,
    updateUser,
    deactivateUser,
    activateUser
};