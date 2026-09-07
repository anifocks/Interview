const { sql, poolPromise } = require("../config/db");

const getForCandidate = async (candidateId, { publishedOnly = false } = {}) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .query(`
            SELECT
                a.AssignmentId,
                a.CandidateId,
                a.QuestionOrder,
                a.IsMandatory,
                a.AssignedBy,
                a.CreatedAt,
                a.PublishedAt,
                a.PublishedBy,
                q.QuestionId,
                q.QuestionCode,
                q.QuestionText,
                q.QuestionType,
                q.Category,
                q.Difficulty,
                q.ExpectedAnswer,
                q.WeakAnswer,
                q.IsCommon
            FROM dbo.CandidateQuestionAssignments a
            INNER JOIN dbo.Questions q ON q.QuestionId = a.QuestionId
            WHERE a.CandidateId = @candidateId
              AND q.IsActive = 1
              ${publishedOnly ? "AND (a.PublishedAt IS NOT NULL OR q.QuestionType = 'MCQ')" : ""}
            ORDER BY a.QuestionOrder
        `);
    return result.recordset;
};

const setPublished = async (candidateId, questionId, published, userId) => {
    const pool = await poolPromise;
    const request = pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .input("questionId", sql.Int, questionId);

    if (published) {
        request.input("publishedBy", sql.Int, userId);
        await request.query(`
            UPDATE dbo.CandidateQuestionAssignments
            SET PublishedAt = SYSDATETIME(),
                PublishedBy = @publishedBy
            WHERE CandidateId = @candidateId AND QuestionId = @questionId
        `);
    } else {
        await request.query(`
            UPDATE dbo.CandidateQuestionAssignments
            SET PublishedAt = NULL,
                PublishedBy = NULL
            WHERE CandidateId = @candidateId AND QuestionId = @questionId
        `);
    }
};

const publishAllForCandidate = async (candidateId, userId) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .input("publishedBy", sql.Int, userId)
        .query(`
            UPDATE dbo.CandidateQuestionAssignments
            SET PublishedAt = SYSDATETIME(),
                PublishedBy = @publishedBy
            WHERE CandidateId = @candidateId
              AND PublishedAt IS NULL
        `);
};

const replaceForCandidate = async (candidateId, questionIds, assignedBy) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .query("DELETE FROM dbo.CandidateQuestionAssignments WHERE CandidateId = @candidateId");

        if (questionIds && questionIds.length > 0) {
            for (let i = 0; i < questionIds.length; i += 1) {
                await transaction.request()
                    .input("candidateId", sql.Int, candidateId)
                    .input("questionId", sql.Int, questionIds[i])
                    .input("questionOrder", sql.Int, i)
                    .input("assignedBy", sql.Int, assignedBy)
                    .query(`
                        INSERT INTO dbo.CandidateQuestionAssignments (CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy)
                        VALUES (@candidateId, @questionId, @questionOrder, 0, @assignedBy)
                    `);
            }
        }

        await transaction.commit();
        return getForCandidate(candidateId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const removeAssignment = async (candidateId, questionId) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .input("questionId", sql.Int, questionId)
        .query(`
            DELETE FROM dbo.CandidateQuestionAssignments
            WHERE CandidateId = @candidateId AND QuestionId = @questionId
        `);
};

const getForQuestion = async (questionId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("questionId", sql.Int, questionId)
        .query(`
            SELECT
                c.CandidateId,
                c.UserId,
                c.CandidateName,
                c.Email,
                c.Position,
                c.Status,
                u.Username
            FROM dbo.CandidateQuestionAssignments a
            INNER JOIN dbo.Candidates c ON c.CandidateId = a.CandidateId
            LEFT JOIN dbo.Users u ON u.UserId = c.UserId
            WHERE a.QuestionId = @questionId
            ORDER BY c.CandidateName
        `);
    return result.recordset;
};

const replaceForQuestion = async (questionId, candidateIds, assignedBy) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        await transaction.request()
            .input("questionId", sql.Int, questionId)
            .query("DELETE FROM dbo.CandidateQuestionAssignments WHERE QuestionId = @questionId");

        if (candidateIds && candidateIds.length > 0) {
            for (let i = 0; i < candidateIds.length; i += 1) {
                await transaction.request()
                    .input("candidateId", sql.Int, candidateIds[i])
                    .input("questionId", sql.Int, questionId)
                    .input("questionOrder", sql.Int, 0)
                    .input("assignedBy", sql.Int, assignedBy)
                    .query(`
                        INSERT INTO dbo.CandidateQuestionAssignments (CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy)
                        VALUES (@candidateId, @questionId, @questionOrder, 0, @assignedBy)
                    `);
            }
        }

        await transaction.commit();
        return getForQuestion(questionId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = {
    getForCandidate,
    setPublished,
    publishAllForCandidate,
    replaceForCandidate,
    removeAssignment,
    getForQuestion,
    replaceForQuestion
};