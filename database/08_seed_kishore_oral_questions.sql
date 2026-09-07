-- =====================================================================
-- 08_seed_kishore_oral_questions.sql
-- Seeds Kishore-specific ORAL questions (K1..K8 + follow-ups) for the
-- Technical Interview System.
--
-- These questions are personalised to Kishore's experience (agentic AI
-- with LangGraph/CrewAI, RAG, FastAPI, PostgreSQL) and are therefore
-- IsCommon = 0 and assigned ONLY to candidate 1 (Kishore).
--
-- Codes use the K1..K8 prefix to avoid colliding with the existing
-- shared Q2..Q9 codes or the Sunil-specific S1..S8 codes.
--
-- Behaviour:
--   * Idempotent - a QuestionCode is created only if it does not already exist.
--   * Runs inside a single transaction (single batch, no GO between inserts).
--   * Follow-up questions reference their parent via ParentQuestionId.
--   * Follow-ups are NOT assigned to candidates (interviewer-only).
--
-- Requires 05_add_question_hierarchy.sql to have been run first.
-- =====================================================================

USE InterviewDB;
GO

SET NOCOUNT ON;
GO

-- Sanity check: hierarchy columns must exist
IF COL_LENGTH('dbo.Questions', 'ParentQuestionId') IS NULL
BEGIN
    RAISERROR('ParentQuestionId missing - run 05_add_question_hierarchy.sql first', 16, 1);
    RETURN;
END
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- ============================================================
    -- MAIN QUESTIONS  (ParentQuestionId = NULL)
    -- ============================================================

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K1',
            N'Take your most impressive AI project. Now remove the AI completely. What remains, and what did you personally build?',
            N'ORAL', N'Architecture', N'Tough',
            N'The AI is only one part of the system. The remaining components would include the backend/API, database, data processing, authentication, business logic, integrations, error handling, deployment and monitoring. I should be able to explain which components I personally designed and implemented.
The candidate should clearly identify his own contribution.',
            N'"Without AI there is no project." / "The AI framework handled most of it." / "My team built the backend." / Listing LangGraph, RAG, FastAPI, Pinecone, etc. without explaining what he personally implemented.',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K1';
    END
    ELSE PRINT 'K1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K2',
            N'Your RAG system answers correctly 95% of the time. The remaining 5% gives answers that sound extremely convincing but are wrong. How would you discover those failures without a human reading every response?',
            N'ORAL', N'GenAI', N'Tough',
            N'I would create a representative evaluation dataset with known expected answers and trusted source documents. I would separately evaluate retrieval quality and generated-answer quality using automated evaluation, validation rules and periodic human sampling. I would monitor metrics such as faithfulness, correctness, retrieval relevance and hallucination rate.',
            N'"Improve the prompt." / "Use a better LLM." / "Increase the temperature." / "Ask users to report incorrect answers."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K2';
    END
    ELSE PRINT 'K2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K3')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K3',
            N'You are given 500,000 documents. Each document needs processing, but the external AI service sometimes takes 20 seconds and occasionally fails. You cannot keep one HTTP request open for every document. Design the processing architecture.',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'A strong architecture should look approximately like:
500,000 Documents
        -> Job Creation
        -> Queue / Job Store
        -> Worker Processes
        -> AI Service
        -> Validation
        -> PostgreSQL / Storage
        -> Status + Monitoring
The candidate should discuss:
- Asynchronous/background processing
- Queue/job management
- Worker processes
- Timeouts
- Controlled retries
- Exponential backoff
- Rate limiting
- Failure handling
- Persistent job status
- Logging
- Monitoring
- Idempotency
- Resume capability',
            N'"Loop through all 500,000 documents in one API request." / "Create 500,000 threads." / "Retry every failed document continuously." / "Process everything synchronously."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K3';
    END
    ELSE PRINT 'K3 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K4')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K4',
            N'Your PostgreSQL database has grown from 100,000 rows to 50 million. A dashboard query that used to take 200 milliseconds now takes 12 seconds. You are not allowed to simply buy a bigger server. What do you investigate?',
            N'ORAL', N'Data Engineering', N'Medium',
            N'First I would identify the actual bottleneck rather than immediately changing the architecture.
