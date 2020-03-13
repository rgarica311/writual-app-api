const ScenesService = {
    getAllScenes(knex) {
        return knex.select('*').from('scenes')
    }, 

    getProjectScenes(knex, proj, user){
        return knex.select('id', 'project_name', 'act', 'scene_heading', 'thesis', 'antithesis', 'synthesis').from('scenes').where({project_name: proj.replace(/"/g, "'"), user_id: user})
    }
}

module.exports = ScenesService;