const FrameworksService = {
  getAllFrameworks(knex) {
    return knex.select('*').from('frameworks').orderBy('id', 'asc');
  },
}

module.exports = FrameworksService;
