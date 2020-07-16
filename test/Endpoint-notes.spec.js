const knex = require('knex')
const app= require('../src/app')
//const supertest = require('supertest');

const {API_TOKEN, TEST_DB_URL}= require('../src/config');
const supertest = require('supertest');
const helpers= require('./fixtures');
const { expect } = require('chai');

const {testFolders,testNotes}=helpers.makeDataFixtures

/*NOTES:
    ()=> {return db().select()} vs ()=> db().select()
 */

describe.only('notes Endpoints', ()=>{
    let db;
    before('make db connection', ()=> {
        db= knex( {client: 'pg',connection: TEST_DB_URL} ) 
        app.set('db',db) 
    })
    
    before('cleanup',()=> helpers.cleanTables(db))
    afterEach ('cleanup',()=>helpers.cleanTables(db))
    /*
    before('cleanup', ()=> db('notes').truncate())
    afterEach ('cleanup', ()=>db('notes').truncate())
    */
    after ('disconnect from db', ()=> db.destroy())

    describe('Unauthorize request', ()=>{
        beforeEach('insert test tables', ()=>helpers.seedDataTables(db,testFolders,testNotes));
        const protectedEndpoints= [
            {name:'GET /api/notes',method:supertest(app).get,path:'/api/notes'},
            {name:'POST /api/notes',method:supertest(app).post,path:'/api/notes'},
            {name:'GET /api/notes/:id',method:supertest(app).get,path:'/api/notes/1'},
            {name:'DELETE /api/notes/:id',method:supertest(app).delete,path:'/api/notes/1'},
            {name:'PATCH /api/notes/:id',method:supertest(app).patch,path:'/api/notes/1'},
        ]
        protectedEndpoints.forEach(endPoint=>{
            it(`401 ${endPoint.name}`,()=>{
                return endPoint.method(endPoint.path)
                .expect(401,{error:'Unauthorized request'})
            })
        })
    })

    describe(`GET /api/notes`,()=>{
        context('Given no note',()=>{
            it('responds with 200 and an empty list',()=>{
                return supertest(app).get('api/notes')
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .expect(200,[])})
        })
        context('Given there are notes',()=>{
            beforeEach('insert test tables', ()=>helpers.seedDataTables(db,testFolders,testNotes));
            it('responds with 200 and all notes',()=>{
                return supertest(app).get('api/notes')
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .expect(200,testNotes)})
        })
    })

    describe('POST/api/notes',()=>{
        const requiredFields = ['name','folderid','content']
        requiredFields.forEach(field=>{
            const newNote= {name:'new name',folderid:1,content:'new content'}
            it.only(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                delete newNote[field]
                return supertest(app).post('/api/notes')
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .expect(400,{error:{message: `Missing '${field}' in req body`}})
            })
        })
        it('create a note, responding with 201 and the new note',()=>{
            const newNote={name: 'new name',folderid:1, content:'new content'}
            return supertest(app).post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect(res=>{
                expect(res.body.name).to.eql(newNote.name)
                expect(res.body.folderid).to.eql(newNote.folderid)
                expect(res.body.content).to.eql(newNote.content)
                expect(res.body).to.have.property('id')
                expect(res.body).to.have.property('modified')
                expect(res.headers.location).to.eql(`/api/${res.body.id}`)
            })
            .then(postRes=>supertest(app)
                .get(`/api/notes/${postRes.body.id}`)
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .expect(postRes.body))
        })

    })

    describe(`NOTE /api/notes/:noteId`,()=>{
        beforeEach('insert test tables', ()=>helpers.seedDataTables(db,testFolders,testNotes));
        const path= '/api/notes'
        const validId =2
        const invalidId = 123456

        const noteMethods=[
            {name:`GET noteId ${invalidId}`,http: supertest(app).get},
            {name:`DELETE noteId ${invalidId}`,http: supertest(app).delete},
            {name:`PATCH noteId ${invalidId}`,http: supertest(app).patch}
        ]
        context('Given note does not exist',()=>{
            noteMethods.forEach(method=>{
                it(`Respond 404 when ${method.name}`,()=>{
                    return method.http(`${path}/${invalidId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(404,{error:{message:`Note doesn't exist`}})
                })
            })
        })
        context('Given note does exist',()=>{
            it('GET note',()=>{
                const expectedNote=testNotes.find(note=>note.id===validId)
                return supertest(app).get(`${path}/${validId}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(200,expectedNote)
            })
            it('DELETE note',()=>{
                const expectedNote=testNotes.filter(note=>note.id!==validId)
                return supertest(app).delete(`${path}/${validId}`)
                .set('Authorization',`Bearer ${API_TOKEN}`)
                .expect(204)
                ,then(()=>{
                    supertest(app).get(`${path}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .expect(expectedNote)
                })
            })
            describe.only('PATCH note',()=>{
                it('respond 400 when no required fields supplied',()=>{
                    return supertest(app).patch(`${path}/${validId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .send({irrelevantField:'foo'})
                    .expect(400,{
                        error:{ message: `Req body must contain either'name','content'or 'folderId'`}})
                })
                it('respond 204 and update only a subset',()=>{
                    const updatedNote= {
                        name: 'updated name'
                    }
                    const expectedNote={
                        ...testNotes[validId-1],
                        ...updatedNote
                    }
                    return supertest(app).patch(`${path}/${validId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .send({
                        ...updatedNote,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`${path}/${validId}`)
                        .set('Authorization',`Bearer ${API_TOKEN}`)
                        .expect(expectedNote))

                })
                it('respond 204 and update the note',()=>{
                    const updatedNote= {
                        name: 'new name',
                        folderid: 1,
                        content: 'new content'
                    }
                    const expectedNote={
                        ...testNotes[validId-1],
                        ...updatedNote
                    }
                    return supertest(app).patch(`${path}/${validId}`)
                    .set('Authorization',`Bearer ${API_TOKEN}`)
                    .send(updatedNote)
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`${path}/${validId}`)
                        .set('Authorization',`Bearer ${API_TOKEN}`)
                        .expect(expectedNote))
                })
                /*
                const testCases= [
                    {
                        name: 'update only a subset',
                        updatedNote: {name: 'new name'},
                        expectedNote: {...testNotes[validId-1],...this.updatedNote}
                    },
                    {
                        name: 'update a note',
                        updatedNote: {
                            name: 'new name',
                            folderid: 1,
                            content: 'new content'
                        },
                        expectedNote: {...testNotes[validId-1],...this.updatedNote}
                    }
                ]
                testCases.forEach(test=>{
                    it(`respond 204 and ${test.name}`,()=>{

                    })
                })*/
            })
            
        })
    })
})