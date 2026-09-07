-- ============================================================
-- 01_create_database.sql
-- Creates the InterviewDB database for the Interview Portal
-- Run in SQL Server Management Studio (SSMS) as 'sa' or a DBA.
-- ============================================================

IF DB_ID('InterviewDB') IS NULL
BEGIN
    CREATE DATABASE InterviewDB;
    PRINT 'InterviewDB created';
END
ELSE
BEGIN
    PRINT 'InterviewDB already exists';
END
GO

USE InterviewDB;
GO

PRINT 'Database ready: InterviewDB';
GO