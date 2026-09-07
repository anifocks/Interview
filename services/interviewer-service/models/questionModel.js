const { sql, poolPromise } = require("../config/db");

const listColumns = `
    q.QuestionId, q.QuestionCode, q.QuestionText, q.QuestionType,
    q.Category, q.Difficulty, q.IsCommon, q.IsActive,
    q.ParentQuestionId, q.QuestionOrder, q.CreatedAt, q.UpdatedAt,
    (SELECT COUNT(*) FROM dbo.CandidateQuestionAssignments acq WHERE acq.QuestionId = q.QuestionId) AS AssignedCount
`;

const getAll = async ({ category, difficulty, type } = {}) => {
    const pool = await poolPromise;
    const request = pool.request();

    let where = "WHERE q.IsActive = 1";
    if (category) {
        where += " AND q.Category = @category";
        request.input("category", sql.NVarChar(50), category);
    }
    if (difficulty) {
        where += " AND q.Difficulty = @difficulty";
        request.input("difficulty", sql.NVarChar(10), difficulty);
    }
    if (type) {
        where += " AND q.QuestionType = @type";
        request.input("type", sql.NVarChar(10), type);
    }

    const result = await request.query(`
        SELECT ${listColumns}
        FROM dbo.Questions q
        ${where}
        ORDER BY q.CreatedAt DESC
    `);
    return result.recordset;
};

const getById = async (questionId) => {
    const pool = await poolPromise;
    const question = await pool
        .request()
        .input("questionId", sql.Int, questionId)
        .query(`
            SELECT q.*, u.FullName AS CreatedByName, p.QuestionCode AS ParentQuestionCode
            FROM dbo.Questions q
            LEFT JOIN dbo.Users u ON u.UserId = q.CreatedBy
            LEFT JOIN dbo.Questions p ON p.QuestionId = q.ParentQuestionId
            WHERE q.QuestionId = @questionId
        `);

    if (!question.recordset[0]) {
        return null;
    }

    const options = await pool
        .request()
        .input("questionId", sql.Int, questionId)
        .query(`
            SELECT OptionId, QuestionId, OptionLabel, OptionText, IsCorrect
            FROM dbo.QuestionOptions
            WHERE QuestionId = @questionId
            ORDER BY OptionId
        `);

    const followUps = await pool
        .request()
        .input("parentQuestionId", sql.Int, questionId)
        .query(`
            SELECT q.*, u.FullName AS CreatedByName
            FROM dbo.Questions q
            LEFT JOIN dbo.Users u ON u.UserId = q.CreatedBy
            WHERE q.ParentQuestionId = @parentQuestionId
            ORDER BY q.QuestionOrder, q.QuestionCode
        `);

    return {
        ...question.recordset[0],
        Options: options.recordset,
        FollowUps: followUps.recordset
    };
};

const generateCode = async (type, isCommon, createdBy) => {
    const pool = await poolPromise;
    const prefix = isCommon ? "COMMON" : (type === "MCQ" ? "MCQ" : "GEN");
    const result = await pool
        .request()
        .input("prefix", sql.NVarChar(30), prefix + "%")
        .query(`
            SELECT COUNT(*) AS Cnt
            FROM dbo.Questions
            WHERE QuestionCode LIKE @prefix
        `);
    return `${prefix}-${String(result.recordset[0].Cnt + 1).padStart(2, "0")}`;
};

