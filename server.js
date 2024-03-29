const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const passport = require('passport')
const users = require('./routes/api/users')
const roadmap = require('./routes/api/roadmap')
const cors = require('cors')
const app = express()

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)

app.use(bodyParser.json())
app.use(cors())
// DB Config
const db = require('./config/keys').mongoURI
// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useCreateIndex: true }
    )
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.log(err))

// Passport middleware
app.use(passport.initialize())
// Passport config
require('./config/passport')(passport)
// Routes
app.use('/api/roadmap', roadmap)
app.use('/api/users', users)

// Set Static folder
app.use(express.static('client/build'))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

const port = process.env.PORT || 5000 // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`))
