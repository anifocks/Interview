const express = require("express");

const router = express.Router();

const {
    list,
    get,
    create,
    update,
    remove,
    setStatus,
    listCommon,
    listOral
} = require("../controllers/questionController");

const { authenticate, requireInterviewer } = require("../middleware/authMiddleware");

router.use(authenticate, requireInterviewer);

router.get("/common", listCommon);
router.get("/oral", listOral);
router.get("/", list);
router.get("/:id", get);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/status", setStatus);
router.delete("/:id", remove);

module.exports = router;