const NotesService= {
    getAllnotes(db){
        return db('notes').select('*')
    },
    insertNote(db,data){
        return db('notes').insert(data)
            .then(()=>db.raw(`SELECT setval('notes_id_seq',?)`,[notes[notes.length-1].id]))
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

module.exports = NotesService