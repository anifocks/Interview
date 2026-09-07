const express = require("express");

const router = express.Router();

const {
    login,
    register,
    me,
    listUsers,
    createUser,
    updateUser,
    deactivateUser,
    activateUser
} = require("../controllers/authController");
const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticate, me);

router.get("/users", authenticate, requireInterviewer, listUsers);
router.post("/users", authenticate, requireInterviewer, createUser);
router.put("/users/:id", authenticate, requireInterviewer, updateUser);
router.patch("/users/:id/deactivate", authenticate, requireInterviewer, deactivateUser);
router.patch("/users/:id/activate", authenticate, requireInterviewer, activateUser);

module.exports = router;