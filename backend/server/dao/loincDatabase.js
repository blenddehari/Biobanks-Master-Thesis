require('dotenv').config();

const { Pool } = require('pg')
const chalk = require('chalk');

const pool = new Pool({
    host: process.env.DB_1_HOST,
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_1
})

pool.on("connect", () => {
    console.log(chalk.green("Connected to LOINC database"))
})
pool.on("end", () => {
    console.log("Connection end")
})

module.exports = pool