const AnatomyService = {
  getAllAnatomySteps(knex) {
    return knex.select('*').from('anatomy').orderBy('id', 'asc');
  },
}

module.exports = AnatomyService;
