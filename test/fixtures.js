const app= require('../src/app')

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
function makeNewItem(){
  const folders= makeFoldersArray()
  const newFolder= {"name":"New Folder"}
  const newNote={"name":"New Note","folderid": folders[0].id,"content":"new content"}
  return {newFolder,newNote}
}
function makeUpdatedItem(){
  const folder= {"name":"Updated Name"}
  const note= {"name":"Updated name"}
  return {folder,note}
}
function makeDataFixtures(){
  const testFolders= makeFoldersArray()
  const testNotes= makeNotesArray()
  return {testFolders,testNotes}
}
function getTestData(name){
  const {testFolders,testNotes}= makeDataFixtures()
  const {newFolder,newNote}= makeNewItem()
  const {folder,note}= makeUpdatedItem()
  const array=[
    {db:"folders",all: testFolders,newItem:newFolder, updatedFields:folder},
    {db:"notes", all: testNotes,newItem: newNote,updatedFields:note}
  ]
  const obj=array.find(obj=>obj.db===name)||{all:[],newItem:{},updatedFields:{}}
  
  const AllItems=obj.all
  const NewItem=obj.newItem
  const UpdatedFields=obj.updatedFields
  return {AllItems,NewItem,UpdatedFields}
}
function seedTable(db,dbName,items){
  return db.into(dbName).insert(items)
      .then(()=>db.raw(
          `SELECT setval('${dbName}_id_seq',?)`,
          [items[items.length-1].id]
      ))
}
function seedDataTables(db,folders,notes) {
  return seedTable(db,'folders',folders)
    .then(()=>seedTable(db,'notes',notes))
}
function cleanTables(db){
  return db.raw(
    `TRUNCATE
      notes,
      folders
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
function makeFetchRequests(endpoint,valid,invalid){
  const token= `Basic ${process.env.API_TOKEN}`
  const get= supertest(app).get(`/api/${endpoint}`).set('Authorization',token)
  const post= supertest(app).post(`/api/${endpoint}`).set('Authorization',token)
  const invalidFetch=[
      {GET: supertest(app).get(`/api/${endpoint}/${invalid}`).set('Authorization',token)},
      {DELETE: supertest(app).delete(`/api/${endpoint}/${invalid}`).set('Authorization',token)},
      {PATCH: supertest(app).patch(`/api/${endpoint}/${invalid}`).set('Authorization',token)}
  ]
  const validFetch={
      GET: supertest(app).get(`/api/${endpoint}/${valid}`).set('Authorization',token),
      DELETE: supertest(app).delete(`/api/${endpoint}/${valid}`).set('Authorization',token),
      PATCH: supertest(app).patch(`/api/${endpoint}/${valid}`).set('Authorization',token)
  }

  return {get,post,invalidFetch,validFetch}
}

module.exports = {
  makeFoldersArray,
  makeNotesArray,
  makeDataFixtures,
  seedDataTables,
  cleanTables,
  makeFetchRequests,
  getTestData,
}