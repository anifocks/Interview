-- =====================================================================
-- 05_add_question_hierarchy.sql
-- Adds follow-up question support to dbo.Questions for an existing run:
--   1. ParentQuestionId  INT NULL  -> parent question for follow-up questions
--   2. QuestionOrder     INT NULL  -> display order within a group
--   3. Self-referencing FK (ParentQuestionId -> QuestionId)
--   4. Index on ParentQuestionId
-- Idempotent: safe to run more than once. Does not drop or rebuild tables.
-- =====================================================================

USE InterviewDB;
GO

SET NOCOUNT ON;
GO

-- 1) ParentQuestionId
IF COL_LENGTH('dbo.Questions', 'ParentQuestionId') IS NULL
BEGIN
    ALTER TABLE dbo.Questions ADD ParentQuestionId INT NULL;
    PRINT 'Added Questions.ParentQuestionId';
END
GO

-- 2) QuestionOrder
IF COL_LENGTH('dbo.Questions', 'QuestionOrder') IS NULL
BEGIN
    ALTER TABLE dbo.Questions ADD QuestionOrder INT NULL;
    PRINT 'Added Questions.QuestionOrder';
END
GO

-- 3) Self-referencing FK
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_Questions_ParentQuestion' AND parent_object_id = OBJECT_ID('dbo.Questions')
)
BEGIN
    ALTER TABLE dbo.Questions
        ADD CONSTRAINT FK_Questions_ParentQuestion
        FOREIGN KEY (ParentQuestionId) REFERENCES dbo.Questions (QuestionId);
    PRINT 'Added FK_Questions_ParentQuestion';
END
GO

-- 4) Index on ParentQuestionId
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_Questions_ParentQuestionId' AND object_id = OBJECT_ID('dbo.Questions')
)
BEGIN
    CREATE INDEX IX_Questions_ParentQuestionId ON dbo.Questions (ParentQuestionId);
    PRINT 'Added IX_Questions_ParentQuestionId';
END
GO

PRINT 'Question hierarchy migration complete.';
GO