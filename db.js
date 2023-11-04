const { Pool } = require('pg');
const { createUserTable } = require('./repositories/authQueries');
const { createProcessTable, createProcessParticipantsTable, createCommentsTable, createCommentVisibilityTable } = require('./repositories/processQueries');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

const createTablesInDatabase = async ()=>{
    try {
        await pool.query(createUserTable);
        await pool.query(createProcessTable);
        await pool.query(createProcessParticipantsTable);
        await pool.query(createCommentsTable);
        await pool.query(createCommentVisibilityTable);
    } catch (error) {
        console.log("Error while creating tables: ", error)
        // process.exit(1);
    }
}


module.exports = {pool, createTablesInDatabase};