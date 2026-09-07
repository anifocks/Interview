const bcrypt = require("bcryptjs");
const { ok, created, fail } = require("../utils/response");
const log = require("../utils/logger");
const candidateModel = require("../models/candidateModel");
const { sql, poolPromise } = require("../config/db");

const SERVICE = "interviewer-service";

const createUserAccount = async ({ username, password, fullName, email }) => {
    const pool = await poolPromise;
    const request = pool.request();
    const existing = await request
        .input("username", sql.NVarChar(50), username)
        .query("SELECT UserId FROM dbo.Users WHERE Username = @username");

    if (existing.recordset.length > 0) {
        const err = new Error("Username already exists");
        err.status = 409;
        throw err;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await request
        .input("passwordHash", sql.NVarChar(255), passwordHash)
        .input("fullName", sql.NVarChar(100), fullName)
        .input("email", sql.NVarChar(255), email)
        .query(`
            INSERT INTO dbo.Users (Username, PasswordHash, FullName, Role, Email)
            OUTPUT INSERTED.UserId
            VALUES (@username, @passwordHash, @fullName, 'CANDIDATE', @email)
        `);
    return result.recordset[0].UserId;
};

const list = async (req, res) => {
    try {
        const candidates = await candidateModel.getAll();
        return ok(res, candidates);
    } catch (error) {
        log.error(SERVICE, `Candidate list error: ${error.message}`);
        return fail(res, 500, "Failed to get candidates");
    }
};

const get = async (req, res) => {
    try {
        const candidate = await candidateModel.getById(Number(req.params.id));
        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }
        return ok(res, candidate);
    } catch (error) {
        log.error(SERVICE, `Candidate get error: ${error.message}`);
        return fail(res, 500, "Failed to get candidate");
    }
};

const create = async (req, res) => {
    try {
        const { candidateName, email, phone, position, createLogin, username, password } = req.body;

        if (!candidateName) {
            return fail(res, 400, "candidateName is required");
        }

        let userId = null;

        if (createLogin) {
            if (!username || !password) {
                return fail(res, 400, "username and password are required when creating a login");
            }
            userId = await createUserAccount({
                username,
                password,
                fullName: candidateName,
                email
            });
        }

        const candidateId = await candidateModel.create({
            candidateName,
            email,
            phone,
            position,
            userId
        });

        const candidate = await candidateModel.getById(candidateId);
        return created(res, candidate, "Candidate created");
    } catch (error) {
        log.error(SERVICE, `Candidate create error: ${error.message}`);
        if (error.status === 409) {
            return fail(res, 409, error.message);
        }
        return fail(res, 500, "Failed to create candidate");
    }
};

const update = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const { candidateName, email, phone, position, status } = req.body;

        if (!candidateName) {
            return fail(res, 400, "candidateName is required");
        }

        const candidate = await candidateModel.update(candidateId, {
            candidateName,
            email,
            phone,
            position,
            status: status || "ACTIVE"
        });

        if (!candidate) {
            return fail(res, 404, "Candidate not found");
        }

        return ok(res, candidate, "Candidate updated");
    } catch (error) {
        log.error(SERVICE, `Candidate update error: ${error.message}`);
        return fail(res, 500, "Failed to update candidate");
    }
};

const remove = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);
        const removed = await candidateModel.remove(candidateId);

        if (!removed) {
            return fail(res, 404, "Candidate not found");
        }

        if (removed.UserId) {
            const pool = await poolPromise;
            await pool
                .request()
                .input("userId", sql.Int, removed.UserId)
                .query("UPDATE dbo.Users SET IsActive = 0 WHERE UserId = @userId");
        }

        return ok(res, null, "Candidate deleted");
    } catch (error) {
        log.error(SERVICE, `Candidate delete error: ${error.message}`);
        return fail(res, 500, "Failed to delete candidate");
    }
};

module.exports = {
    list,
    get,
    create,
    update,
    remove
};