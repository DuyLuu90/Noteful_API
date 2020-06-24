const path= require('path')
const express= require('express')
const xss= require('xss')
const FoldersService = require('../DB-service/folders-service')

const FoldersRouter = express.Router()
const bodyParser = express.json()

const serializedFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

//req.app.get('db)= const knexInstance
FoldersRouter.route('/')
    .get((req,res,next)=>{
        FoldersService.getAllFolders(req.app.get('db'))
        .then(folders=>res.json(folders.map(serializedFolder)))
        .catch(next)
    })
    .post(bodyParser,(req,res,next)=>{
        const {id,name}= req.body
        const newFolder= {id,name}
        for (const [key,value] of Object.entries(newFolder)) {
            if (value==null) res.status(400).json({error:{message: `Missing '${key}' in req body`}})
        }
        FoldersService.insertFolder(req.app.get('db'),newFolder)
        .then(folder=>res.status(201).location(path.posix.join(req.originalUrl+`${folder.id}`))
        .json(serializedFolder(folder)))
        .catch(next)
    })

FoldersRouter.route(`/:folder_id`)
    .get((req,res,next)=>{
        const knexInstance=req.app.get('db')
        FoldersService.getById(knexInstance,req.params.folder_id)
        .then(folder=>{
            if(!folder) { 
                console.log('folder does not exist')
                return res.status(404).json({error:{message: `Folder doesn't exist`}})}
            res.json(serializedFolder(folder))
        })
        .catch(next)
    })
    .delete((req,res,next)=>{
        const knexInstance=req.app.get('db')
        FoldersService.deleteFolderById(knexInstance,req.params.folder_id)
        .then(()=>res.status(204).end())
        .catch(next)
    })
    .patch((req,res,next)=>{
        const knexInstance=req.app.get('db')
        FoldersService.updateFolderById(knexInstance,req.params.folder_id)
        .then(folder=>{
            if(!folder) res.status(404).json({error:{message: `Folder doesn't exist`}}).end()
            else res.json(serializedFolder(folder))
        })
        .catch(next)
    })

module.exports= FoldersRouter