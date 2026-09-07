const { sql, poolPromise } = require("../config/db");
const { hashPassword } = require("../utils/password");

const findByUsername = async (username) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("username", sql.NVarChar(50), username)
        .query(`
            SELECT UserId, Username, PasswordHash, FullName, Role, Email, IsActive
            FROM dbo.Users
            WHERE Username = @username
        `);
    return result.recordset[0] || null;
};

const findById = async (userId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT UserId, Username, FullName, Role, Email, IsActive
            FROM dbo.Users
            WHERE UserId = @userId
        `);
    return result.recordset[0] || null;
};

const create = async ({ username, password, fullName, role, email }) => {
    const pool = await poolPromise;
    const passwordHash = hashPassword(password);
    const result = await pool
        .request()
        .input("username", sql.NVarChar(50), username)
        .input("passwordHash", sql.NVarChar(255), passwordHash)
        .input("fullName", sql.NVarChar(100), fullName)
        .input("role", sql.NVarChar(20), role)
        .input("email", sql.NVarChar(255), email)
        .query(`
            INSERT INTO dbo.Users (Username, PasswordHash, FullName, Role, Email)
            OUTPUT INSERTED.UserId
            VALUES (@username, @passwordHash, @fullName, @role, @email)
        `);
    return result.recordset[0];
};

const getAll = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            u.UserId,
            u.Username,
            u.FullName,
            u.Role,
            u.Email,
            u.IsActive,
            u.CreatedAt,
            u.UpdatedAt,
            c.CandidateId,
            c.Status AS CandidateStatus
        FROM dbo.Users u
        LEFT JOIN dbo.Candidates c ON c.UserId = u.UserId
        ORDER BY u.CreatedAt DESC
    `);
    return result.recordset;
};

const update = async (userId, { fullName, email, role, password }) => {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("fullName", sql.NVarChar(100), fullName);
    request.input("email", sql.NVarChar(255), email);
    request.input("role", sql.NVarChar(20), role);

    let sqlText = `
        UPDATE dbo.Users
        SET FullName = @fullName,
            Email = @email,
            Role = @role,
            UpdatedAt = SYSDATETIME()
    `;

    if (password) {
        const passwordHash = hashPassword(password);
        request.input("passwordHash", sql.NVarChar(255), passwordHash);
        sqlText += `, PasswordHash = @passwordHash`;
    }

    sqlText += ` WHERE UserId = @userId`;

    await request.query(sqlText);
    return findById(userId);
};

const setActive = async (userId, isActive) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("isActive", sql.Bit, isActive)
        .query(`
            UPDATE dbo.Users
            SET IsActive = @isActive, UpdatedAt = SYSDATETIME()
            WHERE UserId = @userId
        `);
    return findById(userId);
};

const getCandidateByUserId = async (userId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
            SELECT CandidateId, UserId, CandidateName, Email
            FROM dbo.Candidates
            WHERE UserId = @userId
        `);
    return result.recordset[0] || null;
};

const createCandidateProfile = async ({ userId, fullName, email }) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("fullName", sql.NVarChar(100), fullName)
        .input("email", sql.NVarChar(255), email)
        .query(`
            INSERT INTO dbo.Candidates (UserId, CandidateName, Email, Position, Status)
            OUTPUT INSERTED.CandidateId
            VALUES (@userId, @fullName, @email, NULL, 'ACTIVE')
        `);
    return result.recordset[0].CandidateId;
};

const setCandidateStatusByUserId = async (userId, status) => {
    const pool = await poolPromise;
    await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("status", sql.NVarChar(20), status)
        .query(`
            UPDATE dbo.Candidates
            SET Status = @status, UpdatedAt = SYSDATETIME()
            WHERE UserId = @userId
        `);
};

module.exports = {
    findByUsername,
    findById,
    create,
    getAll,
    update,
    setActive,
    getCandidateByUserId,
    createCandidateProfile,
    setCandidateStatusByUserId
};