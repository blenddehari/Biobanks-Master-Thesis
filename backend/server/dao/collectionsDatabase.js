const { Pool } = require('pg')
const chalk = require('chalk');


const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    database: "collection-manager"
})

pool.on("connect", () => {
    console.log(chalk.green("Connected to Collection-Manager database"))
})
pool.on("end", () => {
    console.log("Connection end")
})

module.exports = pool