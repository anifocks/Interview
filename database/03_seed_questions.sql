-- ============================================================
-- 03_seed_questions.sql
-- Seeds demo data:
--   * Demo user accounts (interviewer + 3 candidates)
--       interviewer / Interview@123
--       kishore     / Interview@123
--       nanthini    / Interview@123
--       sunil       / Interview@123
--   * Common oral questions, 10 common MCQs, candidate-specific questions
--   * MCQ options and candidate question assignments
--
-- NOTE: the password hash below is bcrypt for the demo password
-- "Interview@123". Change these passwords before production use.
-- ============================================================

USE InterviewDB;
GO

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
SET IDENTITY_INSERT dbo.Users ON;
GO

INSERT INTO dbo.Users (UserId, Username, PasswordHash, FullName, Role, Email, IsActive, CreatedAt, UpdatedAt)
SELECT 1, N'interviewer', N'$2a$10$X07fmuQ3xS14bW8zR6q.7ejzF/77Fp4LXwpUYK2yIRKvCJ9LqL2mO', N'IT Interviewer', N'INTERVIEWER', N'interviewer@interview.local', 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 2, N'kishore',   N'$2a$10$X07fmuQ3xS14bW8zR6q.7ejzF/77Fp4LXwpUYK2yIRKvCJ9LqL2mO', N'Kishore P',  N'CANDIDATE', N'kishore@interview.local',   1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 3, N'nanthini',  N'$2a$10$X07fmuQ3xS14bW8zR6q.7ejzF/77Fp4LXwpUYK2yIRKvCJ9LqL2mO', N'Nanthini',   N'CANDIDATE', N'nanthini@interview.local',  1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 4, N'sunil',     N'$2a$10$X07fmuQ3xS14bW8zR6q.7ejzF/77Fp4LXwpUYK2yIRKvCJ9LqL2mO', N'Sunil',      N'CANDIDATE', N'sunil@interview.local',     1, SYSDATETIME(), SYSDATETIME();

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = 1)
BEGIN
    RAISERROR('Seed users could not be inserted', 16, 1);
END

SET IDENTITY_INSERT dbo.Users OFF;
GO

-- ------------------------------------------------------------
-- Candidates
-- ------------------------------------------------------------
SET IDENTITY_INSERT dbo.Candidates ON;
GO

INSERT INTO dbo.Candidates (CandidateId, UserId, CandidateName, Email, Phone, Position, ResumePath, Status, CreatedAt, UpdatedAt)
SELECT 1, 2, N'Kishore P', N'kishore@interview.local', N'+91 90000 00001', N'Senior Engineer', NULL, N'ACTIVE', SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 2, 3, N'Nanthini',  N'nanthini@interview.local',  N'+91 90000 00002', N'Data Engineer',   NULL, N'ACTIVE', SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 3, 4, N'Sunil',     N'sunil@interview.local',     N'+91 90000 00003', N'ML Engineer',     NULL, N'ACTIVE', SYSDATETIME(), SYSDATETIME();

SET IDENTITY_INSERT dbo.Candidates OFF;
GO

-- ------------------------------------------------------------
-- Questions
-- ------------------------------------------------------------
SET IDENTITY_INSERT dbo.Questions ON;
GO

-- Common oral questions (COMMON-01 .. COMMON-05)
INSERT INTO dbo.Questions (QuestionId, QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, CreatedAt, UpdatedAt)
SELECT 1,  N'COMMON-01', N'The business owner says: "I need the dashboard to show the correct number." What do you do before writing code?', N'ORAL', N'Requirement', N'Medium',
       N'Clarify the requirement with probing questions. Confirm which metric and time window matter, agree on the source of truth, data definitions and edge cases, then align expectations before implementation.',
       N'Start coding a dashboard immediately to show something fast.', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 2,  N'COMMON-02', N'How would you design a scalable REST API for an interview scheduling system?', N'ORAL', N'System Design', N'Medium',
       N'Cover authentication (JWT), role-based access, clean resource endpoints, relational schema for candidates/questions/interviews, pagination, rate limiting, caching and logging/monitoring.',
       N'Just list the endpoints without considering auth, schema or scale.', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 3,  N'COMMON-03', N'Your stakeholder disagrees with your technical approach. How do you handle it?', N'ORAL', N'Communication', N'Medium',
       N'Listen actively, acknowledge their concern, restate the goal, discuss trade-offs with data/evidence, and converge on a decision that everyone accepts.',
       N'Insist your approach is correct because you are the developer.', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 4,  N'COMMON-04', N'You have 20 minutes to debug a production issue affecting all users. What is your approach?', N'ORAL', N'Problem Solving', N'Medium',
       N'Reproduce the issue, read logs and metrics to isolate the root cause, form a hypothesis, apply the smallest fix, verify with monitoring and have a rollback plan ready.',
       N'Restart the servers first and hope it goes away.', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 5,  N'COMMON-05', N'Your nightly data pipeline silently fails on some days and nobody notices until Monday. How do you fix this?', N'ORAL', N'Data Pipeline', N'Medium',
       N'Add pipeline monitoring and alerting, retry/backoff logic, data validation with row-count checks, and a runbook so failures are caught and resolved promptly.',
       N'Re-run the pipeline manually on Monday mornings.', 1, 1, 1, SYSDATETIME(), SYSDATETIME();
