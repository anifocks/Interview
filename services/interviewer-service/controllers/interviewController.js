const { ok, created, fail } = require("../utils/response");
const log = require("../utils/logger");
const interviewModel = require("../models/interviewModel");
const candidateModel = require("../models/candidateModel");
const assignmentModel = require("../models/assignmentModel");
const questionModel = require("../models/questionModel");

const SERVICE = "interviewer-service";

const normalizeAnswer = (a) => (a ? {
    answerId: a.AnswerId,
    interviewId: a.InterviewId,
    questionId: a.QuestionId,
    optionId: a.OptionId,
    candidateAnswer: a.CandidateAnswer,
    interviewerNotes: a.InterviewerNotes,
    score: a.Score,
    isCorrect: a.IsCorrect,
    isAnswered: a.IsAnswered,
    answeredAt: a.AnsweredAt
} : null);

const normalizeSafeAnswer = (a) => (a ? {
    answerId: a.AnswerId,
    interviewId: a.InterviewId,
    questionId: a.QuestionId,
    optionId: a.OptionId,
    candidateAnswer: a.CandidateAnswer,
    isAnswered: a.IsAnswered,
    answeredAt: a.AnsweredAt
} : null);

const gradeMcq = (question, optionId) => {
    const selected = (question.Options || []).find((o) => o.OptionId === Number(optionId));
    if (!selected) {
        return {
            selected: null,
            finalAnswer: optionId != null ? String(optionId) : null,
            isCorrect: null,
            autoScore: null
        };
    }
    const correct = (question.Options || []).find((o) => o.IsCorrect);
    const isCorrect = Boolean(correct && selected.OptionId === correct.OptionId);
    return {
        selected,
        finalAnswer: `${selected.OptionLabel}. ${selected.OptionText}`,
        isCorrect,
        autoScore: isCorrect ? 1 : 0
    };
};

const toSafeQuestion = (question, answer) => ({
    questionId: question.QuestionId,
    questionCode: question.QuestionCode,
    questionText: question.QuestionText,
    questionType: question.QuestionType,
    category: question.Category,
    difficulty: question.Difficulty,
    isCommon: question.IsCommon,
    options: (question.Options || []).map((o) => ({
        optionId: o.OptionId,
        label: o.OptionLabel,
        text: o.OptionText
    })),
    answer: normalizeSafeAnswer(answer)
});

const toInterviewerQuestion = (question, answer) => ({
    questionId: question.QuestionId,
    questionCode: question.QuestionCode,
    questionText: question.QuestionText,
    questionType: question.QuestionType,
    category: question.Category,
    difficulty: question.Difficulty,
    isCommon: question.IsCommon,
    expectedAnswer: question.ExpectedAnswer,
    weakAnswer: question.WeakAnswer,
    followUps: (question.FollowUps || []).map((f) => ({
        questionId: f.QuestionId,
        questionCode: f.QuestionCode,
        questionText: f.QuestionText,
        expectedAnswer: f.ExpectedAnswer,
        weakAnswer: f.WeakAnswer
    })),
    publishedAt: question.PublishedAt || null,
    publishedBy: question.PublishedBy || null,
    options: (question.Options || []).map((o) => ({
        optionId: o.OptionId,
        label: o.OptionLabel,
        text: o.OptionText,
        isCorrect: Boolean(o.IsCorrect)
    })),
    answer: normalizeAnswer(answer)
});

const buildQuestions = async (interview, extra) => {
    const requirePublished = extra.forCandidate === true;
    const questions = await assignmentModel.getForCandidate(interview.CandidateId, { publishedOnly: requirePublished });
    const answers = await interviewModel.getAnswers(interview.InterviewId);
    const answersByQuestion = new Map(answers.map((a) => [a.QuestionId, a]));

    const result = [];
    for (const q of questions) {
        const enriched = { ...q, PublishedAt: q.PublishedAt, PublishedBy: q.PublishedBy };
        if (q.QuestionType === "MCQ") {
            const detailed = await questionModel.getById(q.QuestionId);
            enriched.Options = detailed ? detailed.Options : [];
        } else if (q.QuestionType === "ORAL" && extra.forCandidate !== true) {
            const detailed = await questionModel.getById(q.QuestionId);
            enriched.FollowUps = detailed ? detailed.FollowUps : [];
        }
        const answer = answersByQuestion.get(q.QuestionId) || null;
        result.push(extra.forCandidate
            ? toSafeQuestion(enriched, answer)
            : toInterviewerQuestion(enriched, answer));
    }
    return result;
};

const publishQuestion = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const questionId = Number(req.params.questionId);
        await assignmentModel.setPublished(candidateId, questionId, true, req.user.userId);
        return ok(res, { candidateId, questionId, publishedAt: new Date().toISOString() }, "Question published");
    } catch (error) {
        log.error(SERVICE, `Question publish error: ${error.message}`);
        return fail(res, 500, "Failed to publish question");
    }
};

