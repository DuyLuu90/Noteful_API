const knex= require('knex');
const NotesService= require('../DB-service/notes-service')

describe.skip('Note service object',()=>{
    let db;
    const testNotes = require('./fixtures').makeNotesArray();
    before('setup db', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL});
    });
    before('clean db', () => db('notes').truncate());
    afterEach('clean db', () => db('notes').truncate());
    after('destroy db connection', () => db.destroy());
    //TESTS
    describe('getAllNotes()',()=>{
        it('return an empty array',()=>{
            return NotesService.getAllnotes(db)
            .then(Notes => expect(Notes).to.eql([]))
        })
        context('with data present',()=>{
            beforeEach('insert test Notes',()=>
            db('notes').insert(testNotes));
            it('return all test notes',()=>{
                return NotesService.getAllnotes(db)
                .then(Notes=>expect(Notes.to.eql(testNotes)))
            })
        })
    })
    describe('insertNote()',()=>{
        it('insert record in db and resolve the new note with an id',()=>{
            const newNote={
                id: 'new id',
                name: 'new name',
                modified: new Date(),
                folderId: '',
                content: 'new content'
            }
            return NotesService.insertNotes(db,newNote)
                .then(actual=>{
                    expect(actual).to.eql({
                        id: newNote.id,
                        name: newNote.name,
                        modified: new Date(newNote.modified),
                        folderId: newNote.folderId,
                        content: newNote.content
                    })
                })
        })
        it('throw not null constrain error if not null columns are not provided',()=>{
            const newNote={};
            return NotesService
                .insertNotes(db,newNote)
                .then(()=>expect.fail('db should throw error'),
                err => expect(err.message).to.include('not-null'))
        })   
    });
    describe('getById()',()=>{
        it('Should return undefined',()=>{
            return NotesService
                .getById(db,999)
                .then(Note=>expect(Note).to.be.undefined)
        })
        context('given notes table has data',()=>{
            beforeEach('insert test Notes',()=>
            db('notes').insert(testNotes));
            it('should return an existing note',()=>{
                const expectNoteId = 3;
                const expectedNote = testNotes.find(a => a.id === expectNoteId);
                return NotesService.getById(db, expectNoteId)
                .then(actual => expect(actual).to.eql(expectedNote));
            })
        })  
    })
    describe('deleteNote()',()=>{
        context('given notes table has data',()=>{
            beforeEach('insert test Notes',()=>
            db('notes').insert(testNotes));
            it('deleteNote()should remove a note by id from notes table',()=>{
                const noteId=3
                return NotesService.deleteNoteById(db,noteId)
                    .then(()=>NotesService.getAllnotes(db))
                    .then(allNotes=>{
                        const expected=testNotes.filter(note=>note.id!==noteId)
                        expect(allNotes).to.eql(expected)
                    })
            })
        })
    })
    describe('updateNote()',()=>{
        context('given notes table has data',()=>{
            beforeEach('insert test Notes',()=>
            db('notes').insert(testNotes));
            it('updateNote() updates a note from notes table',()=>{
                const idOfNoteToUpdate=1
                const newNoteData={
                    name: 'new name',
                    modified: new Date(),
                    folderId: 'new folder id',
                    content: 'new content'
                }
                return NotesService.updateNote(db,idOfNoteToUpdate,newNoteData)
                    .then(()=>NotesService.getById(db,idOfNoteToUpdate))
                    .then(note=>{
                        expect(note).to.eql({
                            id: idOfNoteToUpdate,
                            ...newNoteData
                        })
                    })
                
            })
        })
    })

})