//SETUP
require('dotenv').config() // allow us to get access to variables inside the env file
const express= require('express')
const morgan= require('morgan') // midleware, used for logging request details
const cors = require('cors')
const helmet= require('helmet')
const {NODE_ENV, API_TOKEN}= require('./config')

//const logger=require('./logger')

const foldersRouter= require('./Endpoints-Folders/folders-router')
const notesRouters=require('./Endpoints-Notes/notes-router')

// CREATE AN EXPRESS APP and gives us access to the other express objects, provides methods to route HTTP requests, configure middleware and other functionality
const app= express()

//MIDDLEWARES
//app.use(express.json())//parse the body and give us a properly formatted obj
/*
const morganSetting=(NODE_ENV === 'production'? 'tiny': 'common')
app.use(morgan(morganSetting)) */
app.use(helmet())
app.use(cors())


//Authorization

app.use((req,res,next)=>{
    const userAuth= req.get('Authorization')
    if(!userAuth || userAuth.split(' ')[1] !== API_TOKEN) {
        //logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({error: "Unauthorized request"})}
    next();
})

//BUILD AN API with HTTP requests (getAll+getById+Post+Delete)
app.use('/api/folders',foldersRouter) 
app.use('/api/notes',notesRouters)

//Error handling
app.use((error, req,res, next)=>{
    let response;
    if (NODE_ENV === 'production') {
        response= {error: {message: 'server error'}}
    }
    response={message: error.message, error}
    console.log(response)
    res.status(500).json(response)
})

//XSS example:
/*
app.get('/xss', (req, res) => {
    res.cookie('secretToken', '1234567890');
    res.sendFile(__dirname + '/drills/xss-example.html');
});*/

module.exports = app 