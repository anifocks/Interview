-- =====================================================================
-- 04_add_mcq_autoscore.sql
-- Adds automatic MCQ scoring support to an existing InteractiveDB run:
--   1. InterviewAnswers.OptionId   NULL  -> the candidate's selected option
--   2. InterviewAnswers.IsCorrect  NULL  -> auto-graded result (1 = correct, 0 = wrong)
--   3. Relax InterviewAnswers.Score CHECK from 1-10 to 0-10 (0 = wrong MCQ)
--   4. Relax InterviewCriteriaScores.Score CHECK from 1-10 to 0-10 (0 score valid)
--   5. FK InterviewAnswers.OptionId -> QuestionOptions.OptionId
-- Idempotent: safe to run more than once.
-- =====================================================================

IF DB_ID('InterviewDB') IS NOT NULL
    USE InterviewDB;
GO

SET NOCOUNT ON;
GO

-- 1) OptionId
IF COL_LENGTH('dbo.InterviewAnswers', 'OptionId') IS NULL
BEGIN
    ALTER TABLE dbo.InterviewAnswers ADD OptionId INT NULL;
    PRINT 'Added InterviewAnswers.OptionId';
END
GO

-- 2) IsCorrect
IF COL_LENGTH('dbo.InterviewAnswers', 'IsCorrect') IS NULL
BEGIN
    ALTER TABLE dbo.InterviewAnswers ADD IsCorrect BIT NULL;
    PRINT 'Added InterviewAnswers.IsCorrect';
END
GO

-- 3) FK OptionId -> QuestionOptions
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_Answers_Options' AND parent_object_id = OBJECT_ID('dbo.InterviewAnswers')
)
BEGIN
    ALTER TABLE dbo.InterviewAnswers
        ADD CONSTRAINT FK_Answers_Options FOREIGN KEY (OptionId) REFERENCES dbo.QuestionOptions (OptionId);
    PRINT 'Added FK_Answers_Options';
END
GO

-- 4) Relax InterviewAnswers.Score CHECK to allow 0 (drop any existing score check, then re-add named)
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InterviewAnswers') AND name = 'CK_InterviewAnswers_Score'
)
BEGIN
    DECLARE @sql_ans NVARCHAR(MAX) = N'';
    SELECT @sql_ans = @sql_ans + N'ALTER TABLE dbo.InterviewAnswers DROP CONSTRAINT ' + QUOTENAME(name) + N';'
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InterviewAnswers')
      AND name <> 'CK_InterviewAnswers_Score'
      AND definition LIKE '%Score%';
    IF @sql_ans <> N'' EXEC(@sql_ans);

    ALTER TABLE dbo.InterviewAnswers
        ADD CONSTRAINT CK_InterviewAnswers_Score CHECK (Score IS NULL OR (Score BETWEEN 0 AND 10));
    PRINT 'Updated InterviewAnswers.Score CHECK (0-10)';
END
GO

-- 5) Relax InterviewCriteriaScores.Score CHECK to allow 0
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InterviewCriteriaScores') AND name = 'CK_CriteriaScores_Score'
)
BEGIN
    DECLARE @sql_crit NVARCHAR(MAX) = N'';
    SELECT @sql_crit = @sql_crit + N'ALTER TABLE dbo.InterviewCriteriaScores DROP CONSTRAINT ' + QUOTENAME(name) + N';'
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InterviewCriteriaScores')
      AND name <> 'CK_CriteriaScores_Score'
      AND definition LIKE '%Score%';
    IF @sql_crit <> N'' EXEC(@sql_crit);

    ALTER TABLE dbo.InterviewCriteriaScores
        ADD CONSTRAINT CK_CriteriaScores_Score CHECK (Score BETWEEN 0 AND 10);
    PRINT 'Updated InterviewCriteriaScores.Score CHECK (0-10)';
END
GO

PRINT 'MCQ auto-scoring migration complete.';
GO