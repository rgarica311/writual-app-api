const knex = require('knex');
const app = require('../src/app');

describe('Hero Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  describe('GET /hero', () => {
    context('Given data exist in database', () => {
      it('responds with 200', () => {
        return supertest(app)
        .get('/hero')
        .expect(200);
      });
    });
  });
});
