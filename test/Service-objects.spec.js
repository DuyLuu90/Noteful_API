const knex = require('knex');
const FoldersService = require('../src/Endpoints-Folders/folders-service')
const NotesService= require('../src/Endpoints-Notes/notes-service')


describe.skip('Folders service object', () => {
    let db;
    const testFolders = require('./fixtures').makeFoldersArray();
    before('setup db', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL});
    });
    before('clean db', () => db('folders').truncate());
    afterEach('clean db', () => db('folders').truncate());
    after('destroy db connection', () => db.destroy());
    //TESTS
    describe('getAllFolders()', () => {
        it('returns an empty array', () => {
        return FoldersService.getAllFolders(db)
            .then(Folders => expect(Folders).to.eql([]))
        })
        context('with data present', () => {
            beforeEach('insert test Folders', () =>
                db('folders')
                .insert(testFolders)
            );
            it('returns all test Folders', () => {
                return FoldersService.getAllFolders(db)
                .then(Folders => expect(Folders).to.eql(testFolders));
            });
        });
    });

    describe('insertFolder()' , () => {
        it('inserts record in db and returns Folder with new id', () => {
        const newFolder = { id: 'new id',name: 'Test new name'};
        return FoldersService.insertFolder(db, newFolder)
            .then(actual => { expect(actual)
                .to.eql({id: newFolder.id, name:newFolder.name});
            });
        });
        it('throws not-null constraint error if id or name not provided', () => {  
        const newFolder = {};
        return FoldersService 
            .insertFolder(db, newFolder)
            .then(
            () => expect.fail('db should throw error'),
            err => expect(err.message).to.include('not-null'));
        });
    });
    describe('getById()', () => {
        it('should return undefined', () => {
        return FoldersService
            .getById(db, 999)
            .then(Folder => expect(Folder).to.be.undefined);
        });
        context('Given folders table has data', () => {
            beforeEach('insert Folders', () => 
                db('folders')
                .insert(testFolders)
            );
            it('should return existing Folder', () => {
                const expectedFolderId = 3;
                const expectedFolder = testFolders.find(a => a.id === expectedFolderId);
                return FoldersService.getById(db, expectedFolderId)
                .then(actual => expect(actual).to.eql(expectedFolder));
            });
        });
    });
/*
    describe('deleteFolder()', () => {
        it('should return 0 rows affected', () => {
        return FoldersService
            .deleteFolder(db, 999)
            .then(rowsAffected => expect(rowsAffected).to.eq(0));
        });
        context('with data present', () => {
            beforeEach('insert Folders', () => 
                db('folders').insert(testFolders)
            );
            it('should return 1 row affected and record is removed from db', () => {
                const deletedFolderId = 1;
                return FoldersService
                .deleteFolder(db, deletedFolderId)
                .then(rowsAffected => {
                    expect(rowsAffected).to.eq(1);
                    return db('folders').select('*')})
                .then(actual => {
                    // copy testFolders array with id 1 filtered out
                    const expected = testFolders.filter(a => a.id !== deletedFolderId);
                    expect(actual).to.eql(expected)});
            });
        });
    });

    describe('updateFolder()', () => {
        it('should return 0 rows affected', () => {
        return FoldersService
            .updateFolder(db, 999, { title: 'new title!' })
            .then(rowsAffected => expect(rowsAffected).to.eq(0));
        });

        context('with data present', () => {
            beforeEach('insert Folders', () => 
                db('folders').insert(testFolders)
            );
            it('should successfully update an Folder', () => {
                const updatedFolderId = 1;
                const testFolder = testFolders.find(a => a.id === updatedFolderId);
                // make copy of testFolder in db, overwriting with newly updated field value
                const updatedFolder = { ...testFolder, title: 'New title!' };
                return FoldersService
                .updateFolder(db, updatedFolderId, updatedFolder)
                .then(rowsAffected => {
                    expect(rowsAffected).to.eq(1)
                    return db('folders').select('*').where({ id: updatedFolderId }).first()})
                .then(Folder => {
                    expect(Folder).to.eql(updatedFolder)})
            });
        });
    });*/
});

describe.skip('Notes service object',()=>{
    let db;
    const testNotes = require('./fixtures').makeNotesArray();
    before('setup db', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL});
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