const unpublishQuestion = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const questionId = Number(req.params.questionId);
        await assignmentModel.setPublished(candidateId, questionId, false, req.user.userId);
        return ok(res, { candidateId, questionId, publishedAt: null }, "Question unpublished");
    } catch (error) {
        log.error(SERVICE, `Question unpublish error: ${error.message}`);
        return fail(res, 500, "Failed to unpublish question");
    }
};

const publishAll = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        await assignmentModel.publishAllForCandidate(candidateId, req.user.userId);
        return ok(res, { candidateId }, "All questions published");
    } catch (error) {
        log.error(SERVICE, `Publish all error: ${error.message}`);
        return fail(res, 500, "Failed to publish all questions");
    }
};

const create = async (req, res) => {
    try {
        const { candidateId, interviewDate } = req.body;

        if (!candidateId) {
            return fail(res, 400, "candidateId is required");
        }

        const candidate = await candidateModel.getById(Number(candidateId));
        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }

        const interviewId = await interviewModel.create({
            candidateId: Number(candidateId),
            interviewerId: req.user.userId,
            interviewDate
        });

        const interview = await interviewModel.getById(interviewId);
        const questions = await buildQuestions(interview, { forCandidate: false });
        const criteria = await interviewModel.getCriteriaScores(interviewId);

        return created(res, { interview, questions, criteria }, "Interview created");
    } catch (error) {
        log.error(SERVICE, `Interview create error: ${error.message}`);
        return fail(res, 500, "Failed to create interview");
    }
};

const mine = async (req, res) => {
    try {
        const candidate = await candidateModel.getByUserId(req.user.userId);
        if (!candidate) {
            return fail(res, 404, "No candidate profile linked to this account");
        }
        const interviews = await interviewModel.getMineForCandidate(candidate.CandidateId);
        return ok(res, interviews);
    } catch (error) {
        log.error(SERVICE, `Interview mine error: ${error.message}`);
        return fail(res, 500, "Failed to get my interviews");
    }
};

const list = async (req, res) => {
    try {
        const { status, candidateId } = req.query;
        const interviews = await interviewModel.getAll({ status, candidateId });
        return ok(res, interviews);
    } catch (error) {
        log.error(SERVICE, `Interview list error: ${error.message}`);
        return fail(res, 500, "Failed to get interviews");
    }
};

const candidateInterviews = async (req, res) => {
    try {
        const candidateId = Number(req.params.candidateId);
        const candidate = await candidateModel.getById(candidateId);
        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }
        const interviews = await interviewModel.getMineForCandidate(candidateId);
        return ok(res, interviews);
    } catch (error) {
        log.error(SERVICE, `Candidate interviews error: ${error.message}`);
        return fail(res, 500, "Failed to get candidate interviews");
    }
};

const get = async (req, res) => {
    try {
        const interviewId = Number(req.params.id);
        const interview = await interviewModel.getById(interviewId);

        if (!interview) {
            return fail(res, 404, "Interview not found");
        }

        const isCandidate = req.user.role === "CANDIDATE";

        if (isCandidate) {
            const candidate = await candidateModel.getByUserId(req.user.userId);
            if (!candidate || candidate.CandidateId !== interview.CandidateId) {
                return fail(res, 403, "You can only view your own interview");
            }
        }

        const criteria = await interviewModel.getCriteriaScores(interview.InterviewId);
        const questions = await buildQuestions(interview, { forCandidate: isCandidate });

        return ok(res, { interview, questions, criteria });
    } catch (error) {
        log.error(SERVICE, `Interview get error: ${error.message}`);
        return fail(res, 500, "Failed to get interview");
    }
};

const getQuestions = async (req, res) => {
    try {
        const interviewId = Number(req.params.id);
        const interview = await interviewModel.getById(interviewId);

        if (!interview) {
            return fail(res, 404, "Interview not found");
        }

        const isCandidate = req.user.role === "CANDIDATE";

        if (isCandidate) {
            const candidate = await candidateModel.getByUserId(req.user.userId);
            if (!candidate || candidate.CandidateId !== interview.CandidateId) {
                return fail(res, 403, "You can only view your own interview");
            }
        }

        const questions = await buildQuestions(interview, { forCandidate: isCandidate });
        return ok(res, questions);
    } catch (error) {
        log.error(SERVICE, `Interview questions error: ${error.message}`);
        return fail(res, 500, "Failed to get interview questions");
    }
};

const start = async (req, res) => {
    try {
        const interviewId = Number(req.params.id);
        const interview = await interviewModel.start(interviewId);
        if (!interview) {
            return fail(res, 404, "Interview not found");
        }
        return ok(res, interview, "Interview started");
    } catch (error) {
        log.error(SERVICE, `Interview start error: ${error.message}`);
        return fail(res, 500, "Failed to start interview");
    }
};

