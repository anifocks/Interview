const express = require("express");

const router = express.Router();

const {
    create,
    mine,
    list,
    candidateInterviews,
    get,
    getQuestions,
    start,
    complete,
    saveAnswer,
    updateAnswer
} = require("../controllers/interviewController");

const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.post("/", authenticate, requireInterviewer, create);

router.get("/", authenticate, requireInterviewer, list);

router.get("/mine", authenticate, mine);

router.get("/candidate/:candidateId", authenticate, requireInterviewer, candidateInterviews);

router.get("/:id", authenticate, get);
router.get("/:id/questions", authenticate, getQuestions);

router.put("/:id/start", authenticate, requireInterviewer, start);
router.put("/:id/complete", authenticate, requireInterviewer, complete);

router.post("/:id/answers", authenticate, saveAnswer);
router.put("/:id/answers/:answerId", authenticate, updateAnswer);

module.exports = router;