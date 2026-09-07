-- =====================================================================
-- 07_seed_sunil_oral_questions.sql
-- Seeds Sunil-specific ORAL questions (S1..S8 + follow-ups) for the
-- Technical Interview System.
--
-- These questions are personalised to Sunil's experience (fraud
-- detection, model monitoring, agentic RAG assistant, etc.) and are
-- therefore IsCommon = 0 and assigned ONLY to candidate 3 (Sunil).
--
-- Codes use the S1..S8 prefix to avoid colliding with the existing
-- shared Q2..Q9 codes.
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

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S1',
            N'You built a fraud detection system. Now imagine management tells you: ''You are not allowed to use machine learning for the first version.'' How would you still detect suspicious transactions?',
            N'ORAL', N'Fraud Detection', N'Tough',
            N'I would start with business rules and known fraud patterns rather than ML.
Possible rules:
- Unusually high transaction amount
- Multiple transactions within a short period
- Sudden change from normal customer behavior
- Multiple transactions from unusual locations/devices
- Duplicate transactions
- Excessive transaction frequency
- Transactions outside normal operating patterns
- Threshold-based rules
- Historical customer behavior comparison
- Combination of multiple risk indicators
For example:
IF amount > customer''s normal threshold
AND transaction frequency is unusually high
THEN flag for review
A strong candidate should also mention that rules should be configurable, monitored and periodically reviewed.',
            N'"We cannot detect fraud without ML." / "Use deep learning instead." / "Use an LLM." / "Use the same ML model without training."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S1';
    END
    ELSE PRINT 'S1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S2')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S2',
            N'A bank sends you today''s transaction file. The file contains 1 million records. The pipeline processes successfully, but the amount field is missing for 8% of records. Would you load the data?',
            N'ORAL', N'Data Quality', N'Medium',
            N'I would not automatically load all the records into the production dataset. First I would determine whether the amount field is mandatory and understand the business impact. Valid records may potentially be processed while invalid records are quarantined, depending on the agreed business rules.
The candidate should consider:
- Mandatory vs optional fields
- Business rules
- Data quality thresholds
- Reject/quarantine strategy
- Error reporting
- Partial processing
- Audit trail
- Alerting
- Source-system investigation',
            N'"Yes, because the pipeline completed." / "No, reject the entire file." (without considering whether partial processing is appropriate) / "Replace missing amounts with zero."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S2';
    END
    ELSE PRINT 'S2 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S3')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S3',
            N'Yesterday we received transactions from 15 branches. Today the file contains transactions from only 11 branches. Every row is valid and the pipeline reports SUCCESS. How would you detect the problem?',
            N'ORAL', N'Data Pipeline', N'Tough',
            N'I would not rely only on row-level validation. I would have source-level completeness checks and compare today''s data against expected branch coverage and historical patterns.
Possible checks:
- Expected branch list
- Branch count
- Previous-day comparison
- Historical baseline
- Expected transaction volume per branch
- Missing-source detection
- Reconciliation with source systems
- Business-level validation
- Alerts
Example:
Expected branches: 15
Received branches: 11

Missing:
Branch 04
Branch 09
Branch 13
Branch 15
This should generate an alert.',
            N'"All rows are valid, so the pipeline succeeded." / "Check whether there are errors in the file." / "Run the pipeline again."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S3';
    END
    ELSE PRINT 'S3 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S4')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S4',
            N'Your fraud model''s accuracy hasn''t changed, but the business suddenly reports twice as many suspicious transactions. What could be happening?',
            N'ORAL', N'Model Monitoring', N'Tough',
            N'Possible explanations include:
- Actual increase in fraudulent activity
- Change in customer behavior
- Change in transaction volume
- Change in fraud patterns
- Threshold change
- More false positives
- Input/data distribution change
- Upstream data-quality problem
- Feature changes
- Business-rule changes
- Changes in how alerts are interpreted
A strong candidate should not immediately conclude that the model needs retraining.',
            N'"The model is outdated." / "Retrain the model immediately." / "Increase the model accuracy."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S4';
    END
    ELSE PRINT 'S4 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S5')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S5',
            N'A compliance officer asks a question and the RAG system gives a confident answer. The retrieved documents do not actually support that answer. What should the system do?',
            N'ORAL', N'GenAI', N'Tough',
            N'The system should not confidently provide an unsupported answer. It should identify that the retrieved evidence does not sufficiently support the response and either return an appropriate ''insufficient information'' response or route the case for human review.
