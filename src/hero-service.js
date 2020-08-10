const HeroService = {
  getAllHeroStepsByAct(knex, act) {
    return knex.select('*').from('hero').where({act: act.act}).orderBy('id', 'asc');
  },
}

module.exports = HeroService;
