-- =====================================================================
-- 06_seed_oral_questions.sql
-- Seeds the ORAL interview question set (Q2..Q9 + follow-ups) for the
-- Technical Interview System.
--
-- Q1 / Q1-F1 are intentionally SKIPPED: Q1 already exists as GEN-01
-- ("Imagine you deployed a system on Friday...").
--
-- Behaviour:
--   * Idempotent - a QuestionCode is created only if it does not already exist.
--   * Runs inside a single transaction (single batch, no GO between inserts).
--   * Follow-up questions reference their parent via ParentQuestionId.
--   * Mains (Q2..Q9) are assigned to all three candidates (1=Kishore,
--     2=Nanthini, 3=Sunil) when not already assigned; follow-ups are NOT
--     assigned to candidates (they are interviewer-only).
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

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q2',
            N'You mentioned webhook processing and retry mechanisms. Suppose the same webhook arrives four times because the sender doesn''t know whether your server successfully processed it. How would you make sure the business action happens only once?',
            N'ORAL', N'API', N'Tough',
            N'I would assign or use a unique event/webhook ID and make the processing idempotent. I would store the event ID and enforce uniqueness at the database level. If the same event arrives again, the system should recognize that it has already been processed or is being processed and should not perform the business action again.',
            N'"I would check the webhook ID in the application." / "I would ignore duplicate requests from the frontend." / "I would use a boolean variable." / "I would process it only once using an if condition."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q2';
    END
    ELSE PRINT 'Q2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q3')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q3',
            N'You have a working application on your laptop. I give you a fresh Linux server and a domain name. Talk me through everything you would need to do before giving the URL to a customer.',
            N'ORAL', N'Deployment', N'Medium',
            N'1. Access and secure the server. 2. Install required runtime/dependencies. 3. Deploy the application. 4. Configure environment variables/secrets. 5. Configure the production database. 6. Run database migrations. 7. Configure the application process/service. 8. Configure reverse proxy such as Nginx. 9. Configure DNS/domain. 10. Configure SSL/HTTPS. 11. Configure firewall/security rules. 12. Test application/API/database connectivity. 13. Configure logging and monitoring. 14. Perform functional and security checks. 15. Take backup/rollback considerations into account before production release.',
            N'"Copy the project to the server and run it." / "Upload the files and point the domain to the server." / "Install Python and start the application."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q3';
    END
    ELSE PRINT 'Q3 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q4')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q4',
            N'Tomorrow you become responsible for our nightly data pipeline. At 2 AM a CSV arrives. Some rows are wrong, some are duplicates, and occasionally the entire file doesn''t arrive. Nobody will be watching the job. Design how you would make this reliable.',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'File Arrival (monitoring) -> File Validation -> Staging -> Row Validation -> Duplicate Detection -> Valid Records -> production DB; Invalid Records -> Error/Quarantine; Audit + Metrics; Monitoring + Alerts. Should mention: file-arrival monitoring, schema validation, required-field validation, data-type validation, duplicate detection, staging tables, error/rejection handling, database constraints, transaction handling, retry mechanism, audit information, record counts, monitoring, alerting, idempotency.',
            N'"Read the CSV and insert everything into PostgreSQL." / "If a row fails, stop the entire process." / "Someone should manually check the file every morning."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q4';
    END
    ELSE PRINT 'Q4 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q5')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q5',
            N'You''ve worked with PostgreSQL, but suppose tomorrow we move this application to Supabase and introduce Row-Level Security. What would you need to understand before allowing production users into the system?',
            N'ORAL', N'RLS', N'Tough',
            N'I would understand how users are authenticated, how users are associated with clients/tenants, how database tables are structured, what RLS policies exist, which operations each role can perform, and how the policies are tested. I would also verify that the frontend cannot bypass the database security rules.',
            N'"I would learn Supabase syntax." / "The frontend will hide other clients'' data." / "We can simply add client_id to the URL."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q5';
    END
    ELSE PRINT 'Q5 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q6')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q6',
            N'An LLM gives the wrong answer only 2% of the time. The business says that 2% is unacceptable because the result affects a customer. What would you put around the LLM?',
            N'ORAL', N'GenAI', N'Tough',
            N'Input validation; controlled/structured output; grounding against trusted data; deterministic business rules; output validation; confidence/uncertainty handling; human review for high-risk cases; audit logging; model/version tracking; monitoring; fallback mechanism. Strong answer: "If a 2% error rate is unacceptable, I would not rely on prompt improvement alone. I would put validation and business rules around the model and route uncertain or high-impact cases for human review."',
            N'"Improve the prompt." / "Use a better model." / "Train the model again." / "Use temperature 0." - these may be components, but they do not solve the entire reliability problem.',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q6';
    END
    ELSE PRINT 'Q6 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q7')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q7',
            N'We have a dashboard showing client data. Six months from now there may be 500 clients and 100 million records. You are asked to make the current system ready for that future. What would you question before changing anything?',
            N'ORAL', N'System Design', N'Tough',
            N'What are the actual dashboard queries? How is tenant/client data modelled? What are the expected read/write volumes? What filtering and sorting are required? What indexes exist? What are the current query execution plans? How is pagination implemented? Are all records really required in the operational database? What data-retention/archive requirements exist? How will RLS/tenant isolation work? What monitoring is required? What are the expected growth rates? Where are the current bottlenecks?',
            N'"Upgrade the server." / "Add more RAM." / "Create indexes on every column." / "Move everything to another database." without first understanding workload and bottlenecks.',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q7';
    END
    ELSE PRINT 'Q7 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q8')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q8',
            N'Tell us about a technical decision you made that nobody specifically asked you to make, but you made it because you believed the system would otherwise become unreliable.',
            N'ORAL', N'Communication', N'Medium',
            N'Any genuine example is acceptable if the candidate demonstrates: 1. A real problem. 2. Personal ownership. 3. Identification of a risk. 4. Evaluation of possible solutions. 5. Technical decision. 6. Implementation. 7. Measurable/improved result. 8. Understanding of what could have happened if nothing was changed. Examples: introducing retry handling, preventing duplicate webhooks, improving database queries, adding monitoring, improving deployment procedures, adding validation, improving backup/recovery, introducing error handling.',
            N'"My manager asked me to implement it." / "The team decided it." / "I don''t remember." / "I suggested something but another developer implemented it."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q8';
    END
    ELSE PRINT 'Q8 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q9')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q9',
            N'You join us tomorrow. Nobody is available to tell you exactly how the existing system works. You discover that one part of it is fragile, but it is currently working. Do you leave it alone because nobody reported a problem, or do you change it? Walk us through your decision.',
            N'ORAL', N'Problem Solving', N'Medium',
            N'"I would not immediately change a working production system just because I believe it is fragile. First I would understand the existing behaviour, collect evidence, identify the risk, document it, reproduce/test the issue safely, evaluate the impact, and then make a controlled change if the risk justifies it. I would also have a rollback plan and monitor the change after deployment."',
            N'"I would immediately fix it." / "If it works, I won''t touch it." / "I would ask the manager what to do and wait." / "I would deploy my solution directly to production."',
            1, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q9';
    END
    ELSE PRINT 'Q9 already exists - skipped';

    -- ============================================================
    -- FOLLOW-UP QUESTIONS  (ParentQuestionId = parent QuestionId)
    -- ============================================================

    DECLARE @Q2 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q2');
    DECLARE @Q3 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q3');
    DECLARE @Q4 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q4');
    DECLARE @Q5 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q5');
    DECLARE @Q7 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q7');
    DECLARE @Q8 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'Q8');

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q2-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q2-F1', N'Where would you store the evidence that the webhook was already processed?',
            N'ORAL', N'API', N'Tough',
            N'In a persistent database table, with the webhook/event ID as a unique value, along with processing status, timestamps and possibly the relevant payload/reference. Example: WebhookEvents (EventId, Status, ReceivedAt, ProcessedAt) with a unique constraint on EventId.',
            N'Browser/local storage / temporary memory variable / application cache as the only source of truth / a text file without proper concurrency/control.',
            1, 1, 1, @Q2, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q2-F1';
    END
    ELSE PRINT 'Q2-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q2-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q2-F2', N'What happens if your application crashes after the business operation but before you record that the webhook was processed?',
            N'ORAL', N'API', N'Tough',
            N'The design needs transactional/idempotent protection so that a retry cannot create a second business effect. For database operations, the business operation and processing record should be handled atomically where possible. For external operations, an idempotency key or appropriate reliable messaging/outbox approach may be required.',
            N'"The next request will just process it again." / "We can manually remove the duplicate later." / "The server shouldn''t crash."',
            1, 1, 1, @Q2, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q2-F2';
    END
    ELSE PRINT 'Q2-F2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q3-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q3-F1', N'Now SSL works, but the application is returning 502. What do you check?',
            N'ORAL', N'Deployment', N'Medium',
            N'Check whether the application process is running. Check the application port. Check whether Nginx/reverse proxy is pointing to the correct port. Check application logs. Check Nginx logs. Check firewall/network configuration. Check whether the upstream service is reachable. Check application startup/configuration errors.',
            N'"Renew the SSL certificate." / "Restart the server." / "Reinstall Nginx."',
            1, 1, 1, @Q3, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q3-F1';
    END
    ELSE PRINT 'Q3-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q3-F2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q3-F2', N'The application works through localhost but not through the domain. What are your possibilities?',
            N'ORAL', N'Deployment', N'Medium',
            N'DNS configuration; domain resolving to the correct server; reverse proxy configuration; application binding/listening address; port configuration; firewall; SSL configuration; Nginx/server routing; host/domain configuration.',
            N'"The application code is wrong." / "The domain is not working." without checking DNS, proxy, ports and server configuration.',
            1, 1, 1, @Q3, 3, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q3-F2';
    END
    ELSE PRINT 'Q3-F2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q4-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q4-F1', N'Today''s file has 200,000 records. Yesterday had 1.2 million. The program reports SUCCESS. Do you accept it?',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'No. Technical execution succeeded, but the data may not be correct. I would investigate the source and compare expected versus actual volume, source completeness, historical patterns and business reconciliation. A significant unexpected drop should generate an alert.',
            N'"Yes, because the program completed successfully." / "Yes, because there was no exception." / "No, because 200,000 is always too low." - the acceptable volume depends on business expectations.',
            1, 1, 1, @Q4, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q4-F1';
    END
    ELSE PRINT 'Q4-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q5-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q5-F1', N'Explain how you would stop a user from changing a request parameter and viewing another client''s records.',
            N'ORAL', N'RLS', N'Tough',
            N'The frontend parameter cannot be trusted as the security mechanism. The authenticated user''s identity should determine which tenant/client they are authorized to access, and the database should enforce that restriction through appropriate RLS policies. Even if the user changes the client ID in the request, the database should reject access to unauthorized rows.',
            N'"We will disable editing of the client ID." / "We will validate it in JavaScript." / "We will hide the other client''s ID." / "The API will trust the client ID sent by the frontend."',
            1, 1, 1, @Q5, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q5-F1';
    END
    ELSE PRINT 'Q5-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q7-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q7-F1', N'A dashboard query currently takes 200 ms. After the database grows, it takes 12 seconds. What would you investigate before changing the architecture?',
            N'ORAL', N'System Design', N'Tough',
            N'1. Examine the actual SQL query. 2. Check execution plan. 3. Check indexes. 4. Check filtering and joins. 5. Check data volume/selectivity. 6. Check sorting/aggregation. 7. Check database statistics. 8. Check connection/resource usage. 9. Identify the actual bottleneck before making architectural changes.',
            N'"Increase the server size." / "Add an index without checking the query." / "Rewrite the entire application."',
            1, 1, 1, @Q7, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q7-F1';
    END
    ELSE PRINT 'Q7-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'Q8-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'Q8-F1', N'When you say "we implemented it", what exactly did you personally do?',
            N'ORAL', N'Communication', N'Medium',
            N'The candidate should clearly identify their personal contribution: "I designed this part, implemented it, tested it, deployed it and monitored the result." It is acceptable for the candidate to have worked as part of a team, but they must clearly distinguish their own contribution from the team''s work.',
            N'"My team handled it." / "The DevOps team did that." / "I was involved." without explaining what they personally did.',
            1, 1, 1, @Q8, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted Q8-F1';
    END
    ELSE PRINT 'Q8-F1 already exists - skipped';

    -- ============================================================
    -- CANDIDATE ASSIGNMENTS
    -- Assign main questions (Q2..Q9) to candidates 1, 2, 3 when not
    -- already assigned. Order continues after each candidate's max.
    -- Follow-ups are deliberately NOT assigned to candidates.
    -- ============================================================

    INSERT INTO dbo.CandidateQuestionAssignments (CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy, CreatedAt)
    SELECT c.CandidateId, q.QuestionId,
           (SELECT ISNULL(MAX(a.QuestionOrder), 0) FROM dbo.CandidateQuestionAssignments a WHERE a.CandidateId = c.CandidateId)
           + ROW_NUMBER() OVER (PARTITION BY c.CandidateId ORDER BY q.QuestionCode),
           0, 1, SYSDATETIME()
    FROM (VALUES (1), (2), (3)) c(CandidateId)
    CROSS JOIN dbo.Questions q
    WHERE q.QuestionCode IN (N'Q2', N'Q3', N'Q4', N'Q5', N'Q6', N'Q7', N'Q8', N'Q9')
      AND q.IsActive = 1
      AND NOT EXISTS (
          SELECT 1 FROM dbo.CandidateQuestionAssignments a
          WHERE a.CandidateId = c.CandidateId AND a.QuestionId = q.QuestionId
      );

    PRINT 'Candidate assignments refreshed.';

    COMMIT TRANSACTION;
    PRINT 'Oral question seed committed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
GO

-- Final verification summaries
PRINT '';
PRINT '--- ORAL QUESTIONS INSERTED ---';
SELECT q.QuestionCode, q.QuestionType, q.Difficulty, q.IsCommon,
       p.QuestionCode AS ParentCode, q.QuestionOrder
FROM dbo.Questions q
LEFT JOIN dbo.Questions p ON p.QuestionId = q.ParentQuestionId
WHERE q.QuestionCode IN (N'Q2',N'Q3',N'Q4',N'Q5',N'Q6',N'Q7',N'Q8',N'Q9')
   OR q.QuestionCode IN (N'Q2-F1',N'Q2-F2',N'Q3-F1',N'Q3-F2',N'Q4-F1',N'Q5-F1',N'Q7-F1',N'Q8-F1')
ORDER BY q.QuestionCode;
GO

PRINT '--- ASSIGNMENT COUNTS PER CANDIDATE ---';
SELECT c.CandidateName, COUNT(a.AssignmentId) AS AssignedQuestions
FROM dbo.Candidates c
LEFT JOIN dbo.CandidateQuestionAssignments a ON a.CandidateId = c.CandidateId
GROUP BY c.CandidateName
ORDER BY c.CandidateName;
GO