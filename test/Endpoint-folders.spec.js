const knex = require('knex')
const app= require('../src/app')
//const supertest = require('supertest');

const {API_TOKEN, TEST_DB_URL}= require('../src/config');
const supertest = require('supertest');

const testFolders = require('./fixtures').makeFoldersArray();
const cleanTables = require('./fixtures').cleanTables
/*NOTES:
    ()=>{return db().select()} vs ()=> db().select()
*/
describe('folders Endpoints', ()=>{
    let db;
    
    before('make db connection', ()=> {
        db= knex( {client: 'pg',connection: TEST_DB_URL} ) 
        app.set('db',db) 
    })
    before('cleanup', ()=> cleanTables(db))
    afterEach ('cleanup', ()=>cleanTables(db))
    after ('disconnect from db', ()=> db.destroy())
    
    describe('Unauthorize request', ()=>{
        beforeEach('insert test Folders', () =>
            db.into('folders').insert(testFolders));
        const protectedEndpoints= [
            {name:'GET /api/folders',method:supertest(app).get,path:'/api/folders'},
            {name:'POST /api/folders',method:supertest(app).post,path:'/api/folders'},
            {name:'GET /api/folders/:id',method:supertest(app).get,path:'/api/folders/1'},
            {name:'DELETE /api/folders/:id',method:supertest(app).delete,path:'/api/folders/1'},
            {name:'PATCH /api/folders/:id',method:supertest(app).patch,path:'/api/folders/1'},
        ]
        protectedEndpoints.forEach(endPoint=>{
            it(`401 ${endPoint.name}`,()=>{
                return endPoint.method(endPoint.path)
                .expect(401,{error:'Unauthorized request'})
            })
        })
    })
    
    describe(`GET /api/folders`,()=>{
        context('Given no folder',()=>{
            it('responds with 200 and an empty list',()=>{
                return supertest(app).get('/api/folders')
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(200,[])})
        })
        context('Given there are folders in the db',()=>{
            beforeEach('insert test Folders', () =>
                db('folders').insert(testFolders));
            it('responds with 200 and all folders',()=>{
                return supertest(app).get('/api/folders')
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(200,testFolders)})
        })
        
    })

    describe('POST/api/folders',()=>{
        const requiredFields=['id','name']
        requiredFields.forEach(field=>{
            const newFolder={
                id:1,
                name:'new folder'
            }
            it(`respond 400 when ${field} is missing`,()=>{
                delete newFolder[field]
                return supertest(app).post('/api/folders')
                .send(newFolder)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(400,{error:{message: `Missing '${field}' in req body`}})
            })
        })
        
        it('create a folder, responding with 201 and the new folder',()=>{
            const newFolder={id:1, name:'new name'}
            return supertest(app).post('/api/folders')
            .send(newFolder)
            .set('Authorization',`Bearer ${API_TOKEN}`)
            .expect(201)
            .expect(res=>{
                expect(res.body.id).to.eql(newFolder.id)
                expect(res.body.name).to.eql(newFolder.name)
                expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
            })
            .then(postRes=>supertest(app)
                .get(`/api/folders/${postRes.body.id}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(postRes.body))
        })
    })

    describe('Folder /api/folders/:folders_id',()=>{
        beforeEach('insert test Folders', () =>{
            db('folders').insert(testFolders);
        })
        const path= '/api/folders'
        const validId =2
        const invalidId = 123456

        const folderMethods=[
            {name:`GET folderId ${invalidId}`,http: supertest(app).get},
            {name:`DELETE folderId ${invalidId}`,http: supertest(app).delete},
            {name:`PATCH folderId ${invalidId}`,http: supertest(app).patch}
        ]
        context('Given folder does not exist',()=>{
            folderMethods.forEach(method=>{
                it(`Respond 404 when ${method.name}`,()=>{
                    return method.http(`${path}/${invalidId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(404,{error:{message:`Folder doesn't exist`}})
                })
            })
        })
        context('Given folder does exist',()=>{
            it('GET folder',()=>{
                const expectedFolder= testFolders.find(folder=>folder.id===validId)
                return supertest(app).get(`${path}/${validId}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(200,expectedFolder)
            })
            it('DELETE folder',()=>{
                const expectedFolder= testFolders.filter(folder=>folder.id!==validId)
                return supertest(app).delete(`${path}/${validId}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(204)
                .then(()=>{
                    supertest(app).get(`/api/folders`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(200,expectedFolder)
                })
            })
            describe('PATCH folder',()=>{
                const updatedFolder= {
                    name: 'new name'
                }
                it('respond 400 when no required field supplied',()=>{
                    return supertest(app).patch(`${path}/${validId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .send({irrelevantField:'foo'})
                    .expect(400,{
                        error:{ message: `Req body must contain 'name'`}})
                })
                it('respond 204 and update the folder',()=>{
                    const expectedFolder={
                        ...testFolders[validId-1],
                        ...updatedFolder
                    }
                    return supertest(app).patch(`${path}/${validId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .send(updatedFolder)
                    .expect(204)
                    .then(res=>{
                        supertest(app).get(`${path}/${validId}`)
                        .set('Authorization',`Bearer ${API_TOKEN}`)
                        .expect(expectedFolder)
                    })
                })
            })
        })    
    })
})