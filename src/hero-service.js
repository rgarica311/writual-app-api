const HeroService = {
  getAllHeroSteps(knex) {
    return knex.select('*').from('hero').orderBy('id', 'asc');
  },
}

module.exports = HeroService;
