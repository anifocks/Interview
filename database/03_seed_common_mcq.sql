-- ============================================================
-- 03_seed_common_mcq.sql
-- Seeds the 10 common MCQ questions for the Interview Portal.
--
-- Safe to run more than once:
--   * A question is inserted only when its QuestionCode does not exist
--   * The whole script runs inside one transaction
--
-- The correct option is stored with IsCorrect = 1, all others 0.
-- IMPORTANT: The questions, options, difficulty levels and correct
-- answers are provided verbatim and must NOT be modified.
-- ============================================================

USE InterviewDB;
GO

IF OBJECT_ID('dbo.Questions', 'U') IS NULL OR OBJECT_ID('dbo.QuestionOptions', 'U') IS NULL
BEGIN
    PRINT 'Tables Questions / QuestionOptions not found. Run 02_create_tables.sql first.';
    RETURN;
END
GO

BEGIN TRANSACTION;
BEGIN TRY

    -- Q1 Python - Error Handling (Easy)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-001')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-001',
            N'A Python program calls an external API. Sometimes the API is unavailable. What is the best approach?',
            N'MCQ', N'Python', N'Easy',
            N'A. Use exception handling and controlled retry', 1, 1
        );
        DECLARE @q1 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q1, N'A', N'Use exception handling and controlled retry', 1),
            (@q1, N'B', N'Restart the entire server', 0),
            (@q1, N'C', N'Ignore the error', 0),
            (@q1, N'D', N'Keep calling the API continuously', 0);
        PRINT 'Inserted MCQ-001';
    END

    -- Q2 PostgreSQL - Index (Easy)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-002')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-002',
            N'A PostgreSQL table has 10 million records. A query frequently searches using customer_id. What can improve the query performance?',
            N'MCQ', N'PostgreSQL', N'Easy',
            N'D. Add an index on customer_id', 1, 1
        );
        DECLARE @q2 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q2, N'A', N'Delete old records', 0),
            (@q2, N'B', N'Increase the number of API calls', 0),
            (@q2, N'C', N'Convert the database to Excel', 0),
            (@q2, N'D', N'Add an index on customer_id', 1);
        PRINT 'Inserted MCQ-002';
    END

    -- Q3 Data Pipeline - Invalid Data (Easy)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-003')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-003',
            N'A CSV file contains 100,000 records, but 2,000 records have invalid customer IDs. What is the best approach?',
            N'MCQ', N'Data Pipeline', N'Easy',
            N'B. Validate the records and handle invalid records separately', 1, 1
        );
        DECLARE @q3 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q3, N'A', N'Insert all records without checking', 0),
            (@q3, N'B', N'Validate the records and handle invalid records separately', 1),
            (@q3, N'C', N'Delete the CSV file', 0),
            (@q3, N'D', N'Stop the entire application permanently', 0);
        PRINT 'Inserted MCQ-003';
    END

    -- Q4 API - HTTP Status (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-004')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-004',
            N'An API returns HTTP 200 OK, but the database contains zero records because the business operation failed. What is the main problem?',
            N'MCQ', N'API', N'Medium',
            N'C. The API should communicate the actual business result', 1, 1
        );
        DECLARE @q4 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q4, N'A', N'The database should be removed', 0),
            (@q4, N'B', N'HTTP 200 always means the business operation succeeded', 0),
            (@q4, N'C', N'The API should communicate the actual business result', 1),
            (@q4, N'D', N'The frontend should ignore the response', 0);
        PRINT 'Inserted MCQ-004';
    END

    -- Q5 Duplicate Data (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-005')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-005',
            N'An external system accidentally sends the same transaction twice. How should your system prevent duplicate transactions?',
            N'MCQ', N'Database', N'Medium',
            N'A. Use a unique transaction ID and database constraint', 1, 1
        );
        DECLARE @q5 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q5, N'A', N'Use a unique transaction ID and database constraint', 1),
            (@q5, N'B', N'Accept both transactions', 0),
            (@q5, N'C', N'Restart the database', 0),
            (@q5, N'D', N'Ask the user to delete one manually', 0);
        PRINT 'Inserted MCQ-005';
    END

    -- Q6 Production Monitoring (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-006')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-006',
            N'A nightly pipeline normally processes around 500,000 records. One day it processes only 300,000 records but reports SUCCESS. What should the system ideally do?',
            N'MCQ', N'Production Monitoring', N'Medium',
            N'D. Compare the result with expected volume and raise an alert', 1, 1
        );
        DECLARE @q6 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q6, N'A', N'Automatically delete the 300,000 records', 0),
            (@q6, N'B', N'Restart the server', 0),
            (@q6, N'C', N'Consider it successful because there is no technical error', 0),
            (@q6, N'D', N'Compare the result with expected volume and raise an alert', 1);
        PRINT 'Inserted MCQ-006';
    END

    -- Q7 Multi-Tenant Security (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-007')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-007',
            N'A dashboard is used by 50 different clients. A user from Client A changes the URL from:' + CHAR(10) + N'' + CHAR(10) + N'client=A' + CHAR(10) + N'' + CHAR(10) + N'to:' + CHAR(10) + N'' + CHAR(10) + N'client=B' + CHAR(10) + N'' + CHAR(10) + N'What should prevent the user from seeing Client B''s data?',
            N'MCQ', N'Multi-Tenant Security', N'Medium',
            N'B. Backend/database authorization and row-level security', 1, 1
        );
        DECLARE @q7 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q7, N'A', N'JavaScript hiding Client B', 0),
            (@q7, N'B', N'Backend/database authorization and row-level security', 1),
            (@q7, N'C', N'A dropdown that does not show Client B', 0),
            (@q7, N'D', N'The URL being difficult to guess', 0);
        PRINT 'Inserted MCQ-007';
    END

    -- Q8 Database Performance (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-008')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-008',
            N'A dashboard query that previously took 200 ms now takes 10 seconds after the database grows from 1 million to 50 million records. What should you do first?',
            N'MCQ', N'Database Performance', N'Medium',
            N'A. Check the SQL query and execution plan', 1, 1
        );
        DECLARE @q8 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q8, N'A', N'Check the SQL query and execution plan', 1),
            (@q8, N'B', N'Immediately buy a larger server', 0),
            (@q8, N'C', N'Add indexes to every column', 0),
            (@q8, N'D', N'Rewrite the entire application', 0);
        PRINT 'Inserted MCQ-008';
    END

    -- Q9 Requirement Handling (Medium)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-009')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-009',
            N'A requirement is only 60% clear and your manager is unavailable for two days. What is the best approach?',
            N'MCQ', N'Requirement Handling', N'Medium',
            N'C. Start the clear portion, document assumptions and identify questions', 1, 1
        );
        DECLARE @q9 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q9, N'A', N'Guess the remaining 40% and implement everything', 0),
            (@q9, N'B', N'Ask another developer to make all decisions', 0),
            (@q9, N'C', N'Start the clear portion, document assumptions and identify questions', 1),
            (@q9, N'D', N'Stop all work until the manager returns', 0);
        PRINT 'Inserted MCQ-009';
    END

    -- Q10 Data Pipeline Reliability (Tough)
    IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE QuestionCode = 'MCQ-010')
    BEGIN
        INSERT INTO dbo.Questions (QuestionCode, QuestionText, QuestionType, Category, Difficulty, ExpectedAnswer, IsCommon, IsActive)
        VALUES (
            N'MCQ-010',
            N'A pipeline receives a file every night.' + CHAR(10) + N'' + CHAR(10) + N'Yesterday:' + CHAR(10) + N'- Source file: 1,000,000 records' + CHAR(10) + N'- Processed: 1,000,000' + CHAR(10) + N'- Database: 1,000,000' + CHAR(10) + N'' + CHAR(10) + N'Today:' + CHAR(10) + N'- Source file: 800,000 records' + CHAR(10) + N'- Processed: 800,000' + CHAR(10) + N'- Database: 800,000' + CHAR(10) + N'- Pipeline status: SUCCESS' + CHAR(10) + N'- No application errors' + CHAR(10) + N'' + CHAR(10) + N'What is the best conclusion?',
            N'MCQ', N'Data Pipeline Reliability', N'Tough',
            N'D. The source may be incomplete; the system should perform reconciliation/volume checks and investigate the 20% reduction', 1, 1
        );
        DECLARE @q10 INT = SCOPE_IDENTITY();
        INSERT INTO dbo.QuestionOptions (QuestionId, OptionLabel, OptionText, IsCorrect) VALUES
            (@q10, N'A', N'The database must be corrupted', 0),
            (@q10, N'B', N'The pipeline is definitely broken', 0),
            (@q10, N'C', N'The pipeline is definitely correct because it says SUCCESS', 0),
            (@q10, N'D', N'The source may be incomplete; the system should perform reconciliation/volume checks and investigate the 20% reduction', 1);
        PRINT 'Inserted MCQ-010';
    END

    COMMIT TRANSACTION;
    PRINT 'Seed complete: 10 common MCQs processed.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT 'Seed failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO