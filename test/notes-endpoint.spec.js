const knex = require('knex')
const app= require('../src/app')
const testNotes = require('./fixtures').makeNotesArray();

/*NOTES:
    ()=> {return db().select()} vs ()=> db().select()
 */

describe.skip('notes Endpoints', ()=>{
    let db;
    //prepare the db connection using the db var avai in the scope of the primary describe block (it will be availabe in all of our tests)
    before('make knex Instance', ()=> {
        db= knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL}) 
        app.set('db',db)
    })
    before ('cleanup', ()=>db('notes').del()) 
    afterEach ('cleanup', ()=>db('notes').del())
    after ('disconnect from db', ()=> db.destroy())

    describe.skip('Unauthorize request', ()=>{
        beforeEach('insert notes',()=>{
            return db.into('notes').insert(testNotes) 
        })
        afterEach ('cleanup', ()=>db('notes').where({id,name}).delete())
        it('GET /api/notes 401 unauthorized respond', ()=>{
            return supertest(app).get('/api/notes')
                .expect(401,{error:'Unauthorized request'})
        })
        it('POST /api/notes/ 401 unauthorized respond', ()=>{
            return supertest(app).post('/api/notes')
                .expect(401,{error:'Unauthorized request'}) 
        })
        it('GET /api/notes/:id 401 unauthorized respond', ()=>{
            return supertest(app).get('/api/notes/1')
                .expect(401,{error:'Unauthorized request'})
        })
        it('DELETE /api/notes/:id 401 unauthorized respond', ()=>{
            return supertest(app).delete('/api/notes/1')
                .expect(401,{error:'Unauthorized request'})
        }) 
    })
    describe.skip(`GET /api/notes`,()=>{
        context('Given no note',()=>{
            it('responds with 200 and an empty list',()=>{
                return supertest(app).get('api/notes')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,[])})
        })
        context('Given there are notes in the db',()=>{
            beforeEach('insert test notes', () =>
                db('notes').insert(testNotes));
            it('responds with 200 and all notes',()=>{
                return supertest(app).get('api/notes')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,testNotes)})
        })
    })
    describe.skip('GET/api/notes/:notesId',(req,res,next)=>{
        context('Given no notes',()=>{
            it('respond with 404',()=>{
                const noteId= 123456
                return supertest(app)
                    .get(`api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404,{error:{message:`note doesn't exist`}})
            })
        })
        context('Given there are notes in the db', ()=>{
            beforeEach('insert test notes', () =>
                db('notes').insert(testNotes));
            it('responds with 200 and the specified note',()=>{
                const noteId=2
                const expectednote= testNotes[noteId-1]
                return supertest(app).get(`api/notes/${noteId}`)
                        .expect(200,expectednote)
            })
        })  
    })
    describe.skip('POST/api/notes',()=>{
        const requiredFields = ['name','noteId','content']
        requiredFields.forEach(field=>{
            const newItem= {name:'name',noteId:1,content:'content'}
            it(`responds with 400 and an error message when '${field}' is missing`, ()=>{
                delete newItem[field]
                return supertest(app).post('/api/notes')
                .expect(400,{error:{message: `Missing '${field}' in req body`}})
            })
        })
        it('create a note, responding with 201 and the new note',()=>{
            const newNote={name: 'new name',noteId:1, content:'new content'}
            return supertest(app).post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect(res=>{
                expect(res.body.name).to.eql(newNote.name)
                expect(res.body.noteId).to.eql(newNote.noteId)
                expect(res.body.content).to.eql(newNote.content)
                expect(res.headers.location).to.eql(`/api/${res.body.id}`)
            })
            .then(postRes=>supertest(app)
                .get(`/api/notes/${postRes.body.id}`)
                .expect(postRes.body))
        })

    })
    describe.skip('DELETE/api/notes/:notesId',()=>{
        context('Given there are notes in the db', ()=>{
            beforeEach('insert test notes', () =>
                db('notes').insert(testNotes));
            it('responds with 204 and remove the note',()=>{
                const noteId=2
                const expectedNote= testNotes.filter(note=>note.id!==noteId)
                return supertest(app).delete(`api/notes/${noteId}`)
                        .expect(204)
                        .then(res=>supertest(app).get(`api/notes`).expect(expectedNote))
            })
        })  
    })
    describe.skip(`PATCH /api/notes/:id`,()=>{
        context('Given no note',()=>{
            it('respond with 404',()=>{
                const noteId=123456
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404,{error:{message:`note doesn't exist`}})
            })
        })
        context(`Given there are note`,()=>{
            it(`respond with 400 when no required field supplied`,()=>{
                const noteId=2
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({irrelevantField:`foo`})
                    .expect(400,{
                        error: {
                            message: `Req body must contain either 'title','url',or'description'`
                        }
                    })
            })
            it('respond with 204 when updating only a subset',()=>{
                const noteId=2
                const updatednote = {
                    title: 'update note title'
                }
                const expectednote = {
                    ...testnotes[noteId-1],
                    ...updatednote
                }
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({
                        ...updatednote,
                        fieldToIgnore: `should not be in GET response`
                    })
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(expectednote))
            })
            it('respond with 204 and update the note',()=>{
                const noteId=2
                const updatednote ={
                    title: `new title`,
                    url: `http://newwebsite.com`,
                    description: 'new description'
                }
                const expectednote= {
                    ...testnotes[noteId-1],
                    ...updatednote
                }
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(updatednote)
                    .expect(204)
                    .then(res=>supertest(app)
                        .get(`/api/notes/${noteId}`)
                        .expect(expectednote))
            })
        })
    })
})