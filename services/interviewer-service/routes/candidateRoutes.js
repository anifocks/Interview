const express = require("express");

const router = express.Router();

const {
    list,
    get,
    create,
    update,
    remove
} = require("../controllers/candidateController");

const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.use(authenticate, requireInterviewer);

router.get("/", list);
router.get("/:id", get);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;