GO

-- Common MCQs (MCQ-01 .. MCQ-10)
INSERT INTO dbo.Questions (QuestionId, QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, CreatedAt, UpdatedAt)
SELECT 6,  N'MCQ-01', N'A Python program calls an external API. Sometimes the API is unavailable. What is the best approach?', N'MCQ', N'Python', N'Easy',
       N'A. Use exception handling and controlled retry', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 7,  N'MCQ-02', N'What is the main purpose of an index in PostgreSQL?', N'MCQ', N'PostgreSQL', N'Easy',
       N'A. Speed up filtering and sorting of rows', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 8,  N'MCQ-03', N'Which clause removes duplicate rows from a SELECT result?', N'MCQ', N'PostgreSQL', N'Medium',
       N'A. SELECT DISTINCT', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 9,  N'MCQ-04', N'Which HTTP method is most appropriate to create a new resource?', N'MCQ', N'API', N'Easy',
       N'A. POST', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 10, N'MCQ-05', N'What does a 401 status code mean?', N'MCQ', N'API', N'Medium',
       N'A. The request is unauthenticated', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 11, N'MCQ-06', N'In PostgreSQL, Row Level Security (RLS) is used to:', N'MCQ', N'RLS', N'Medium',
       N'A. Restrict which rows a user can read or write', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 12, N'MCQ-07', N'What is a key benefit of using a message queue between services?', N'MCQ', N'System Design', N'Medium',
       N'A. Decoupling producers and consumers with asynchronous processing', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 13, N'MCQ-08', N'What is Retrieval-Augmented Generation (RAG)?', N'MCQ', N'GenAI', N'Medium',
       N'A. Grounding an LLM answer with content retrieved from a knowledge base', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 14, N'MCQ-09', N'What does it mean for a data pipeline to be idempotent?', N'MCQ', N'Data Pipeline', N'Easy',
       N'A. Re-running it produces the same result', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 15, N'MCQ-10', N'Which keyword defines a function in Python?', N'MCQ', N'Python', N'Easy',
       N'A. def', N'', 1, 1, 1, SYSDATETIME(), SYSDATETIME();
GO

