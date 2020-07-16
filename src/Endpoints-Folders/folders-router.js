const express= require('express')
const FoldersService = require('./folders-service')

const FoldersRouter = express.Router()
const path= require('path')
const bodyParser = express.json()

const xss= require('xss')
const serializedFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

FoldersRouter.route('/')
    .get((req,res,next)=>{
        FoldersService.getAllFolders(req.app.get('db'))
        .then(folders=>res.json(folders.map(serializedFolder)))
        .catch(next)
    })
    .post(bodyParser,(req,res,next)=>{
        const requiredFields= ['id','name']
        for (const field of requiredFields) {
            if(!req.body[field]) {
                //logger.error(`${field} is required`)
                return res.status(400).json({error:{message: `Missing '${field}' in req body`}})}
        }
        /*CAUSE ERROR
        for (const [key,value] of Object.entries(newFolder)) {
            if (value==null) res.status(400).json({error:{message: `Missing '${key}' in req body`}})
        }*/
        const {id,name}= req.body
        const newFolder= {id,name}
        FoldersService.insertFolder(req.app.get('db'), newFolder)
        .then(folder=>{
            res.status(201)
            .location(path.posix.join(req.originalUrl+`/${folder.id}`))
            .json(serializedFolder(folder))
        })
        .catch(next)
    })

FoldersRouter.route(`/:folderId`)
    .all((req,res,next)=>{
        const {folderId}= req.params
        FoldersService.getById(req.app.get('db'),folderId)
        .then(folder=>{
            if(!folder) { 
                return res.status(404).json({error:{message: `Folder doesn't exist`}})
            }
            res.folder= folder
            next()
        })
        .catch(next)
    })
    .get((req,res)=>{
        res.json(serializedFolder(res.folder))
    })
    .delete((req,res,next)=>{
        const knexInstance=req.app.get('db')
        FoldersService.deleteFolderById(knexInstance,req.params.folderId)
        .then(()=>res.status(204).end())
        .catch(next)
    })
    .patch((req,res,next)=>{
        const knexInstance=req.app.get('db')
        const {name}= req.body
        const folderToUpdate= {name}

        const numberOfValues= Object.values(folderToUpdate).filter(Boolean).length
        if (numberOfValues===0) {
            return res.status(400).json({
                error:{ message: `Req body must contain 'name'`}})
        }
        FoldersService.updateFolderById(knexInstance,req.params.folderId,folderToUpdate)
        .then(()=>res.status(204).end())
        .catch(next)
    })

module.exports= FoldersRouter