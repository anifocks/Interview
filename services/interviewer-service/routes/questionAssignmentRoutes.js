const express = require("express");

const router = express.Router();

const {
    getForQuestion,
    replaceForQuestion
} = require("../controllers/assignmentController");

const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.use(authenticate, requireInterviewer);

router.get("/:id/candidates", getForQuestion);
router.put("/:id/candidates", replaceForQuestion);

module.exports = router;