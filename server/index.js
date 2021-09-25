const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

//Middleware
app.use(bodyParser.json())
app.use(cors())

const posts = require('./routes/api/posts')
const datasets = require('./routes/api/demo')


app.use('/api', datasets)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server started on port ${port}`))