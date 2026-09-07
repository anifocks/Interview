const { ok, created, fail } = require("../utils/response");
const log = require("../utils/logger");
const assignmentModel = require("../models/assignmentModel");
const candidateModel = require("../models/candidateModel");
const questionModel = require("../models/questionModel");

const SERVICE = "interviewer-service";

const getForCandidate = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const candidate = await candidateModel.getById(candidateId);
        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }

        const assignments = await assignmentModel.getForCandidate(candidateId);
        return ok(res, assignments);
    } catch (error) {
        log.error(SERVICE, `Assignments get error: ${error.message}`);
        return fail(res, 500, "Failed to get candidate questions");
    }
};

const replaceForCandidate = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const { questionIds } = req.body;

        const candidate = await candidateModel.getById(candidateId);
        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }

        if (!Array.isArray(questionIds)) {
            return fail(res, 400, "questionIds array is required");
        }

        for (const qId of questionIds) {
            const question = await questionModel.getById(Number(qId));
            if (!question || !question.IsActive) {
                return fail(res, 400, `Question ${qId} does not exist or is inactive`);
            }
        }

        const assignments = await assignmentModel.replaceForCandidate(
            candidateId,
            questionIds.map(Number),
            req.user.userId
        );

        return created(res, assignments, "Assignments saved");
    } catch (error) {
        log.error(SERVICE, `Assignments replace error: ${error.message}`);
        return fail(res, 500, "Failed to save assignments");
    }
};

const removeAssignment = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const questionId = Number(req.params.questionId);

        await assignmentModel.removeAssignment(candidateId, questionId);
        return ok(res, null, "Assignment removed");
    } catch (error) {
        log.error(SERVICE, `Assignment remove error: ${error.message}`);
        return fail(res, 500, "Failed to remove assignment");
    }
};

const getForQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const question = await questionModel.getById(questionId);
        if (!question) {
            return fail(res, 404, "Question not found");
        }

        const assignments = await assignmentModel.getForQuestion(questionId);
        return ok(res, assignments);
    } catch (error) {
        log.error(SERVICE, `Question assignments get error: ${error.message}`);
        return fail(res, 500, "Failed to get candidates for question");
    }
};

const replaceForQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const { candidateIds } = req.body;

        const question = await questionModel.getById(questionId);
        if (!question || !question.IsActive) {
            return fail(res, 400, "Question does not exist or is inactive");
        }

        if (!Array.isArray(candidateIds)) {
            return fail(res, 400, "candidateIds array is required");
        }

        for (const cId of candidateIds) {
            const candidate = await candidateModel.getById(Number(cId));
            if (!candidate) {
                return fail(res, 400, `Candidate ${cId} does not exist`);
            }
        }

        const assignments = await assignmentModel.replaceForQuestion(
            questionId,
            candidateIds.map(Number),
            req.user.userId
        );

        return ok(res, assignments, "Candidates assigned");
    } catch (error) {
        log.error(SERVICE, `Question assignments replace error: ${error.message}`);
        return fail(res, 500, "Failed to save candidates");
    }
};

module.exports = {
    getForCandidate,
    replaceForCandidate,
    removeAssignment,
    getForQuestion,
    replaceForQuestion
};