Possible safeguards:
- Grounding validation
- Citation/source verification
- Confidence threshold
- Answer-to-context validation
- Human escalation
- Structured output
- Audit logging
- Monitoring
- Fallback response',
            N'"Let the LLM answer because it has high confidence." / "Generate the answer from its general knowledge." / "Increase the temperature." / "Just retrieve more documents."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S5';
    END
    ELSE PRINT 'S5 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S6')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S6',
            N'You have a transaction table with 30 million rows. The operations team asks for the number of transactions per customer for the previous seven days. The query is slow. Walk us through how you would investigate it.',
            N'ORAL', N'Data Engineering', N'Medium',
            N'The candidate should first understand the query and workload.
Then:
1. Check the actual SQL.
2. Check the execution plan.
3. Check indexes.
4. Check the date filtering.
5. Check the customer grouping.
6. Check whether the query scans the entire table.
7. Check table statistics.
8. Check whether unnecessary columns/joins are involved.
9. Check database resource usage.
10. Consider appropriate indexing/partitioning/aggregation depending on the workload.
11. Test the improvement using realistic data.
For example, the candidate may consider an index involving:
transaction_date
customer_id
depending on the actual query and data distribution.',
            N'"Add an index on everything." / "Increase RAM." / "Move to another database." / "Use Python instead of SQL." (without investigating the actual bottleneck)',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S6';
    END
    ELSE PRINT 'S6 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S7')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S7',
            N'Your Python service receives data from a banking system. The upstream system sends the same transaction twice because it retries. How do you ensure the downstream database doesn''t create two transactions?',
            N'ORAL', N'API', N'Tough',
            N'I would identify a reliable unique transaction/business ID and enforce uniqueness at the database level. The application should use an idempotent insert/upsert approach so retries don''t create duplicate business records.
For example:
transaction_id = TX12345
with a unique database constraint.
The candidate may also mention:
- Idempotency key
- Unique constraint
- Upsert
- Transaction handling
- Concurrency/race conditions
- Audit trail',
            N'"Check if it exists before inserting." (without considering concurrent requests) / "Ignore duplicate requests in the frontend." / "Remove duplicates later."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S7';
    END
    ELSE PRINT 'S7 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S8')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S8',
            N'Your background is strongly oriented toward data science and GenAI. This role initially spends significant time on ingestion, validation, PostgreSQL, monitoring and operational data quality. Which part of that work would you find least interesting, and how would you handle it?',
            N'ORAL', N'Communication', N'Medium',
            N'A strong answer would be honest but demonstrate maturity:
