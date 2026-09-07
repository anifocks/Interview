const { ok, created, fail } = require("../utils/response");
const log = require("../utils/logger");
const questionModel = require("../models/questionModel");

const SERVICE = "interviewer-service";

const list = async (req, res) => {
    try {
        const { category, difficulty, type } = req.query;
        const questions = await questionModel.getAll({ category, difficulty, type });
        return ok(res, questions);
    } catch (error) {
        log.error(SERVICE, `Question list error: ${error.message}`);
        return fail(res, 500, "Failed to get questions");
    }
};

const get = async (req, res) => {
    try {
        const question = await questionModel.getById(Number(req.params.id));
        if (!question) {
            return fail(res, 404, "Question not found");
        }
        return ok(res, question);
    } catch (error) {
        log.error(SERVICE, `Question get error: ${error.message}`);
        return fail(res, 500, "Failed to get question");
    }
};

const create = async (req, res) => {
    try {
        const {
            questionCode, questionText, questionType, category,
            difficulty, expectedAnswer, weakAnswer, isCommon, options
        } = req.body;

        if (!questionText || !questionType || !difficulty) {
            return fail(res, 400, "questionText, questionType and difficulty are required");
        }

        if (!["ORAL", "MCQ"].includes(questionType)) {
            return fail(res, 400, "questionType must be ORAL or MCQ");
        }

        if (questionType === "MCQ" && (!options || options.length < 2)) {
            return fail(res, 400, "MCQ questions need at least two options");
        }

        const question = await questionModel.create({
            questionCode,
            questionText,
            questionType,
            category,
            difficulty,
            expectedAnswer,
            weakAnswer,
            isCommon,
            createdBy: req.user.userId,
            options
        });

        return created(res, question, "Question created");
    } catch (error) {
        log.error(SERVICE, `Question create error: ${error.message}`);
        return fail(res, 500, error.message.includes("duplicate") ? "Question code already exists" : "Failed to create question");
    }
};

const update = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const {
            questionCode, questionText, questionType, category,
            difficulty, expectedAnswer, weakAnswer, isCommon, options
        } = req.body;

        if (!questionText || !questionType || !difficulty) {
            return fail(res, 400, "questionText, questionType and difficulty are required");
        }

        const existing = await questionModel.getById(questionId);
        if (!existing) {
            return fail(res, 404, "Question not found");
        }

        const question = await questionModel.update(questionId, {
            questionCode,
            questionText,
            questionType,
            category,
            difficulty,
            expectedAnswer,
            weakAnswer,
            isCommon,
            options
        });

        return ok(res, question, "Question updated");
    } catch (error) {
        log.error(SERVICE, `Question update error: ${error.message}`);
        return fail(res, 500, "Failed to update question");
    }
};

const remove = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const question = await questionModel.getById(questionId);
        if (!question) {
            return fail(res, 404, "Question not found");
        }
        await questionModel.remove(questionId);
        return ok(res, null, "Question deactivated");
    } catch (error) {
        log.error(SERVICE, `Question delete error: ${error.message}`);
        return fail(res, 500, "Failed to delete question");
    }
};

const setStatus = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return fail(res, 400, "isActive boolean is required");
        }

        const existing = await questionModel.getById(questionId);
        if (!existing) {
            return fail(res, 404, "Question not found");
        }

        const question = await questionModel.setActive(questionId, isActive);
        return ok(res, question, isActive ? "Question activated" : "Question deactivated");
    } catch (error) {
        log.error(SERVICE, `Question status error: ${error.message}`);
        return fail(res, 500, "Failed to update question status");
    }
};

const listCommon = async (req, res) => {
    try {
        const questions = await questionModel.getCommon();
        return ok(res, questions);
    } catch (error) {
        log.error(SERVICE, `Common question list error: ${error.message}`);
        return fail(res, 500, "Failed to get common questions");
    }
};

const listOral = async (req, res) => {
    try {
        const { includeFollowUps } = req.query;
        const questions = await questionModel.getOral(includeFollowUps !== "false");
        return ok(res, questions);
    } catch (error) {
        log.error(SERVICE, `Oral question list error: ${error.message}`);
        return fail(res, 500, "Failed to get oral questions");
    }
};

module.exports = {
    list,
    get,
    create,
    update,
    remove,
    setStatus,
    listCommon,
    listOral
};