I would investigate:
1. Actual SQL query
2. EXPLAIN / EXPLAIN ANALYZE
3. Indexes
4. Filtering conditions
5. Joins
6. Sorting
7. Aggregations
8. Number of rows being scanned
9. Database statistics
10. Pagination
11. Connection/resource usage
12. Whether unnecessary data is being retrieved',
            N'"Add indexes everywhere." / "Increase RAM." / "Upgrade the database server." / "Move to MongoDB." (without investigating the actual query)',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K4';
    END
    ELSE PRINT 'K4 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K5')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K5',
            N'Your FastAPI endpoint accepts a request and calls three external services. Service A succeeds, B succeeds, C fails. What should the API return, and what should happen internally?',
            N'ORAL', N'API', N'Tough',
            N'It depends on whether C is mandatory for the business operation. If C is mandatory, the overall operation should not be reported as successful. The failure should be recorded and handled through retry/recovery mechanisms. If C is optional, the API may return a partial result but must clearly represent the incomplete state.
The candidate should consider:
- Partial failure
- Timeout
- Retry
- Error state
- Logging
- Monitoring
- Asynchronous processing
- Idempotency
- User-facing status',
            N'"Return 200 because A and B succeeded." / "Ignore C." / "Keep retrying until C succeeds." / "Return an error without recording what happened."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K5';
    END
    ELSE PRINT 'K5 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K6')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K6',
            N'You have five agents in an agentic workflow. The final answer is wrong. How do you determine which agent caused the failure?',
            N'ORAL', N'GenAI', N'Tough',
            N'I would trace each step of the workflow independently. Each agent should have a workflow/request ID and structured input/output logs. I would identify the first point where the information or decision became incorrect, reproduce that step and determine whether the issue came from the agent, tool call, retrieved data or previous agent.',
            N'"Run the whole workflow again." / "Check only the final answer." / "Change the prompt of every agent."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K6';
    END
    ELSE PRINT 'K6 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K7')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K7',
            N'The JD asks for an unattended production pipeline that ran for months. Tell us about the longest-running production system that you personally had responsibility for. What failed during that period?',
            N'ORAL', N'Production', N'Medium',
            N'The candidate should be able to explain:
- The actual system
- Where it was deployed
- How long it operated
- His personal responsibility
- What failed
- How the failure was detected
- How he investigated it
- How he fixed it
- What was changed afterward
- How it was monitored afterward',
            N'"I worked on production systems but the DevOps team handled everything." / "Nothing failed." / "I don''t know; another team monitored it." / "I only developed the application."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K7';
    END
    ELSE PRINT 'K7 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K8')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K8',
            N'Suppose the URL is:
/dashboard?client=ABC
What stops a user from changing ABC to XYZ?',
            N'ORAL', N'RLS', N'Tough',
            N'The client ID in the URL cannot be trusted as the security mechanism. The authenticated user''s identity must determine which tenant they are authorized to access, and authorization must be enforced server-side. Database-level Row-Level Security can provide an additional security boundary so unauthorized rows cannot be returned even if the request parameter is manipulated.',
            N'"The frontend prevents the user from changing it." / "We hide the client ID." / "JavaScript checks whether ABC is valid." / "The API trusts the client ID from the browser."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K8';
    END
    ELSE PRINT 'K8 already exists - skipped';

    -- ============================================================
    -- FOLLOW-UP QUESTIONS  (ParentQuestionId = parent QuestionId)
    -- ============================================================

    DECLARE @K1 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K1');
    DECLARE @K2 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K2');
    DECLARE @K3 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K3');
    DECLARE @K4 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K4');
    DECLARE @K5 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K5');
    DECLARE @K6 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K6');
    DECLARE @K7 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K7');
    DECLARE @K8 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'K8');

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K1-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K1-F1', N'Which part of that project would still work if tomorrow the LLM provider became unavailable?',
            N'ORAL', N'Architecture', N'Tough',
            N'The application infrastructure, database, APIs, business logic and stored data should still function where applicable. The AI-dependent functionality would fail gracefully or move to a fallback state rather than bringing down the entire application.',
            N'"The whole application would stop." / "We would just wait until the LLM comes back."',
            0, 1, 1, @K1, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K1-F1';
    END
    ELSE PRINT 'K1-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K2-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K2-F1', N'How would you measure improvement after making a change?',
            N'ORAL', N'GenAI', N'Tough',
            N'I would run the same benchmark/evaluation dataset against the old and new versions and compare defined metrics. I would also check whether the change affected latency, cost and failure/hallucination rates.',
            N'"If the answers look better, then it improved." / "The new model seems more accurate."',
            0, 1, 1, @K2, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K2-F1';
    END
    ELSE PRINT 'K2-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K2-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K2-F2', N'What would you log?',
            N'ORAL', N'GenAI', N'Tough',
            N'At minimum:
