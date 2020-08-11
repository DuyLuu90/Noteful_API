// server controller code: used to start the server listening and connect to db

//FIRST we start the server with node ./src/server.js
const knex= require('knex')
const app= require('./app')
const {PORT, DATABASE_URL} = require('./config')

console.log()

const db = knex({
    client: 'pg',
    connection: DATABASE_URL //'postgresql://dunder_mifflin:password-here@localhost/noteful'
})

//set the property called 'db' and set the knex instance as the value
app.set('db', db)//any req handling middleware can now read the db property to get the knex instance

//the server needs to listen to a specific port so that port wil be correctly routed to the server
app.listen(PORT, ()=> {
    console.log(`Server listening at http://localhost:${PORT}`)
})