const complete = async (req, res) => {
    try {
        const interviewId = Number(req.params.id);
        const interview = await interviewModel.getById(interviewId);
        if (!interview) {
            return fail(res, 404, "Interview not found");
        }

        const { overallComments, criteria } = req.body;

        await interviewModel.complete({
            interviewId,
            overallComments,
            criteria: Array.isArray(criteria) ? criteria : []
        });

        const updated = await interviewModel.getById(interviewId);
        const savedCriteria = await interviewModel.getCriteriaScores(interviewId);

        return ok(res, { interview: updated, criteria: savedCriteria }, "Interview completed");
    } catch (error) {
        log.error(SERVICE, `Interview complete error: ${error.message}`);
        return fail(res, 500, "Failed to complete interview");
    }
};

const saveAnswer = async (req, res) => {
    try {
        const interviewId = Number(req.params.id);
        const { questionId, candidateAnswer, interviewerNotes, score, optionId } = req.body;

        if (!questionId) {
            return fail(res, 400, "questionId is required");
        }

        const interview = await interviewModel.getById(interviewId);
        if (!interview) {
            return fail(res, 404, "Interview not found");
        }

        const isCandidate = req.user.role === "CANDIDATE";
        if (isCandidate) {
            const candidate = await candidateModel.getByUserId(req.user.userId);
            if (!candidate || candidate.CandidateId !== interview.CandidateId) {
                return fail(res, 403, "You can only answer your own interview");
            }
        }

        const question = await questionModel.getById(Number(questionId));
        if (!question) {
            return fail(res, 404, "Question not found");
        }

        let finalAnswer = candidateAnswer ?? null;
        let finalScore = isCandidate ? null : (score ?? null);
        let finalNotes = isCandidate ? null : (interviewerNotes ?? null);
        let finalIsCorrect = null;
        let finalOptionId = question.QuestionType === "MCQ" && optionId != null ? Number(optionId) : null;
        let isAnswered = 1;

        if (question.QuestionType === "MCQ" && optionId != null) {
            const graded = gradeMcq(question, optionId);
            finalAnswer = graded.finalAnswer;
            finalIsCorrect = graded.isCorrect;

            if (isCandidate || score == null) {
                finalScore = graded.autoScore;
            }
        }

        if (isCandidate && finalAnswer == null) {
            return fail(res, 400, "candidateAnswer or optionId is required");
        }

        const answerId = await interviewModel.saveAnswer({
            interviewId,
            questionId: Number(questionId),
            candidateAnswer: finalAnswer,
            interviewerNotes: finalNotes,
            score: finalScore,
            isCorrect: finalIsCorrect,
            optionId: finalOptionId,
            isAnswered
        });

        const answer = await interviewModel.getAnswerById(answerId);
        return created(res, answer, isCandidate ? "Answer submitted" : "Answer recorded");
    } catch (error) {
        log.error(SERVICE, `Answer save error: ${error.message}`);
        return fail(res, 500, "Failed to save answer");
    }
};

const updateAnswer = async (req, res) => {
    try {
        const answerId = Number(req.params.answerId);
        const { candidateAnswer, interviewerNotes, score, optionId } = req.body;

        const existing = await interviewModel.getAnswerById(answerId);
        if (!existing) {
            return fail(res, 404, "Answer not found");
        }

        const interview = await interviewModel.getById(existing.InterviewId);
        if (!interview) {
            return fail(res, 404, "Interview not found");
        }

        const isCandidate = req.user.role === "CANDIDATE";
        if (isCandidate) {
            const candidate = await candidateModel.getByUserId(req.user.userId);
            if (!candidate || candidate.CandidateId !== interview.CandidateId) {
                return fail(res, 403, "You can only edit your own answers");
            }
        }

        const question = await questionModel.getById(existing.QuestionId);

        let finalAnswer = candidateAnswer ?? null;
        let finalScore = isCandidate ? null : (score ?? null);
        let finalNotes = isCandidate ? null : (interviewerNotes ?? null);
        let finalIsCorrect = null;
        let finalOptionId = question && question.QuestionType === "MCQ" && optionId != null ? Number(optionId) : null;

        if (question && question.QuestionType === "MCQ" && optionId != null) {
            const graded = gradeMcq(question, optionId);
            finalAnswer = graded.finalAnswer;
            finalIsCorrect = graded.isCorrect;

            if (isCandidate || score == null) {
                finalScore = graded.autoScore;
            }
        }

        const answer = await interviewModel.updateAnswer({
            answerId,
            candidateAnswer: finalAnswer,
            interviewerNotes: finalNotes,
            score: finalScore,
            isCorrect: finalIsCorrect,
            optionId: finalOptionId,
            isAnswered: finalAnswer ? 1 : existing.IsAnswered
        });

        return ok(res, answer, "Answer updated");
    } catch (error) {
        log.error(SERVICE, `Answer update error: ${error.message}`);
        return fail(res, 500, "Failed to update answer");
    }
};

module.exports = {
    create,
    mine,
    list,
    candidateInterviews,
    get,
    getQuestions,
    start,
    complete,
    saveAnswer,
    updateAnswer,
    publishQuestion,
    unpublishQuestion,
    publishAll
};