const create = async ({ questionCode, questionText, questionType, category, difficulty, expectedAnswer, weakAnswer, isCommon, createdBy, parentQuestionId, questionOrder, options }) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const code = questionCode || await generateCode(questionType, isCommon, createdBy);

        const inserted = await transaction.request()
            .input("questionCode", sql.NVarChar(30), code)
            .input("questionText", sql.NVarChar(sql.MAX), questionText)
            .input("questionType", sql.NVarChar(10), questionType)
            .input("category", sql.NVarChar(50), category)
            .input("difficulty", sql.NVarChar(10), difficulty)
            .input("expectedAnswer", sql.NVarChar(sql.MAX), expectedAnswer)
            .input("weakAnswer", sql.NVarChar(sql.MAX), weakAnswer)
            .input("isCommon", sql.Bit, isCommon ? 1 : 0)
            .input("parentQuestionId", sql.Int, parentQuestionId || null)
            .input("questionOrder", sql.Int, questionOrder || null)
            .input("createdBy", sql.Int, createdBy)
            .query(`
                INSERT INTO dbo.Questions (
                    QuestionCode, QuestionText, QuestionType, Category, Difficulty,
                    ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, ParentQuestionId, QuestionOrder
                )
                OUTPUT INSERTED.QuestionId
                VALUES (
                    @questionCode, @questionText, @questionType, @category, @difficulty,
                    @expectedAnswer, @weakAnswer, @isCommon, @createdBy, @parentQuestionId, @questionOrder
                )
            `);

        const questionId = inserted.recordset[0].QuestionId;

        if (options && options.length > 0) {
            for (const opt of options) {
                await transaction.request()
                    .input("questionId", sql.Int, questionId)
                    .input("optionLabel", sql.NVarChar(5), opt.optionLabel)
                    .input("optionText", sql.NVarChar(500), opt.optionText)
                    .input("isCorrect", sql.Bit, opt.isCorrect ? 1 : 0)
                    .query(`
                        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect)
                        VALUES (@questionId, @optionLabel, @optionText, @isCorrect)
                    `);
            }
        }

        await transaction.commit();
        return getById(questionId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const update = async (questionId, { questionCode, questionText, questionType, category, difficulty, expectedAnswer, weakAnswer, isCommon, parentQuestionId, questionOrder, options }) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        await transaction.request()
            .input("questionId", sql.Int, questionId)
            .input("questionCode", sql.NVarChar(30), questionCode)
            .input("questionText", sql.NVarChar(sql.MAX), questionText)
            .input("questionType", sql.NVarChar(10), questionType)
            .input("category", sql.NVarChar(50), category)
            .input("difficulty", sql.NVarChar(10), difficulty)
            .input("expectedAnswer", sql.NVarChar(sql.MAX), expectedAnswer)
            .input("weakAnswer", sql.NVarChar(sql.MAX), weakAnswer)
            .input("isCommon", sql.Bit, isCommon ? 1 : 0)
            .input("parentQuestionId", sql.Int, parentQuestionId || null)
            .input("questionOrder", sql.Int, questionOrder || null)
            .query(`
                UPDATE dbo.Questions
                SET QuestionCode = @questionCode,
                    QuestionText = @questionText,
                    QuestionType = @questionType,
                    Category = @category,
                    Difficulty = @difficulty,
                    ExpectedAnswer = @expectedAnswer,
                    WeakAnswer = @weakAnswer,
                    IsCommon = @isCommon,
                    ParentQuestionId = @parentQuestionId,
                    QuestionOrder = @questionOrder,
                    UpdatedAt = SYSDATETIME()
                WHERE QuestionId = @questionId
            `);

        if (options && options.length > 0) {
            await transaction.request()
                .input("questionId", sql.Int, questionId)
                .query("DELETE FROM dbo.QuestionOptions WHERE QuestionId = @questionId");

            for (const opt of options) {
                await transaction.request()
                    .input("questionId", sql.Int, questionId)
                    .input("optionLabel", sql.NVarChar(5), opt.optionLabel)
                    .input("optionText", sql.NVarChar(500), opt.optionText)
                    .input("isCorrect", sql.Bit, opt.isCorrect ? 1 : 0)
                    .query(`
                        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect)
                        VALUES (@questionId, @optionLabel, @optionText, @isCorrect)
                    `);
            }
        }

        await transaction.commit();
        return getById(questionId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const remove = async (questionId) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("questionId", sql.Int, questionId)
        .query(`
            UPDATE dbo.Questions
            SET IsActive = 0, UpdatedAt = SYSDATETIME()
            WHERE QuestionId = @questionId
        `);
};

const setActive = async (questionId, isActive) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("questionId", sql.Int, questionId)
        .input("isActive", sql.Bit, isActive ? 1 : 0)
        .query(`
            UPDATE dbo.Questions
            SET IsActive = @isActive, UpdatedAt = SYSDATETIME()
            WHERE QuestionId = @questionId
        `);
    return getById(questionId);
};

