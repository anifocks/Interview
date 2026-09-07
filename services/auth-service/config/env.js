require("dotenv").config();

const env = {
    port: process.env.PORT || 4000,
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: process.env.DB_ENCRYPT === "true",
            trustServerCertificate: process.env.DB_TRUST_CERTIFICATE !== "false",
            instanceName: process.env.DB_INSTANCE_NAME
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    },
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || ""
};

if (!env.jwtSecret) {
    console.warn("[auth-service] WARNING: JWT_SECRET is not set. Using an insecure default for development only.");
    env.jwtSecret = "dev-only-insecure-secret-change-me";
}

if (!env.db.user || !env.db.password || !env.db.server) {
    console.warn("[auth-service] WARNING: Database credentials are incomplete. Check .env (DB_USER, DB_PASSWORD, DB_HOST).");
}

module.exports = env;