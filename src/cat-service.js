const CatService = {
  getAllCatSteps(knex) {
    return knex.select('*').from('cat').orderBy('id', 'asc');
  },
}

module.exports = CatService;