const getCommon = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            q.QuestionId, q.QuestionCode, q.QuestionText, q.QuestionType,
            q.Category, q.Difficulty, q.ExpectedAnswer, q.WeakAnswer,
            q.IsCommon, q.IsActive, q.ParentQuestionId, q.QuestionOrder,
            q.CreatedAt, q.UpdatedAt,
            u.FullName AS CreatedByName
        FROM dbo.Questions q
        LEFT JOIN dbo.Users u ON u.UserId = q.CreatedBy
        WHERE q.IsCommon = 1 AND q.IsActive = 1
        ORDER BY q.QuestionCode
    `);

    const questions = result.recordset;
    for (const q of questions) {
        const options = await pool
            .request()
            .input("questionId", sql.Int, q.QuestionId)
            .query(`
                SELECT OptionId, QuestionId, OptionLabel, OptionText, IsCorrect
                FROM dbo.QuestionOptions
                WHERE QuestionId = @questionId
                ORDER BY OptionId
            `);
        q.Options = options.recordset;

        if (q.QuestionType === "ORAL") {
            const followUps = await pool
                .request()
                .input("parentQuestionId", sql.Int, q.QuestionId)
                .query(`
                    SELECT qq.QuestionId, qq.QuestionCode, qq.QuestionText, qq.QuestionType,
                           qq.Category, qq.Difficulty, qq.ExpectedAnswer, qq.WeakAnswer,
                           qq.IsCommon, qq.IsActive, qq.ParentQuestionId, qq.QuestionOrder
                    FROM dbo.Questions qq
                    WHERE qq.ParentQuestionId = @parentQuestionId AND qq.IsActive = 1
                    ORDER BY qq.QuestionOrder, qq.QuestionCode
                `);
            q.FollowUps = followUps.recordset;
        }
    }

    return questions;
};

const getOral = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            q.QuestionId, q.QuestionCode, q.QuestionText, q.QuestionType,
            q.Category, q.Difficulty, q.ExpectedAnswer, q.WeakAnswer,
            q.IsCommon, q.IsActive, q.ParentQuestionId, q.QuestionOrder,
            q.CreatedAt, q.UpdatedAt,
            u.FullName AS CreatedByName
        FROM dbo.Questions q
        LEFT JOIN dbo.Users u ON u.UserId = q.CreatedBy
        WHERE q.QuestionType = 'ORAL'
          AND q.ParentQuestionId IS NULL
          AND q.IsActive = 1
        ORDER BY q.QuestionCode
    `);

    const questions = result.recordset;
    for (const q of questions) {
        const followUps = await pool
            .request()
            .input("parentQuestionId", sql.Int, q.QuestionId)
            .query(`
                SELECT qq.QuestionId, qq.QuestionCode, qq.QuestionText, qq.QuestionType,
                       qq.Category, qq.Difficulty, qq.ExpectedAnswer, qq.WeakAnswer,
                       qq.IsCommon, qq.IsActive, qq.ParentQuestionId, qq.QuestionOrder
                FROM dbo.Questions qq
                WHERE qq.ParentQuestionId = @parentQuestionId AND qq.IsActive = 1
                ORDER BY qq.QuestionOrder, qq.QuestionCode
            `);
        q.FollowUps = followUps.recordset;
    }

    return questions;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    setActive,
getCommon,
    getOral
};