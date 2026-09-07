const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const candidateRoutes = require("./routes/candidateRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const questionAssignmentRoutes = require("./routes/questionAssignmentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const { poolPromise } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
    res.json({ success: true, service: "interviewer-service", status: "up" });
});

app.use("/api/candidates", candidateRoutes);
app.use("/api/candidates", assignmentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions", questionAssignmentRoutes);
app.use("/api/interviews", interviewRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("[interviewer-service] Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

poolPromise
    .then(() => {
        app.listen(env.port, () => {
            console.log(`[interviewer-service] Listening on http://localhost:${env.port}`);
        });
    })
    .catch(() => {
        console.error("[interviewer-service] Cannot start: database connection failed");
        process.exit(1);
    });