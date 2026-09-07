const express = require("express");

const router = express.Router();

const {
    getForCandidate,
    replaceForCandidate,
    removeAssignment
} = require("../controllers/assignmentController");

const {
    publishQuestion,
    unpublishQuestion,
    publishAll
} = require("../controllers/interviewController");

const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.use(authenticate, requireInterviewer);

router.get("/:id/questions", getForCandidate);
router.post("/:id/questions", replaceForCandidate);
router.delete("/:id/questions/:questionId", removeAssignment);
router.post("/:id/questions/publish-all", publishAll);
router.post("/:id/questions/:questionId/publish", publishQuestion);
router.delete("/:id/questions/:questionId/publish", unpublishQuestion);

module.exports = router;