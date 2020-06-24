const FoldersService= {
    getAllFolders(db){
        return db('folders').select('*')
    },
    insertFolder(db,data){
        return db('folders')
            .insert(data)
            .returning('*').then(rows=>rows[0])
    },
    getById(db,id){
        return db('folders').select('*')
            .where({id}).first()
    },
    deleteFolderById(db,id){
        return db('folders')
            .where({id}).delete();
    },
    updateFolderById(db,id,data){
        return db('folders')
            .where({id}).update(data);
    }
}

module.exports = FoldersService
