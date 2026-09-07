const { sql, poolPromise } = require("../config/db");

const getAll = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            c.CandidateId,
            c.UserId,
            c.CandidateName,
            c.Email,
            c.Phone,
            c.Position,
            c.ResumePath,
            c.Status,
            c.CreatedAt,
            c.UpdatedAt,
            u.Username
        FROM dbo.Candidates c
        LEFT JOIN dbo.Users u ON u.UserId = c.UserId
        ORDER BY c.CreatedAt DESC
    `);
    return result.recordset;
};

const getById = async (candidateId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .query(`
            SELECT
                c.CandidateId,
                c.UserId,
                c.CandidateName,
                c.Email,
                c.Phone,
                c.Position,
                c.ResumePath,
                c.Status,
                c.CreatedAt,
                c.UpdatedAt,
                u.Username
            FROM dbo.Candidates c
            LEFT JOIN dbo.Users u ON u.UserId = c.UserId
            WHERE c.CandidateId = @candidateId
        `);
    return result.recordset[0] || null;
};

const getByUserId = async (userId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT
                c.CandidateId,
                c.UserId,
                c.CandidateName,
                c.Email,
                c.Phone,
                c.Position,
                c.ResumePath,
                c.Status,
                c.CreatedAt,
                c.UpdatedAt
            FROM dbo.Candidates c
            WHERE c.UserId = @userId
        `);
    return result.recordset[0] || null;
};

const create = async ({ candidateName, email, phone, position, userId }) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("candidateName", sql.NVarChar(100), candidateName)
        .input("email", sql.NVarChar(255), email)
        .input("phone", sql.NVarChar(30), phone)
        .input("position", sql.NVarChar(100), position)
        .input("userId", sql.Int, userId)
        .query(`
            INSERT INTO dbo.Candidates (UserId, CandidateName, Email, Phone, Position)
            OUTPUT INSERTED.CandidateId
            VALUES (@userId, @candidateName, @email, @phone, @position)
        `);
    return result.recordset[0].CandidateId;
};

const update = async (candidateId, { candidateName, email, phone, position, status }) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("candidateId", sql.Int, candidateId)
        .input("candidateName", sql.NVarChar(100), candidateName)
        .input("email", sql.NVarChar(255), email)
        .input("phone", sql.NVarChar(30), phone)
        .input("position", sql.NVarChar(100), position)
        .input("status", sql.NVarChar(20), status)
        .query(`
            UPDATE dbo.Candidates
            SET CandidateName = @candidateName,
                Email = @email,
                Phone = @phone,
                Position = @position,
                Status = @status,
                UpdatedAt = SYSDATETIME()
            WHERE CandidateId = @candidateId
        `);
    return getById(candidateId);
};

const remove = async (candidateId) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .query("DELETE FROM dbo.CandidateQuestionAssignments WHERE CandidateId = @candidateId");
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .query(`
                UPDATE dbo.Interviews
                SET Status = 'CANCELLED', CompletedAt = SYSDATETIME()
                WHERE CandidateId = @candidateId AND Status <> 'COMPLETED'
            `);
        const deleted = await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .query(`
                DELETE FROM dbo.Candidates
                OUTPUT DELETED.UserId
                WHERE CandidateId = @candidateId
            `);
        await transaction.commit();
        return deleted.recordset[0] || null;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = {
    getAll,
    getById,
    getByUserId,
    create,
    update,
    remove
};