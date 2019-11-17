const knex = require('knex');
const app = require('../src/app');

describe('frameworks Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  describe('GET /frameworks', () => {
    context('Given frameworks exist in database', () => {
      it('responds with 200 and all the frameworks', () => {
        return supertest(app)
        .get('/frameworks')
        .expect(200);
      });
    });
  });
});
