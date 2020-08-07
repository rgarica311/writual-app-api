const HeroService = {
  getAllHeroStepsByAct(knex, act) {
    console.log(`hero service act ${act.act}`)
    return knex.select('*').from('hero').where({act: act.act}).orderBy('id', 'asc');
  },
}

module.exports = HeroService;
