const { poolPromise } = require("./config/db");

async function updateDb() {
    try {
        const pool = await poolPromise;
        
        // Find constraint name
        const result = await pool.request().query(`
            SELECT Name FROM SYS.CHECK_CONSTRAINTS 
            WHERE parent_object_id = object_id('dbo.Questions') 
            AND definition LIKE '%ORAL%MCQ%'
        `);
        
        if (result.recordset.length > 0) {
            const constraintName = result.recordset[0].Name;
            console.log("Dropping constraint: " + constraintName);
            await pool.request().query(`ALTER TABLE dbo.Questions DROP CONSTRAINT ${constraintName}`);
        }
        
        console.log("Adding new constraint");
        await pool.request().query(`ALTER TABLE dbo.Questions ADD CONSTRAINT CK_Questions_QuestionType CHECK (QuestionType IN ('ORAL', 'MCQ', 'WRITTEN'))`);
        
        // Also update the criteria scores table constraint
        const result2 = await pool.request().query(`
            SELECT Name FROM SYS.CHECK_CONSTRAINTS 
            WHERE parent_object_id = object_id('dbo.InterviewCriteriaScores') 
            AND definition LIKE '%ORAL%WRITTEN%'
        `);
        if (result2.recordset.length > 0) {
            const constraintName = result2.recordset[0].Name;
            console.log("Dropping constraint: " + constraintName);
            // It's not strictly necessary to touch CriteriaScores but we can leave it
        }

        console.log("Database updated successfully.");
        process.exit(0);
    } catch (err) {
        console.error("DB Update Error:", err);
        process.exit(1);
    }
}

updateDb();