-- Candidate-specific questions
INSERT INTO dbo.Questions (QuestionId, QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, CreatedAt, UpdatedAt)
SELECT 16, N'KISHORE-01', N'Explain how you would build an internal RAG assistant over company documents: chunking, embeddings, vector store, retrieval and hallucination control.', N'ORAL', N'GenAI', N'Tough',
       N'Cover document chunking strategy, embedding model choice, vector DB (e.g. pgvector), hybrid retrieval (keyword + vector), re-ranking, grounded prompts with source citations, and evaluation/guardrails against hallucination.',
       N'Just say "we use an LLM with the documents".', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 17, N'KISHORE-02', N'You are building a REST API consumed by external clients. How do you handle versioning and backward compatibility?', N'ORAL', N'API', N'Medium',
       N'Discuss URL vs header versioning, additive (non-breaking) change policy, deprecation timelines, contract tests and a migration strategy.',
       N'Break the API whenever you feel like it.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 18, N'KISHORE-03', N'Design a system that serves 1M chat requests per day. Walk through the components it needs.', N'ORAL', N'System Design', N'Tough',
       N'Load balancer, stateless API service, queue for async workloads, caching for hot sessions, model provider with fallbacks, rate limiting, observability and cost controls.',
       N'One giant server can handle everything.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 19, N'KISHORE-04', N'How do you profile and optimize a slow Python function?', N'ORAL', N'Python', N'Medium',
       N'Measure first (cProfile / line_profiler), identify the hot path, optimise algorithms and data structures, use caching or vectorisation, then re-measure and add regression benchmarks.',
       N'Rewrite the whole thing in a different language.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 20, N'NANTHINI-01', N'Design a pipeline that ingests a daily CSV, validates it, deduplicates and loads it into a warehouse. How do you handle schema drift?', N'ORAL', N'Data Pipeline', N'Tough',
       N'Ingestion with checksums, validation rules and row-level error quarantine, dedup by natural key, staging + merge (upsert) pattern, schema drift detection with alerting and nullable defaults.',
       N'Just TRUNCATE and re-insert the file.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 21, N'NANTHINI-02', N'Explain LEFT JOIN vs INNER JOIN using a real example.', N'ORAL', N'PostgreSQL', N'Medium',
       N'INNER JOIN returns only matching rows in both tables; LEFT JOIN returns all rows from the left table plus matches from the right (NULL where no match). Give an example such as orders vs customers.',
       N'They are basically the same thing.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 22, N'NANTHINI-03', N'How would you implement tenant isolation in PostgreSQL for a multi-tenant application?', N'ORAL', N'RLS', N'Tough',
       N'Add a tenant_id column, enable RLS on the table, create row-level policies using CURRENT_SETTING("app.tenant_id"), and make the app set that value per connection.',
       N'Use separate databases for each tenant forever.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 23, N'NANTHINI-04', N'A query that runs in 50ms on a small table takes 30 seconds on production. What do you check first?', N'ORAL', N'Problem Solving', N'Medium',
       N'Look at the query plan, check for missing indexes, parameter sniffing, row-estimation skew and statistics freshness, then compare plan shapes.',
       N'Buy a bigger server.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 24, N'SUNIL-01', N'How do you detect and handle class imbalance in a classification problem?', N'ORAL', N'ML', N'Medium',
       N'Detect with confusion matrix and class distribution; handle via resampling (SMOTE), class weights, choosing proper metrics (precision/recall, AUC-PR instead of accuracy).',
       N'Accuracy is fine, just train the model.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 25, N'SUNIL-02', N'Compare fine-tuning vs prompt engineering vs RAG for an LLM use case. When would you pick each?', N'ORAL', N'GenAI', N'Tough',
       N'Prompt engineering for fast iteration on simple/known tasks; RAG when answers depend on up-to-date private knowledge; fine-tuning when output must follow a stable style/format or domain vocabulary.',
       N'Tune the model for everything.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 26, N'SUNIL-03', N'How would you implement caching for a model inference endpoint to cut cost and latency?', N'ORAL', N'Python', N'Medium',
       N'Keyed response cache (LRU/TTL) on input hashes, batching requests, warming for cold starts and graceful degradation when the model is down.',
       N'Cache the model weights so it loads faster.', 0, 1, 1, SYSDATETIME(), SYSDATETIME()
UNION ALL SELECT 27, N'SUNIL-04', N'Design a model serving API with batching, fallbacks and monitoring.', N'ORAL', N'System Design', N'Tough',
       N'Queue for request batching, multiple model providers with fallback chain, circuit breakers, latency/error tracking, canary deployments and cost per request metrics.',
       N'Expose the model directly on a GPU server.', 0, 1, 1, SYSDATETIME(), SYSDATETIME();
GO

SET IDENTITY_INSERT dbo.Questions OFF;
GO

-- ------------------------------------------------------------
-- QuestionOptions (only for MCQs, MCQ IDs 6..15)
-- ------------------------------------------------------------
SET IDENTITY_INSERT dbo.QuestionOptions ON;
GO

