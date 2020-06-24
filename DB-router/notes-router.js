const express= require('express')
const xss= require('xss')
const NotesService = require('../DB-service/notes-service')
const NotesRouter = express.Router()
const bodyParser = express.json()

const serializedNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folderId,
    content: xss(note.content)
})

//req.app.get('db)= const knexInstance

NotesRouter.route('/')
    .get((req,res,next)=>{
        NotesService.getAllnotes(req.app.get('db'))
        .then(notes=>res.json(notes.map(serializedNote)))
        .catch(next)
    })
    .post(bodyParser,(req,res,next)=>{
        const {name,folderId,content}= req.body
        const newNote= {name,folderId,content}
        for (const [key,value] of Object.entries(newNote)) {
            if (value==null) res.status(400).json({error:{message: `Missing '${key}' in req body`}})
        }
        NotesService.insertNote(req.app.get('db'),newNote)
        .then(Note=>res.status(201).location(`/api/notes/${Note.id}`)
        .json(serializedNote(Note)))
        .catch(next)
    })

NotesRouter.route(`/:Note_id`)
    .get((req,res,next)=>{
        const knexInstance=req.app.get('db')
        NotesService.getById(knexInstance,req.params.Note_id)
        .then(Note=>{
            if(!Note) res.status(404).json({error:{message: `Note doesn't exist`}})
            res.json(serializedNote(Note))
        })
        .catch(next)
    })
    .delete((req,res,next)=>{
        const knexInstance=req.app.get('db')
        NotesService.deleteNoteById(knexInstance,req.params.Note_id)
        .then(()=>res.status(204).end())
        .catch(next)
    })

module.exports= NotesRouter 