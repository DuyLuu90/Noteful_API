const knex = require('knex')
const app= require('../src/app')
const {TEST_DATABASE_URL}= require('../src/config');

const {makeDataFixtures,cleanTables,makeFetchRequests,seedDataTables,getTestData}= require('./fixtures');
const {testFolders,testNotes}= makeDataFixtures()


describe('ALL ENDPOINTS',()=>{
    let db;
    before('make db connection', ()=> {
        db= knex( {client: 'pg',connection: TEST_DATABASE_URL} ) 
        app.set('db',db) 
    })
    after ('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> cleanTables(db))
    afterEach ('cleanup', ()=>cleanTables(db))
    
    const endPoints= ['folders','notes']
    endPoints.forEach(endpoint=>{
        const validId=2
        const invalidId=123456
        const {get,post,invalidFetch,validFetch}= makeFetchRequests(endpoint,validId,invalidId)
        const {AllItems,NewItem,UpdatedFields}= getTestData(endpoint)
        

        describe(`ENDPOINT ${endpoint}`,()=>{
            describe(`/api/${endpoint}`,()=>{
                context(`Given no ${endpoint}`,()=>{
                    it(`respond 200 with an empty list`,()=>{
                        return get.expect(200,[])
                    })
                })
                context(`Given there are ${endpoint}`,()=>{
                    beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
                    it(`GET all ${endpoint}`,()=>{
                        return get.expect(200,AllItems)
                    })
                    it(`POST new ${endpoint}`,()=>{
                        return post.send(NewItem).expect(201)
                        .expect(res=>{
                            expect(res.body).to.have.property('id')
                            expect(res.headers.location).to.eql(`/api/${endpoint}/${res.body.id}`)
                            if (endpoint==='notes') expect(res.body).to.have.property('modified')
                        })
                    })
                })
            })
            describe(`/api/${endpoint}/:id`,()=>{
                context(`Given ${endpoint} not found (id: ${invalidId})`,()=>{
                    beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
                    invalidFetch.forEach(obj=>{
                        for (const key in obj){
                            it(`${key}`,()=>{
                                return obj[key].expect(404,{error:{
                                    message: `Requested item doesn't exist`
                                }})
                            })
                        }
                    })
                    
                })
                context(`Given ${endpoint} found`,()=>{
                    beforeEach('insert data',()=>seedDataTables(db,testFolders,testNotes))
                    it(`GET`,()=>{
                        const expectedItem= AllItems.find(item=>item.id===validId)
                        return validFetch.GET.expect(200,expectedItem)
                    })
                    it(`DELETE`,()=>{
                        const expectedItems=AllItems.filter(item=>item.id!==validId)
                        return validFetch.DELETE.expect(200)
                        .then(()=>get.expect(200,expectedItems))
                    })
                    it(`PATCH`,()=>{
                        return validFetch.PATCH.send(UpdatedFields).expect(200)
                        .then(res=>supertest(app).get(`/api/${endpoint}/${validId}`)
                        .set('Authorization',`Basic ${process.env.API_TOKEN}`)
                            .then(row=>{
                                //console.log(row.body)
                                for (const key in UpdatedFields) {
                                    expect(row.body[key]).to.eql(UpdatedFields[key])
                                }
                            })
                        )
                    })
                })
            })
        })
    })
})
