const knex = require('knex');
const FoldersService = require('../DB-service/folders-service')


describe.skip('Folders service object', () => {
    let db;
    const testFolders = require('./fixtures').makeFoldersArray();
    before('setup db', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL});
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


