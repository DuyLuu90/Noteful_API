const notesService= {
    getAllnotes(db){
        return db('notes').select('*')
    },
    insertNotes(db,data){
        return db('notes')
            .insert(data)
            .returning('*').then(rows=>rows[0])
    },
    getById(db,id){
        return db('notes').select('*')
            .where({id}).first()
    },
    deleteNoteById(db,id){
        return db('notes')
            .where({id}).delete();
    },
    updateNote(db,id,data){
        return db('notes')
            .where({id}).update(data);
    }
}

module.exports = notesService