INSERT INTO dbo.QuestionOptions (OptionId, QuestionId, OptionLabel, OptionText, IsCorrect)
SELECT 1,  6, N'A', N'Use exception handling and controlled retry', 1
UNION ALL SELECT 2,  6, N'B', N'Restart the entire server', 0
UNION ALL SELECT 3,  6, N'C', N'Ignore the error', 0
UNION ALL SELECT 4,  6, N'D', N'Keep calling the API continuously', 0
UNION ALL SELECT 5,  7, N'A', N'Speed up filtering and sorting of rows', 1
UNION ALL SELECT 6,  7, N'B', N'Compress table data', 0
UNION ALL SELECT 7,  7, N'C', N'Encrypt the table', 0
UNION ALL SELECT 8,  7, N'D', N'Replace foreign key constraints', 0
UNION ALL SELECT 9,  8, N'A', N'SELECT DISTINCT', 1
UNION ALL SELECT 10, 8, N'B', N'UNION ALL', 0
UNION ALL SELECT 11, 8, N'C', N'ORDER BY', 0
UNION ALL SELECT 12, 8, N'D', N'TOP 10', 0
UNION ALL SELECT 13, 9, N'A', N'POST', 1
UNION ALL SELECT 14, 9, N'B', N'GET', 0
UNION ALL SELECT 15, 9, N'C', N'DELETE', 0
UNION ALL SELECT 16, 9, N'D', N'TRACE', 0
UNION ALL SELECT 17, 10, N'A', N'The request is unauthenticated', 1
UNION ALL SELECT 18, 10, N'B', N'The user does not have permission', 0
UNION ALL SELECT 19, 10, N'C', N'The endpoint was not found', 0
UNION ALL SELECT 20, 10, N'D', N'The request body is invalid', 0
UNION ALL SELECT 21, 11, N'A', N'Restrict which rows a user can read or write', 1
UNION ALL SELECT 22, 11, N'B', N'Compress rows to save disk space', 0
UNION ALL SELECT 23, 11, N'C', N'Encrypt the whole database', 0
UNION ALL SELECT 24, 11, N'D', N'Automatically create indexes', 0
UNION ALL SELECT 25, 12, N'A', N'Decoupling producers and consumers with asynchronous processing', 1
UNION ALL SELECT 26, 12, N'B', N'Guaranteeing strong consistency always', 0
UNION ALL SELECT 27, 12, N'C', N'Replacing the database entirely', 0
UNION ALL SELECT 28, 12, N'D', N'Increasing application memory', 0
UNION ALL SELECT 29, 13, N'A', N'Grounding an LLM answer with content retrieved from a knowledge base', 1
UNION ALL SELECT 30, 13, N'B', N'Rewriting prompts to be shorter', 0
UNION ALL SELECT 31, 13, N'C', N'Training a model from scratch', 0
UNION ALL SELECT 32, 13, N'D', N'Caching the model weights', 0
UNION ALL SELECT 33, 14, N'A', N'Re-running it produces the same result', 1
UNION ALL SELECT 34, 14, N'B', N'It fails fast on first error', 0
UNION ALL SELECT 35, 14, N'C', N'It uses no memory at all', 0
UNION ALL SELECT 36, 14, N'D', N'It only runs once per day', 0
UNION ALL SELECT 37, 15, N'A', N'def', 1
UNION ALL SELECT 38, 15, N'B', N'func', 0
UNION ALL SELECT 39, 15, N'C', N'function', 0
UNION ALL SELECT 40, 15, N'D', N'lambda', 0;

SET IDENTITY_INSERT dbo.QuestionOptions OFF;
GO

-- ------------------------------------------------------------
-- CandidateQuestionAssignments
--   Kishore  : COMMON-01..05 -> KISHORE-01..04 -> MCQ-01..10
--   Nanthini : COMMON-01..05 -> NANTHINI-01..04 -> MCQ-01..10
--   Sunil    : COMMON-01..05 -> SUNIL-01..04 -> MCQ-01..10
-- ------------------------------------------------------------
SET IDENTITY_INSERT dbo.CandidateQuestionAssignments ON;
GO

