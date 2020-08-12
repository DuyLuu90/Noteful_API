const express= require('express')
const NotesService = require('./notes-service')
const NotesRouter = express.Router()

//MIDDLEWARE 
const {requireAuth}= require('../middleware/basic-auth')

const path= require('path')
const bodyParser = express.json()
const xss= require('xss')
const serializedNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: note.folderid,
    content: xss(note.content)
})

NotesRouter.route('/')
    .all(requireAuth)
    .get((req,res,next)=>{
        NotesService.getAllnotes(req.app.get('db'))
        .then(notes=>res.json(notes.map(serializedNote)))
        .catch(next)
    })
    .post(bodyParser,(req,res,next)=>{
        const requiredFields = ['name','folderid','content']
        for (const field of requiredFields) {
            if(!req.body[field]) {
                //logger.error(`${field} is required`)
                return res.status(400).json({error:{message: `Missing '${field}' in req body`}})}
        }
        const {name,folderid,content}= req.body
        const newNote= {name,folderid,content}
        NotesService.insertNote(req.app.get('db'),newNote)
        .then(Note=>res.status(201).location(path.posix.join(req.originalUrl+`/${Note.id}`))
        .json(serializedNote(Note)))
        .catch(next)
    })

NotesRouter.route(`/:Note_id`)
    .all(requireAuth)
    .all((req,res,next)=>{
        const {Note_id}= req.params
        NotesService.getById(req.app.get('db'),Note_id)
        .then(note=>{
            if(!note) { 
                return res.status(404).json({error:{message: `Requested item doesn't exist`}})}
            res.note= note
            next()
        })
        .catch(next)
    })
    .get((req,res,next)=>{
        res.json(serializedNote(res.note))
    })
    .delete((req,res,next)=>{
        const knexInstance=req.app.get('db')
        NotesService.deleteNoteById(knexInstance,req.params.Note_id)
        .then(()=>res.status(200).json('Success'))
        .catch(next)
    })
    .patch(bodyParser,(req,res,next)=>{
        const knexInstance=req.app.get('db')
        const {name,content,folderid}= req.body
        const noteToUpdate= {name,content,folderid}
        
        const numberOfValues= Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues===0) {
            return res.status(400).json({
                error:{ message: `Req body must contain either'name','content'or 'folderId'`}})
        }
        NotesService.updateNote(knexInstance,req.params.Note_id,noteToUpdate)
        .then(()=>res.status(200).json('Success'))
        .catch(next)
    })

module.exports= NotesRouter 