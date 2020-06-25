const AnatomyService = {
  getAllAnatomySteps(knex, act) {
    return knex.select('*').from('anatomy').where({act: act.act}).orderBy('id', 'asc');
  },
}

module.exports = AnatomyService;