- Request/workflow ID
- User/request information where appropriate
- Query
- Retrieved documents/chunks
- Retrieval scores where applicable
- Prompt/version
- Model/version
- Agent steps if applicable
- Final answer
- Validation/evaluation result
- Latency
- Errors
- Retry count
- Token usage/cost where relevant',
            N'"Only the final answer." / "I would save everything in a text file." (without considering structured logging, traceability or sensitive information)',
            0, 1, 1, @K2, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K2-F2';
    END
    ELSE PRINT 'K2-F2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K3-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K3-F1', N'What happens if the server crashes after 237,000 documents?',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'The processing state must be persisted. The system should know which documents completed, which failed and which are pending. After recovery, processing should resume from the unfinished jobs instead of starting from zero.',
            N'"Start the whole process again." / "The user has to upload the files again." / "The server should not crash."',
            0, 1, 1, @K3, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K3-F1';
    END
    ELSE PRINT 'K3-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K3-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K3-F2', N'How do you resume?',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'Each document/job should have a persistent status such as pending, processing, completed or failed. After recovery, the worker can pick up pending or safely retryable jobs. Completed jobs should not be processed again unnecessarily.',
            N'"Keep the count in a Python variable." / "Store the last processed number in memory."',
            0, 1, 1, @K3, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K3-F2';
    END
    ELSE PRINT 'K3-F2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K3-F3')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K3-F3', N'How do you prevent document 236,999 from being processed twice?',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'Use a unique document/job ID and persistent processing state, combined with idempotent processing and appropriate database constraints. Even if a job is retried, processing it again should not create a duplicate business result.',
            N'"Check a Python variable." / "Check whether the file exists." / "The worker will remember it."',
            0, 1, 1, @K3, 4, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K3-F3';
    END
    ELSE PRINT 'K3-F3 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K4-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K4-F1', N'What would you look at before adding an index?',
            N'ORAL', N'Data Engineering', N'Medium',
            N'I would first understand the query and its execution plan. I would identify the columns involved in filtering, joins and sorting and determine whether an index would actually improve the query. I would also consider the additional storage and write/update overhead of the index.',
            N'"I would index every column used in WHERE." / "More indexes always make PostgreSQL faster."',
            0, 1, 1, @K4, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K4-F1';
    END
    ELSE PRINT 'K4-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K5-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K5-F1', N'Suppose C is a payment service. PostgreSQL has already recorded the order, but the payment service fails. What state should the order have?',
            N'ORAL', N'API', N'Tough',
            N'It should not be marked as successfully paid. It should have an appropriate pending/failed state, with reconciliation or retry handling. The database transaction and external payment transaction need to be treated as separate systems.',
            N'"Mark it as paid and retry later." / "Delete the order." / "Rollback PostgreSQL and assume the payment service also rolled back."',
            0, 1, 1, @K5, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K5-F1';
    END
    ELSE PRINT 'K5-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K6-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K6-F1', N'What would you log?',
            N'ORAL', N'GenAI', N'Tough',
            N'- Workflow/request ID
