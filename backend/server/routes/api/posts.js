const express = require('express')
const mongodb = require('mongodb')

const router = express.Router()

//Get Posts
router.get('/posts', (req, res) => {
    res.send('hello')
})

//Add Post

//Delete Post

async function loadPostCollection() {

}

module.exports = router