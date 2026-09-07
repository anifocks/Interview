const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const { poolPromise } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ success: true, service: "auth-service", status: "up" });
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("[auth-service] Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// Warm up the connection pool so startup fails fast if DB is unreachable
poolPromise
    .then(() => {
        app.listen(env.port, () => {
            console.log(`[auth-service] Listening on http://localhost:${env.port}`);
        });
    })
    .catch(() => {
        console.error("[auth-service] Cannot start: database connection failed");
        process.exit(1);
    });