INSERT INTO dbo.CandidateQuestionAssignments (AssignmentId, CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy, CreatedAt)
SELECT 1,  1, 1,  1,  1, 1, SYSDATETIME()
UNION ALL SELECT 2,  1, 2,  2,  1, 1, SYSDATETIME()
UNION ALL SELECT 3,  1, 3,  3,  1, 1, SYSDATETIME()
UNION ALL SELECT 4,  1, 4,  4,  1, 1, SYSDATETIME()
UNION ALL SELECT 5,  1, 5,  5,  1, 1, SYSDATETIME()
UNION ALL SELECT 6,  1, 16, 6,  1, 1, SYSDATETIME()
UNION ALL SELECT 7,  1, 17, 7,  1, 1, SYSDATETIME()
UNION ALL SELECT 8,  1, 18, 8,  1, 1, SYSDATETIME()
UNION ALL SELECT 9,  1, 19, 9,  1, 1, SYSDATETIME()
UNION ALL SELECT 10, 1, 6,  10, 1, 1, SYSDATETIME()
UNION ALL SELECT 11, 1, 7,  11, 1, 1, SYSDATETIME()
UNION ALL SELECT 12, 1, 8,  12, 1, 1, SYSDATETIME()
UNION ALL SELECT 13, 1, 9,  13, 1, 1, SYSDATETIME()
UNION ALL SELECT 14, 1, 10, 14, 1, 1, SYSDATETIME()
UNION ALL SELECT 15, 1, 11, 15, 1, 1, SYSDATETIME()
UNION ALL SELECT 16, 1, 12, 16, 1, 1, SYSDATETIME()
UNION ALL SELECT 17, 1, 13, 17, 1, 1, SYSDATETIME()
UNION ALL SELECT 18, 1, 14, 18, 1, 1, SYSDATETIME()
UNION ALL SELECT 19, 1, 15, 19, 1, 1, SYSDATETIME()
UNION ALL SELECT 20, 2, 1,  1,  1, 1, SYSDATETIME()
UNION ALL SELECT 21, 2, 2,  2,  1, 1, SYSDATETIME()
UNION ALL SELECT 22, 2, 3,  3,  1, 1, SYSDATETIME()
UNION ALL SELECT 23, 2, 4,  4,  1, 1, SYSDATETIME()
UNION ALL SELECT 24, 2, 5,  5,  1, 1, SYSDATETIME()
UNION ALL SELECT 25, 2, 20, 6,  1, 1, SYSDATETIME()
UNION ALL SELECT 26, 2, 21, 7,  1, 1, SYSDATETIME()
UNION ALL SELECT 27, 2, 22, 8,  1, 1, SYSDATETIME()
UNION ALL SELECT 28, 2, 23, 9,  1, 1, SYSDATETIME()
UNION ALL SELECT 29, 2, 6,  10, 1, 1, SYSDATETIME()
UNION ALL SELECT 30, 2, 7,  11, 1, 1, SYSDATETIME()
UNION ALL SELECT 31, 2, 8,  12, 1, 1, SYSDATETIME()
UNION ALL SELECT 32, 2, 9,  13, 1, 1, SYSDATETIME()
UNION ALL SELECT 33, 2, 10, 14, 1, 1, SYSDATETIME()
UNION ALL SELECT 34, 2, 11, 15, 1, 1, SYSDATETIME()
UNION ALL SELECT 35, 2, 12, 16, 1, 1, SYSDATETIME()
UNION ALL SELECT 36, 2, 13, 17, 1, 1, SYSDATETIME()
UNION ALL SELECT 37, 2, 14, 18, 1, 1, SYSDATETIME()
UNION ALL SELECT 38, 2, 15, 19, 1, 1, SYSDATETIME()
UNION ALL SELECT 39, 3, 1,  1,  1, 1, SYSDATETIME()
UNION ALL SELECT 40, 3, 2,  2,  1, 1, SYSDATETIME()
UNION ALL SELECT 41, 3, 3,  3,  1, 1, SYSDATETIME()
UNION ALL SELECT 42, 3, 4,  4,  1, 1, SYSDATETIME()
UNION ALL SELECT 43, 3, 5,  5,  1, 1, SYSDATETIME()
UNION ALL SELECT 44, 3, 24, 6,  1, 1, SYSDATETIME()
UNION ALL SELECT 45, 3, 25, 7,  1, 1, SYSDATETIME()
UNION ALL SELECT 46, 3, 26, 8,  1, 1, SYSDATETIME()
UNION ALL SELECT 47, 3, 27, 9,  1, 1, SYSDATETIME()
UNION ALL SELECT 48, 3, 6,  10, 1, 1, SYSDATETIME()
UNION ALL SELECT 49, 3, 7,  11, 1, 1, SYSDATETIME()
UNION ALL SELECT 50, 3, 8,  12, 1, 1, SYSDATETIME()
UNION ALL SELECT 51, 3, 9,  13, 1, 1, SYSDATETIME()
UNION ALL SELECT 52, 3, 10, 14, 1, 1, SYSDATETIME()
UNION ALL SELECT 53, 3, 11, 15, 1, 1, SYSDATETIME()
UNION ALL SELECT 54, 3, 12, 16, 1, 1, SYSDATETIME()
UNION ALL SELECT 55, 3, 13, 17, 1, 1, SYSDATETIME()
UNION ALL SELECT 56, 3, 14, 18, 1, 1, SYSDATETIME()
UNION ALL SELECT 57, 3, 15, 19, 1, 1, SYSDATETIME();

SET IDENTITY_INSERT dbo.CandidateQuestionAssignments OFF;
GO

PRINT 'Seed data inserted successfully';
GO