''The AI/ML work is probably what I find most interesting, but I understand that reliable data ingestion, validation and database infrastructure are the foundation for any intelligence system. I am comfortable working on those areas because they are necessary for the product, and I would look for opportunities to apply data/AI techniques where they provide genuine value.''',
            N'"I mainly want to work on AI." / "Database work isn''t really my interest." / "I would expect to move to AI work quickly." / "I don''t want to spend much time on data loading."',
            0, 1, 1, NULL, 1, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S8';
    END
    ELSE PRINT 'S8 already exists - skipped';

    -- ============================================================
    -- FOLLOW-UP QUESTIONS  (ParentQuestionId = parent QuestionId)
    -- ============================================================

    DECLARE @S2 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S2');
    DECLARE @S4 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S4');
    DECLARE @S5 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S5');
    DECLARE @S6 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S6');
    DECLARE @S7 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S7');
    DECLARE @S8 INT = (SELECT TOP 1 QuestionId FROM dbo.Questions WHERE QuestionCode = N'S8');

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S2-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S2-F1', N'Who decides whether 8% is acceptable?',
            N'ORAL', N'Data Quality', N'Medium',
            N'The engineering team should identify and communicate the technical/data-quality risk, but the acceptable business threshold should be agreed with the business/data owner based on the meaning and criticality of the field.',
            N'"The developer decides." / "The database decides." / "If the pipeline doesn''t fail, it''s acceptable."',
            0, 1, 1, @S2, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S2-F1';
    END
    ELSE PRINT 'S2-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S4-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S4-F1', N'What would you investigate before retraining the model?',
            N'ORAL', N'Model Monitoring', N'Tough',
            N'1. Check transaction volume. 2. Check input data quality. 3. Compare feature distributions with historical data. 4. Check prediction-score distribution. 5. Check thresholds. 6. Check false-positive rate. 7. Check whether business rules changed. 8. Check whether actual fraud increased. 9. Check upstream system changes. 10. Only then decide whether retraining is necessary.',
            N'"Collect new data and retrain." / "Use a more complex algorithm." / "Change the threshold immediately." (without investigating the cause)',
            0, 1, 1, @S4, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S4-F1';
    END
    ELSE PRINT 'S4-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S5-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S5-F1', N'Would you allow the model to answer anyway?',
            N'ORAL', N'GenAI', N'Tough',
            N'Not as a definitive compliance answer if the supporting evidence is missing. For a high-risk domain, I would either provide a clearly qualified response or escalate it for human review.',
            N'"Yes, if the model is confident." / "Yes, because LLMs know general information."',
            0, 1, 1, @S5, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S5-F1';
    END
    ELSE PRINT 'S5-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S6-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S6-F1', N'Would you immediately create an index on customer_id?',
            N'ORAL', N'Data Engineering', N'Medium',
            N'Not automatically. I would first inspect the query and execution plan. The useful index depends on the filtering, grouping, sorting and data distribution.',
            N'"Yes, every customer query needs a customer_id index."',
            0, 1, 1, @S6, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S6-F1';
    END
    ELSE PRINT 'S6-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S7-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S7-F1', N'Why isn''t simply checking the database first enough?',
            N'ORAL', N'API', N'Tough',
            N'Two requests can check at the same time, both see that the transaction doesn''t exist, and both attempt to insert it. The database needs a unique constraint or atomic operation to protect against that race condition.',
            N'"Because the query may be slow."',
            0, 1, 1, @S7, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S7-F1';
    END
    ELSE PRINT 'S7-F1 already exists - skipped';

    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = N'S8-F1')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, WeakAnswer, IsCommon, CreatedBy, IsActive, ParentQuestionId, QuestionOrder, CreatedAt, UpdatedAt)
        VALUES (
            N'S8-F1', N'Suppose you spend your first three months mostly fixing data-quality problems and improving the pipeline, with almost no GenAI development. How would you measure whether those three months were successful?',
            N'ORAL', N'Communication', N'Medium',
            N'The candidate should focus on measurable engineering outcomes:
- Fewer data errors
- Higher data completeness
- Reliable pipeline execution
- Reduced manual intervention
- Faster processing
- Better monitoring
- Reduced failures
- Better data freshness
- Improved reconciliation
- Better database performance
Example:
''If we move from frequent manual corrections to an unattended pipeline with measurable validation, alerts and reliable data delivery, that would be a successful first phase even without building a new AI model.''',
            N'"If we build an AI feature." / "If we get to work on GenAI." / "If management is satisfied." (without measurable technical/business outcomes)',
            0, 1, 1, @S8, 2, SYSDATETIME(), SYSDATETIME()
        );
        PRINT 'Inserted S8-F1';
    END
    ELSE PRINT 'S8-F1 already exists - skipped';

    -- ============================================================
    -- CANDIDATE ASSIGNMENTS
    -- Assign main questions (S1..S8) to candidate 3 (Sunil) when not
    -- already assigned. Follow-ups are deliberately NOT assigned.
    -- ============================================================

    INSERT INTO dbo.CandidateQuestionAssignments (CandidateId, QuestionId, QuestionOrder, IsMandatory, AssignedBy, CreatedAt)
    SELECT c.CandidateId, q.QuestionId,
           (SELECT ISNULL(MAX(a.QuestionOrder), 0) FROM dbo.CandidateQuestionAssignments a WHERE a.CandidateId = c.CandidateId)
           + ROW_NUMBER() OVER (PARTITION BY c.CandidateId ORDER BY q.QuestionCode),
           0, 1, SYSDATETIME()
    FROM (VALUES (3)) c(CandidateId)
    CROSS JOIN dbo.Questions q
    WHERE q.QuestionCode IN (N'S1', N'S2', N'S3', N'S4', N'S5', N'S6', N'S7', N'S8')
      AND q.IsActive = 1
      AND NOT EXISTS (
          SELECT 1 FROM dbo.CandidateQuestionAssignments a
          WHERE a.CandidateId = c.CandidateId AND a.QuestionId = q.QuestionId
      );

    PRINT 'Candidate assignments refreshed.';

    COMMIT TRANSACTION;
    PRINT 'Sunil oral question seed committed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
GO

-- Final verification summaries
PRINT '';
PRINT '--- SUNIL ORAL QUESTIONS INSERTED ---';
SELECT q.QuestionCode, q.QuestionType, q.Difficulty, q.IsCommon,
       p.QuestionCode AS ParentCode, q.QuestionOrder
FROM dbo.Questions q
LEFT JOIN dbo.Questions p ON p.QuestionId = q.ParentQuestionId
WHERE q.QuestionCode IN (N'S1',N'S2',N'S3',N'S4',N'S5',N'S6',N'S7',N'S8')
   OR q.QuestionCode IN (N'S2-F1',N'S4-F1',N'S5-F1',N'S6-F1',N'S7-F1',N'S8-F1')
ORDER BY q.QuestionCode;
GO

PRINT '--- ASSIGNMENT COUNTS PER CANDIDATE ---';
SELECT c.CandidateName, COUNT(a.AssignmentId) AS AssignedQuestions
FROM dbo.Candidates c
LEFT JOIN dbo.CandidateQuestionAssignments a ON a.CandidateId = c.CandidateId
GROUP BY c.CandidateName
ORDER BY c.CandidateName;
GO