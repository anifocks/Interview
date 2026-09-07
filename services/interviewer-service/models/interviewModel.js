const { sql, poolPromise } = require("../config/db");

const create = async ({ candidateId, interviewerId, interviewDate }) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .input("interviewerId", sql.Int, interviewerId)
        .input("interviewDate", sql.Date, interviewDate || new Date())
        .query(`
            INSERT INTO dbo.Interviews (CandidateId, InterviewerId, InterviewDate, Status)
            OUTPUT INSERTED.InterviewId
            VALUES (@candidateId, @interviewerId, @interviewDate, 'NOT_STARTED')
        `);
    return result.recordset[0].InterviewId;
};

const getById = async (interviewId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .query(`
            SELECT
                i.InterviewId,
                i.CandidateId,
                i.InterviewerId,
                i.InterviewDate,
                i.Status,
                i.OverallScore,
                i.OverallComments,
                i.StartedAt,
                i.CompletedAt,
                i.CreatedAt,
                c.CandidateName,
                c.Position,
                c.Email       AS CandidateEmail,
                u.FullName    AS InterviewerName
            FROM dbo.Interviews i
            INNER JOIN dbo.Candidates c ON c.CandidateId = i.CandidateId
            LEFT JOIN dbo.Users u ON u.UserId = i.InterviewerId
            WHERE i.InterviewId = @interviewId
        `);
    return result.recordset[0] || null;
};

const getMineForCandidate = async (candidateId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .query(`
            SELECT
                i.InterviewId,
                i.CandidateId,
                i.InterviewerId,
                i.InterviewDate,
                i.Status,
                i.OverallScore,
                i.OverallComments,
                i.StartedAt,
                i.CompletedAt,
                i.CreatedAt,
                c.CandidateName,
                c.Position,
                u.FullName AS InterviewerName
            FROM dbo.Interviews i
            INNER JOIN dbo.Candidates c ON c.CandidateId = i.CandidateId
            LEFT JOIN dbo.Users u ON u.UserId = i.InterviewerId
            WHERE i.CandidateId = @candidateId
            ORDER BY i.CreatedAt DESC
        `);
    return result.recordset;
};

const getAll = async ({ status, candidateId } = {}) => {
    const pool = await poolPromise;
    const request = pool.request();

    let where = "WHERE 1 = 1";
    if (status) {
        where += " AND i.Status = @status";
        request.input("status", sql.NVarChar(20), status);
    }
    if (candidateId) {
        where += " AND i.CandidateId = @candidateId";
        request.input("candidateId", sql.Int, candidateId);
    }

    const result = await request.query(`
        SELECT
            i.InterviewId,
            i.CandidateId,
            i.InterviewerId,
            i.InterviewDate,
            i.Status,
            i.OverallScore,
            i.OverallComments,
            i.StartedAt,
            i.CompletedAt,
            i.CreatedAt,
            c.CandidateName,
            c.Position,
            u.FullName AS InterviewerName
        FROM dbo.Interviews i
        INNER JOIN dbo.Candidates c ON c.CandidateId = i.CandidateId
        LEFT JOIN dbo.Users u ON u.UserId = i.InterviewerId
        ${where}
        ORDER BY i.CreatedAt DESC
    `);
    return result.recordset;
};

const getAnswers = async (interviewId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .query(`
            SELECT
                a.AnswerId,
                a.InterviewId,
                a.QuestionId,
                a.OptionId,
                a.CandidateAnswer,
                a.InterviewerNotes,
                a.Score,
                a.IsCorrect,
                a.IsAnswered,
                a.AnsweredAt,
                q.QuestionCode,
                q.QuestionType
            FROM dbo.InterviewAnswers a
            INNER JOIN dbo.Questions q ON q.QuestionId = a.QuestionId
            WHERE a.InterviewId = @interviewId
        `);
    return result.recordset;
};

const getAnswerByQuestion = async (interviewId, questionId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .input("questionId", sql.Int, questionId)
        .query(`
            SELECT TOP 1
                a.AnswerId, a.InterviewId, a.QuestionId, a.OptionId, a.CandidateAnswer,
                a.InterviewerNotes, a.Score, a.IsCorrect, a.IsAnswered, a.AnsweredAt
            FROM dbo.InterviewAnswers a
            WHERE a.InterviewId = @interviewId AND a.QuestionId = @questionId
        `);
    return result.recordset[0] || null;
};

const getAnswerById = async (answerId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("answerId", sql.Int, answerId)
        .query(`
            SELECT TOP 1
                a.AnswerId, a.InterviewId, a.QuestionId, a.OptionId, a.CandidateAnswer,
                a.InterviewerNotes, a.Score, a.IsCorrect, a.IsAnswered, a.AnsweredAt
            FROM dbo.InterviewAnswers a
            WHERE a.AnswerId = @answerId
        `);
    return result.recordset[0] || null;
};

