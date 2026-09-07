-- ============================================================
-- 02_create_tables.sql
-- Creates all tables for InterviewDB.
-- Safe to re-run: each table is created only if it does not exist.
-- ============================================================

USE InterviewDB;
GO

-- ------------------------------------------------------------
-- Users (auth accounts: INTERVIEWER / CANDIDATE)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId          INT IDENTITY(1,1) PRIMARY KEY,
        Username        NVARCHAR(50)  NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(255) NOT NULL,
        FullName        NVARCHAR(100) NULL,
        Role            NVARCHAR(20)  NOT NULL CHECK (Role IN ('INTERVIEWER', 'CANDIDATE')),
        Email           NVARCHAR(255) NULL,
        IsActive        BIT           NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME()
    );
    PRINT 'Created Users';
END
GO

-- ------------------------------------------------------------
-- Candidates
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Candidates', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Candidates (
        CandidateId     INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT          NULL,
        CandidateName   NVARCHAR(100) NOT NULL,
        Email           NVARCHAR(255) NULL,
        Phone           NVARCHAR(30)  NULL,
        Position        NVARCHAR(100) NULL,
        ResumePath      NVARCHAR(500) NULL,
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Candidates_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
    );
    PRINT 'Created Candidates';
END
GO

-- ------------------------------------------------------------
-- Questions (oral + MCQ question bank)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Questions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Questions (
        QuestionId      INT IDENTITY(1,1) PRIMARY KEY,
        QuestionCode    NVARCHAR(30)  NOT NULL UNIQUE,
        QuestionText    NVARCHAR(MAX) NOT NULL,
        QuestionType    NVARCHAR(10)  NOT NULL CHECK (QuestionType IN ('ORAL', 'MCQ')),
        Category        NVARCHAR(50)  NULL,
        Difficulty      NVARCHAR(10)  NOT NULL CHECK (Difficulty IN ('Easy', 'Medium', 'Tough')),
        ExpectedAnswer  NVARCHAR(MAX) NULL,
        WeakAnswer      NVARCHAR(MAX) NULL,
        IsCommon        BIT           NOT NULL DEFAULT 0,
        CreatedBy       INT           NULL,
        IsActive        BIT           NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Questions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users (UserId)
    );
    PRINT 'Created Questions';
END
GO

-- ------------------------------------------------------------
-- QuestionOptions (MCQ choices; IsCorrect must never reach the candidate UI)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.QuestionOptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionOptions (
        OptionId        INT IDENTITY(1,1) PRIMARY KEY,
        QuestionId      INT           NOT NULL,
        OptionLabel     NVARCHAR(5)   NOT NULL,
        OptionText      NVARCHAR(500) NOT NULL,
        IsCorrect       BIT           NOT NULL DEFAULT 0,
        CONSTRAINT FK_QuestionOptions_Questions FOREIGN KEY (QuestionId) REFERENCES dbo.Questions (QuestionId)
    );
    PRINT 'Created QuestionOptions';
END
GO

-- ------------------------------------------------------------
-- CandidateQuestionAssignments (which questions a candidate gets,
-- reuses questions across candidates)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.CandidateQuestionAssignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CandidateQuestionAssignments (
        AssignmentId    INT IDENTITY(1,1) PRIMARY KEY,
        CandidateId     INT           NOT NULL,
        QuestionId      INT           NOT NULL,
        QuestionOrder   INT           NOT NULL DEFAULT 0,
        IsMandatory     BIT           NOT NULL DEFAULT 0,
        AssignedBy      INT           NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Assignments_Candidates FOREIGN KEY (CandidateId) REFERENCES dbo.Candidates (CandidateId),
        CONSTRAINT FK_Assignments_Questions  FOREIGN KEY (QuestionId)  REFERENCES dbo.Questions (QuestionId),
        CONSTRAINT UQ_Assignment_Candidate_Question UNIQUE (CandidateId, QuestionId)
    );
    PRINT 'Created CandidateQuestionAssignments';
END
GO

-- ------------------------------------------------------------
-- Interviews
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Interviews', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Interviews (
        InterviewId     INT IDENTITY(1,1) PRIMARY KEY,
        CandidateId     INT           NOT NULL,
        InterviewerId   INT           NULL,
        InterviewDate   DATE          NOT NULL DEFAULT CAST(SYSDATETIME() AS DATE),
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'NOT_STARTED'
                        CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        OverallScore    INT           NULL,
        OverallComments NVARCHAR(MAX) NULL,
        StartedAt       DATETIME2     NULL,
        CompletedAt     DATETIME2     NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Interviews_Candidates   FOREIGN KEY (CandidateId)   REFERENCES dbo.Candidates (CandidateId),
        CONSTRAINT FK_Interviews_Interviewer  FOREIGN KEY (InterviewerId) REFERENCES dbo.Users (UserId)
    );
    PRINT 'Created Interviews';
END
GO

-- ------------------------------------------------------------
-- InterviewAnswers
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.InterviewAnswers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InterviewAnswers (
        AnswerId        INT IDENTITY(1,1) PRIMARY KEY,
        InterviewId     INT           NOT NULL,
        QuestionId      INT           NOT NULL,
        OptionId        INT           NULL,
        CandidateAnswer NVARCHAR(MAX) NULL,
        InterviewerNotes NVARCHAR(MAX) NULL,
        Score           INT           NULL CHECK (Score IS NULL OR (Score BETWEEN 0 AND 10)),
        IsCorrect       BIT           NULL,
        IsAnswered      BIT           NOT NULL DEFAULT 0,
        AnsweredAt      DATETIME2     NULL,
        CONSTRAINT FK_Answers_Interviews FOREIGN KEY (InterviewId) REFERENCES dbo.Interviews (InterviewId),
        CONSTRAINT FK_Answers_Questions  FOREIGN KEY (QuestionId)  REFERENCES dbo.Questions (QuestionId),
        CONSTRAINT FK_Answers_Options    FOREIGN KEY (OptionId)    REFERENCES dbo.QuestionOptions (OptionId),
        CONSTRAINT UQ_Answer_Interview_Question UNIQUE (InterviewId, QuestionId)
    );
    PRINT 'Created InterviewAnswers';
END
GO

-- ------------------------------------------------------------
-- InterviewCriteriaScores (oral / written criteria, 1-10 each)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.InterviewCriteriaScores', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InterviewCriteriaScores (
        ScoreId         INT IDENTITY(1,1) PRIMARY KEY,
        InterviewId     INT           NOT NULL,
        Category        NVARCHAR(20)  NOT NULL CHECK (Category IN ('ORAL', 'WRITTEN')),
        CriteriaName    NVARCHAR(100) NOT NULL,
        Score           INT           NOT NULL CHECK (Score BETWEEN 0 AND 10),
        Comments        NVARCHAR(MAX) NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_CriteriaScores_Interviews FOREIGN KEY (InterviewId) REFERENCES dbo.Interviews (InterviewId)
    );
    PRINT 'Created InterviewCriteriaScores';
END
GO

PRINT 'All tables created successfully';
GO