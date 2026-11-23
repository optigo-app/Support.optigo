IF COL_LENGTH(N'dbo.CallLog_Tickets', N'Description') IS NULL
BEGIN
    ALTER TABLE dbo.CallLog_Tickets
        ADD [Description] NVARCHAR(500) NULL;
END
ELSE
BEGIN
    ALTER TABLE dbo.CallLog_Tickets
        ALTER COLUMN [Description] NVARCHAR(500) NULL;
END;
GO