const saveAnswer = async ({ interviewId, questionId, candidateAnswer, interviewerNotes, score, isCorrect, optionId, isAnswered }) => {
    const pool = await poolPromise;
    const existing = await getAnswerByQuestion(interviewId, questionId);

    if (existing) {
        await pool
            .request()
            .input("answerId", sql.Int, existing.AnswerId)
            .input("optionId", sql.Int, optionId)
            .input("candidateAnswer", sql.NVarChar(sql.MAX), candidateAnswer)
            .input("interviewerNotes", sql.NVarChar(sql.MAX), interviewerNotes)
            .input("score", sql.Int, score)
            .input("isCorrect", sql.Bit, isCorrect)
            .input("isAnswered", sql.Bit, isAnswered ? 1 : 0)
            .input("answeredAt", sql.DateTime2, isAnswered ? new Date() : existing.AnsweredAt)
            .query(`
                UPDATE dbo.InterviewAnswers
                SET OptionId        = @optionId,
                    CandidateAnswer  = @candidateAnswer,
                    InterviewerNotes = @interviewerNotes,
                    Score            = @score,
                    IsCorrect        = @isCorrect,
                    IsAnswered       = @isAnswered,
                    AnsweredAt       = @answeredAt
                WHERE AnswerId = @answerId
            `);
        return existing.AnswerId;
    }

    const result = await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .input("questionId", sql.Int, questionId)
        .input("optionId", sql.Int, optionId)
        .input("candidateAnswer", sql.NVarChar(sql.MAX), candidateAnswer)
        .input("interviewerNotes", sql.NVarChar(sql.MAX), interviewerNotes)
        .input("score", sql.Int, score)
        .input("isCorrect", sql.Bit, isCorrect)
        .input("isAnswered", sql.Bit, isAnswered ? 1 : 0)
        .input("answeredAt", sql.DateTime2, isAnswered ? new Date() : null)
        .query(`
            INSERT INTO dbo.InterviewAnswers (
                InterviewId, QuestionId, OptionId, CandidateAnswer, InterviewerNotes, Score, IsCorrect, IsAnswered, AnsweredAt
            )
            OUTPUT INSERTED.AnswerId
            VALUES (@interviewId, @questionId, @optionId, @candidateAnswer, @interviewerNotes, @score, @isCorrect, @isAnswered, @answeredAt)
        `);
    return result.recordset[0].AnswerId;
};

const updateAnswer = async ({ answerId, candidateAnswer, interviewerNotes, score, isCorrect, optionId, isAnswered }) => {
    const pool = await poolPromise;
    const existing = await getAnswerById(answerId);
    if (!existing) {
        return null;
    }

    await pool
        .request()
        .input("answerId", sql.Int, answerId)
        .input("optionId", sql.Int, optionId)
        .input("candidateAnswer", sql.NVarChar(sql.MAX), candidateAnswer)
        .input("interviewerNotes", sql.NVarChar(sql.MAX), interviewerNotes)
        .input("score", sql.Int, score)
        .input("isCorrect", sql.Bit, isCorrect)
        .input("isAnswered", sql.Bit, isAnswered ? 1 : 0)
        .input("answeredAt", sql.DateTime2, isAnswered ? new Date() : existing.AnsweredAt)
        .query(`
            UPDATE dbo.InterviewAnswers
            SET OptionId        = @optionId,
                CandidateAnswer  = @candidateAnswer,
                InterviewerNotes = @interviewerNotes,
                Score            = @score,
                IsCorrect        = @isCorrect,
                IsAnswered       = @isAnswered,
                AnsweredAt       = @answeredAt
            WHERE AnswerId = @answerId
        `);

    return getAnswerById(answerId);
};

const start = async (interviewId) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .input("startedAt", sql.DateTime2, new Date())
        .query(`
            UPDATE dbo.Interviews
            SET Status = 'IN_PROGRESS', StartedAt = @startedAt
            WHERE InterviewId = @interviewId
        `);
    return getById(interviewId);
};

const complete = async ({ interviewId, overallComments, criteria = [] }) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const overallScore = criteria.length > 0
            ? criteria.reduce((sum, c) => sum + (Number(c.score) || 0), 0)
            : (await transaction.request()
                .input("interviewId", sql.Int, interviewId)
                .query("SELECT SUM(Score) as TotalScore FROM dbo.InterviewAnswers WHERE InterviewId = @interviewId")).recordset[0].TotalScore || 0;

        await transaction.request()
            .input("interviewId", sql.Int, interviewId)
            .input("overallScore", sql.Int, overallScore)
            .input("overallComments", sql.NVarChar(sql.MAX), overallComments)
            .input("completedAt", sql.DateTime2, new Date())
            .query(`
                UPDATE dbo.Interviews
                SET Status = 'COMPLETED',
                    OverallScore = @overallScore,
                    OverallComments = @overallComments,
                    CompletedAt = @completedAt
                WHERE InterviewId = @interviewId
            `);

        await transaction.request()
            .input("interviewId", sql.Int, interviewId)
            .query("DELETE FROM dbo.InterviewCriteriaScores WHERE InterviewId = @interviewId");

        for (const c of criteria) {
            await transaction.request()
                .input("interviewId", sql.Int, interviewId)
                .input("category", sql.NVarChar(20), c.category)
                .input("criteriaName", sql.NVarChar(100), c.criteriaName)
                .input("score", sql.Int, Number(c.score) || 0)
                .input("comments", sql.NVarChar(sql.MAX), c.comments)
                .query(`
                    INSERT INTO dbo.InterviewCriteriaScores (InterviewId, Category, CriteriaName, Score, Comments)
                    VALUES (@interviewId, @category, @criteriaName, @score, @comments)
                `);
        }

        await transaction.commit();
        return getById(interviewId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const getCriteriaScores = async (interviewId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("interviewId", sql.Int, interviewId)
        .query(`
            SELECT ScoreId, InterviewId, Category, CriteriaName, Score, Comments, CreatedAt
            FROM dbo.InterviewCriteriaScores
            WHERE InterviewId = @interviewId
            ORDER BY ScoreId
        `);
    return result.recordset;
};

module.exports = {
    create,
    getAll,
    getById,
    getMineForCandidate,
    getAnswers,
    getAnswerByQuestion,
    getAnswerById,
    saveAnswer,
    updateAnswer,
    start,
    complete,
    getCriteriaScores
};