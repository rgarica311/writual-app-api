const CatService = {
  getAllCatSteps(knex, act) {
    return knex.select('*').from('cat').where({act: act.act}).orderBy('id', 'asc');
  },
}

module.exports = CatService;
