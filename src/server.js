const knex = require('knex')
const app = require('./app')

const { PORT, DATABASE_URL } = require('./config')


console.log('database url', DATABASE_URL)

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

app.set('db', db)
