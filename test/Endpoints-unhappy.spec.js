const knex = require('knex')
const app= require('../src/app')
const {TEST_DATABASE_URL,API_TOKEN}= require('../src/config');

const {makeDataFixtures,cleanTables,seedDataTables}= require('./fixtures');
const {testFolders,testNotes}= makeDataFixtures()

describe(`UNHAPPY PATHS`,()=>{
    let db;
    before('make db connection', ()=> {
        db= knex( {client: 'pg',connection: TEST_DATABASE_URL} ) 
        app.set('db',db) 
    })
    after ('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> cleanTables(db))
    afterEach ('cleanup', ()=>cleanTables(db))

    describe('Unauthorized request',()=>{
        beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
        const endPoints= ['folders','notes']
        endPoints.forEach(endpoint=>{
            const protected=[
                {name:`POST /api/${endpoint}`,method:supertest(app).post,path:`/api/${endpoint}`},
                {name:`DELETE /api/${endpoint}/1`,method:supertest(app).delete,path:`/api/${endpoint}/1`},
                {name:`PATCH /api/${endpoint}/1`,method:supertest(app).patch,path:`/api/${endpoint}/1`},
            ]
            protected.forEach(endPoint=>{
                it(`401 ${endPoint.name}`,()=>{
                    return endPoint.method(endPoint.path)
                    .expect(401,{error:'Unauthorized request'})
                })
            })
        })
    })
    describe(`FOLDER endpoint`,()=>{
        beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
        describe(`POST`,()=>{
            const requiredFields=['name']
            requiredFields.forEach(field=>{
                const newFolder={name:'new folder'}
                it(`respond 400 when ${field} is missing`,()=>{
                    delete newFolder[field]
                    return supertest(app).post('/api/folders')
                    .send(newFolder)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(400,{error:{message: `Missing '${field}' in req body`}})
                })
            })
        })
        describe(`PATCH`,()=>{
            it('respond 400 when no required fields supplied',()=>{
                return supertest(app).patch('/api/folders/1')
                    .send({irrelevantField:'foo'})
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(400,{error:{message: `Req body must contain 'name'`}})
            })
        })
    })
    describe(`NOTE endpoint`,()=>{
        beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
        describe(`POST`,()=>{
            const requiredFields = ['name','folderid','content']
            requiredFields.forEach(field=>{
                const newNote= {'name':'new name','folderid':1,'content':'new content'}
                it(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                    delete newNote[field]
                    return supertest(app).post('/api/notes')
                    .set('Authorization', `Bearer ${API_TOKEN}`).send(newNote)
                    .expect(400,{error:{message: `Missing '${field}' in req body`}})
                })
            })
        })
        describe(`PATCH`,()=>{
            it('respond 400 when no required fields supplied',()=>{
                return supertest(app).patch('/api/notes/1')
                    .send({irrelevantField:'foo'})
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(400,{error:{message: `Req body must contain either'name','content'or 'folderId'`}})
            })
        })
    })

    
})