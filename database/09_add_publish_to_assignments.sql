-- =====================================================================
-- 09_add_publish_to_assignments.sql
-- Adds publish state to CandidateQuestionAssignments so an interviewer
-- can publish individual questions to a candidate in real time.
--
-- Behaviour:
--   * Idempotent - columns added only if missing.
--   * NULL PublishedAt means "not yet published to the candidate".
--   * Candidate-facing endpoints will only return rows where
--     PublishedAt IS NOT NULL.
-- =====================================================================

USE InterviewDB;
GO

SET NOCOUNT ON;
GO

BEGIN TRY
    IF COL_LENGTH('dbo.CandidateQuestionAssignments', 'PublishedAt') IS NULL
    BEGIN
        ALTER TABLE dbo.CandidateQuestionAssignments ADD PublishedAt DATETIME2 NULL;
        PRINT 'Added PublishedAt';
    END
    ELSE
        PRINT 'PublishedAt already exists - skipped';

    IF COL_LENGTH('dbo.CandidateQuestionAssignments', 'PublishedBy') IS NULL
    BEGIN
        ALTER TABLE dbo.CandidateQuestionAssignments ADD PublishedBy INT NULL;
        PRINT 'Added PublishedBy';
    END
    ELSE
        PRINT 'PublishedBy already exists - skipped';

    PRINT 'Assignment publish migration applied successfully.';
END TRY
BEGIN CATCH
    THROW;
END CATCH
GO