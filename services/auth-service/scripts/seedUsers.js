const { sql, poolPromise } = require("../config/db");
const { hashPassword } = require("../utils/password");

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Interview@123";

const users = [
    { username: "interviewer", fullName: "IT Interviewer", role: "INTERVIEWER", email: "interviewer@interview.local" },
    { username: "kishore", fullName: "Kishore P", role: "CANDIDATE", email: "kishore@interview.local" },
    { username: "nanthini", fullName: "Nanthini", role: "CANDIDATE", email: "nanthini@interview.local" },
    { username: "sunil", fullName: "Sunil", role: "CANDIDATE", email: "sunil@interview.local" }
];

(async () => {
    try {
        const pool = await poolPromise;
        const passwordHash = hashPassword(DEMO_PASSWORD);

        for (const u of users) {
            const existing = await pool
                .request()
                .input("username", sql.NVarChar(50), u.username)
                .query("SELECT UserId FROM dbo.Users WHERE Username = @username");

            if (existing.recordset.length > 0) {
                console.log(`[seedUsers] Skipping ${u.username} (already exists)`);
                continue;
            }

            await pool
                .request()
                .input("username", sql.NVarChar(50), u.username)
                .input("passwordHash", sql.NVarChar(255), passwordHash)
                .input("fullName", sql.NVarChar(100), u.fullName)
                .input("role", sql.NVarChar(20), u.role)
                .input("email", sql.NVarChar(255), u.email)
                .query(`
                    INSERT INTO dbo.Users (Username, PasswordHash, FullName, Role, Email)
                    VALUES (@username, @passwordHash, @fullName, @role, @email)
                `);

            console.log(`[seedUsers] Created ${u.username} (${u.role})`);
        }

        console.log(`[seedUsers] Done. Demo password for all users: ${DEMO_PASSWORD}`);
        process.exit(0);
    } catch (err) {
        console.error("[seedUsers] Failed:", err.message);
        process.exit(1);
    }
})();