- Agent name
- Agent input
- Agent output
- Tool calls
- Tool responses
- Retrieved documents/data
- Model/version
- Prompt/version where appropriate
- Latency
- Errors
- Retry count
- Token usage/cost
- Final result
- Validation result',
            N'"Only the final response." / "Only errors."',
            0, 1, 1, @K6, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K6-F1';
    END
    ELSE PRINT 'K6-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K6-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K6-F2', N'Would you retry the whole workflow?',
            N'ORAL', N'GenAI', N'Tough',
            N'Not necessarily. First I would identify where the failure occurred. If the failure is transient, I would retry the affected step if it is safe and idempotent. If the failure is deterministic, retrying the entire workflow will not solve it. The retry strategy should depend on the failure type.',
            N'"Yes, always retry the entire workflow." / "No, never retry."',
            0, 1, 1, @K6, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K6-F2';
    END
    ELSE PRINT 'K6-F2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K7-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K7-F1', N'Suppose your application is running successfully, but nobody is monitoring it. How would you know whether it is actually doing its job?',
            N'ORAL', N'Production', N'Medium',
            N'I would monitor both technical health and business/data health. That includes job completion, record counts, data freshness, processing time, error/rejection rates, external service failures and expected-versus-actual data volumes.',
            N'"If the server is up, it is working." / "If there are no exceptions, it is successful."',
            0, 1, 1, @K7, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K7-F1';
    END
    ELSE PRINT 'K7-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K8-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K8-F1', N'Where should the final security decision be made?',
            N'ORAL', N'RLS', N'Tough',
            N'The final authorization decision must be enforced on the trusted backend/database side, not only in the frontend. For a PostgreSQL-based multi-tenant system, RLS can enforce which rows the authenticated user is allowed to access.',
            N'"Frontend." / "Browser." / "Only in JavaScript."',
            0, 1, 1, @K8, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K8-F1';
    END
    ELSE PRINT 'K8-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'K8-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'K8-F2', N'Explain your answer to a finance manager.',
            N'ORAL', N'RLS', N'Tough',
            N'The screen can decide what to display, but it should not be trusted to protect data. The database should know which customer the logged-in user belongs to and allow only that customer''s records. Even if someone changes the URL or request, the database security rule prevents access to another customer''s information.',
            N'"RLS is a PostgreSQL security feature." / "We use authentication." / "The frontend hides the data."',
            0, 1, 1, @K8, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted K8-F2';
    END
    ELSE PRINT 'K8-F2 already exists - skipped';

    -- ============================================================
    -- CANDIDATE ASSIGNMENTS
    -- Assign main questions (K1..K8) to candidate 1 (Kishore) when not
    -- already assigned. Follow-ups are deliberately NOT assigned.
    -- ============================================================

    INSERT INTO dbo.CandidateQuestionAssignments (CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy, CreatedAt)
    SELECT c.CandidateId, q.QuestionId,
           (SELECT ISNULL(MAX(a.QuestionOrder), 0) FROM dbo.CandidateQuestionAssignments a WHERE a.CandidateId = c.CandidateId)
           + ROW_NUMBER() OVER (PARTITION BY c.CandidateId ORDER BY q.QuestionCode),
           0, 1, SYSDATETIME()
    FROM (VALUES (1)) c(CandidateId)
    CROSS JOIN dbo.Questions q
    WHERE q.QuestionCode IN (N'K1', N'K2', N'K3', N'K4', N'K5', N'K6', N'K7', N'K8')
      AND q.IsActive = 1
      AND NOT EXISTS (
          SELECT 1 FROM dbo.CandidateQuestionAssignments a
          WHERE a.CandidateId = c.CandidateId AND a.QuestionId = q.QuestionId
      );

    PRINT 'Candidate assignments refreshed.';

    COMMIT TRANSACTION;
    PRINT 'Kishore oral question seed committed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
GO

-- Final verification summaries
PRINT '';
PRINT '--- KISHORE ORAL QUESTIONS INSERTED ---';
SELECT q.QuestionCode, q.QuestionType, q.Difficulty, q.IsCommon,
       p.QuestionCode AS ParentCode, q.QuestionOrder
FROM dbo.Questions q
LEFT JOIN dbo.Questions p ON p.QuestionId = q.ParentQuestionId
WHERE q.QuestionCode IN (N'K1',N'K2',N'K3',N'K4',N'K5',N'K6',N'K7',N'K8')
   OR q.QuestionCode IN (N'K1-F1',N'K2-F1',N'K2-F2',N'K3-F1',N'K3-F2',N'K3-F3',N'K4-F1',N'K5-F1',N'K6-F1',N'K6-F2',N'K7-F1',N'K8-F1',N'K8-F2')
ORDER BY q.QuestionCode;
GO

PRINT '--- ASSIGNMENT COUNTS PER CANDIDATE ---';
SELECT c.CandidateName, COUNT(a.AssignmentId) AS AssignedQuestions
FROM dbo.Candidates c
LEFT JOIN dbo.CandidateQuestionAssignments a ON a.CandidateId = c.CandidateId
GROUP BY c.CandidateName
ORDER BY c.CandidateName;
GO