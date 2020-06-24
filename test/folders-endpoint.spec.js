const knex = require('knex')
const app= require('../src/app')
const testFolders = require('./fixtures').makeFoldersArray();
const {API_TOKEN, TEST_DB_URL}= require('../src/config');
const supertest = require('supertest');

/*NOTES:
    ()=>{return db().select()} vs ()=> db().select()
*/
describe('folders Endpoints', ()=>{
    let db;
    // make it availabe in all of our tests
    before('make knex Instance, aka db connection', ()=> {
        db= knex( {client: 'pg',connection: TEST_DB_URL} ) 
        app.set('db',db) 
    })
    before('cleanup', ()=>{
        db('folders').where({id:4,id:5,id:6}).del()})
    afterEach ('cleanup', ()=>{
        db('folders').where({id:4,id:5,id:6}).del()})

    after ('disconnect from db', ()=> db.destroy())
    
    describe('Unauthorize request', ()=>{
        beforeEach('insert test Folders', () =>
            db('folders').insert(testFolders));
        it('GET',()=>{
            return supertest(app).get('/api/folders')
            .expect(401,{error:'Unauthorized request'})
        })
        it('POST',()=>{
            return supertest(app).post('/api/folders')
            .expect(401,{error:'Unauthorized request'})
        })
        it('GET',(folderId)=>{
            return supertest(app).get(`/api/folders/${folderId}`)
            .expect(401,{error:'Unauthorized request'})
        })
        it('DELETE',(folderId)=>{
            return supertest(app).delete(`/api/folders/${folderId}`)
            .expect(401,{error:'Unauthorized request'})
        })
        it('PATCH',(folderId)=>{
            return supertest(app).patch(`/api/folders/${folderId}`)
            .expect(401,{error:'Unauthorized request'})
        })
    })
    
    describe.skip(`GET /api/folders`,()=>{
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
    describe.skip('GET/api/folders/:folders_id',(req,res,next)=>{
        context('Given no folders',()=>{
            it('respond with 404',()=>{
                const folderId= 123456
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(404,{error:{message:`Folder doesn't exist`}})
            })
        })
        context('Given there are folders in the db', ()=>{
            /*
            beforeEach ('cleanup', ()=>{
                db('folders').truncate()}) 
            beforeEach('insert test Folders', () =>
                db('folders').insert(testFolders));*/
            it('responds with 200 and the specified folder',()=>{
                const folderId=4
                const expectedFolder= testFolders[folderId-1]
                return supertest(app).get(`/api/folders/${folderId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(200,expectedFolder)
            })

        })  
    })
    describe.skip('POST/api/folders',()=>{
        it('create a folder, responding with 201 and the new folder',()=>{
            const newFolder={id: 1, name: 'new name'}
            return supertest(app).post('/')
            .send(newFolder)
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
        it('respond with 400 and an error message when name is missing',()=>{
            const newFolder={id:1}
            return supertest(app).post('/')
            .send(newFolder)
            .expect(400,{error:{message:`Missing name in req body`}})
        })
    })
    describe.skip('DELETE/api/folders/:folders_id',()=>{
        context('Given no folder',()=>{
            it('respond with 404',()=>{
                return supertest(app).delete(`/${folderId}`)
                .expect(404,{error:{message:`Folder not found`}})
            })
        })
        context('Given there are folders in the db', ()=>{
            beforeEach('insert test Folders', () =>
                db('folders').insert(testFolders));
            it('responds with 204 and remove the folder',()=>{
                const folderId=2
                const expectedFolder= testFolders.filter(folder=>folder.id!==folderId)
                return supertest(app).delete(`/${folderId}`)
                        .expect(204)
                        .then(()=>supertest(app).get(`/`)
                        .set('Authorization',`Bearer ${API_TOKEN}`)
                        .expect(expectedFolder))
            })
            
        })  
    })
    describe.skip(`PATCH/api/folders/:folders_id`,()=>{
        context('Given no folders',()=>{
            it(`responds with 404`,()=>{
                const folderId=123456
                return supertest(app).patch(`/${folderId}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(404,{error:{message:`Folder doesn't exist`}})
            })
        })
        context('Given there are bookmarks in the db',()=>{
            beforeEach('insert test Folders', () =>
                db('folders').insert(testFolders));
            it('respond with 204 and updates the folder',()=>{
                const idToUpdate= 2
                const updateFolder = {name: 'new name'}
                const expectedFolder = {...testFolders[idToUpdate-1],...updateFolder}
                return supertest(app)
                    .patch()
                    .send()
                    .expect(204)
                    .then(res=>supertest(app).get(`/${folderId}`)
                        .set('Authorization',`Bearer ${API_TOKEN}`)
                        .expect(expectedFolder))
            })
        })
    })

})