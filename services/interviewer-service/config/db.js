const sql = require("mssql");
const env = require("./env");

const config = {
    user: env.db.user,
    password: env.db.password,
    server: env.db.server,
    database: env.db.database,
    options: {
        encrypt: env.db.options.encrypt,
        trustServerCertificate: env.db.options.trustServerCertificate,
        instanceName: env.db.options.instanceName
    },
    connectionTimeout: 10000,
    pool: env.db.pool
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log("[interviewer-service] Connected to SQL Server");
        return pool;
    })
    .catch((err) => {
        console.error("[interviewer-service] Database connection failed:", err.message);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};