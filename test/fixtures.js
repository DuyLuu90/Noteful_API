function makeFoldersArray() {
    return [
        {id: 1,name: "Important"},
        {id: 2,name: "Super"},
        {id: 3,name: "Spangley"}
    ]
}
function makeNotesArray() {
    return [
        {
            id: 1,
            name: "Dogs",
            modified: "2019-01-03T00:00:00.000Z",
            folderid: 1,
            content: "Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe. Ut aut doloribus minus non nisi vel corporis. Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad."
          },
          {
            id: 2,
            name: "Cats",
            modified: "2018-08-15T23:00:00.000Z",
            folderid: 2,
            content: "Eos laudantium quia ab blanditiis temporibus necessitatibus. Culpa et voluptas ut sed commodi. Est qui ducimus id. Beatae sint aspernatur error ullam quae illum sint eum. Voluptas corrupti praesentium soluta cumque illo impedit vero omnis nisi.\n \rNam sunt reprehenderit soluta quis explicabo impedit id. Repudiandae eligendi libero ad ut dolores. Laborum nihil sint et labore iusto reiciendis cum. Repellat quos recusandae natus nobis ullam autem veniam id.\n \rEsse blanditiis neque tempore ex voluptate commodi nemo. Velit sapiente at placeat eveniet ut rem. Quidem harum ut dignissimos. Omnis pariatur quas aperiam. Quasi voluptas qui nulla. Iure quas veniam aut quia et."
          },
          {
            id: 3,
            name: "Pigs",
            modified: "2018-03-01T00:00:00.000Z",
            folderid: 3,
            content: "Occaecati dignissimos quam qui facere deserunt quia. Quaerat aut eos laudantium dolor odio officiis illum. Velit vel qui dolorem et.\n \rQui ut vel excepturi in at. Ut accusamus cumque quia sapiente ut ipsa nesciunt. Dolorum quod eligendi qui aliquid sint.\n \rAt id deserunt voluptatem et rerum. Voluptatem fuga tempora aut dignissimos est odio maiores illo. Fugiat in ad expedita voluptas voluptatum nihil."
          }
    ]
}
function makeDataFixtures(){
  const testFolders= makeFoldersArray()
  const testNotes= makeNotesArray()
  return {testFolders,testNotes}
}
function seedDataTables(db,folders,notes) {
  return db.into('folders').insert(folders)
  .then(()=>db.into('notes').insert(notes))
}

function cleanTables(db){
  return db.raw(
    `TRUNCATE
      folders,
      notes
    RESTART IDENTITY CASCADE`
  )
}
/*
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        folders,
        notes
      `
    )
  .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE folders_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE notes_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('folders_id_seq', 0)`),
        trx.raw(`SELECT setval('notes_id_seq', 0)`)
      ])
    )
  )
}
*/

module.exports = {
  makeFoldersArray,
  makeNotesArray,
  makeDataFixtures,
  seedDataTables,
  cleanTables,
}